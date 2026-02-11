const orderService = require("../services/orderService");
const { getInvoiceFilePath, invoiceExists } = require("../utils/invoiceGenerator");
const User = require("../models/user");
const fs = require("fs");
const path = require("path");

const orderController = {
  async createOrder(req, res) {
    const { items, paymentMethod } = req.body;
    try {
      // Validate required fields
      if (!items || items.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      if (!paymentMethod || !["CARD", "Cash-On-Delivery"].includes(paymentMethod)) {
        return res.status(400).json({ error: "Invalid payment method" });
      }

      // Get authenticated user ID from JWT token
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: User ID not found" });
      }

      // Fetch user details from database
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Build customer details from user's signup account
      const customerDetails = {
        customerName: user.name,
        customerPhone: user.phone_number,
        customerEmail: user.email,
        deliveryAddress: `${user.address || ""}, ${user.district || ""}, ${user.province || ""}, ${user.postal_code || ""}`.trim(),
      };

      // Validate that required customer details exist
      if (!customerDetails.customerName || !customerDetails.customerPhone || !customerDetails.deliveryAddress) {
        return res.status(400).json({
          error: "Incomplete user profile: Please ensure your account has name, phone number, and address information",
        });
      }

      const order = await orderService.createOrder(
        userId,
        items,
        paymentMethod,
        customerDetails
      );
      res.status(201).json({
        success: true,
        orderId: order.orderId,
        invoiceNo: order.invoiceNo,
        totalPrice: order.totalPrice,
        status: order.status,
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(400).json({ error: error.message });
    }
  },

  async cancelOrder(req, res) {
    const { orderId } = req.body;
    try {
      await orderService.cancelOrder(orderId);
      res.status(200).send({ message: "Order cancelled" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getOrder(req, res) {
    const { orderId } = req.body;
    try {
      const order = await orderService.getOrder(orderId);
      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrdersByUserId(req, res) {
    const { userId } = req.body;
    try {
      const orders = await orderService.getOrdersByUserId(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    const { orderId, newStatus } = req.body;
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      res.status(200).send({ message: "Order status updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  /**
   * Get invoice PDF by invoice number
   * Streams the PDF file or generates it on request
   */
  async getInvoicePDF(req, res) {
    const { invoiceNo } = req.params;

    try {
      // Validate invoice exists
      const order = await orderService.getOrderByInvoiceNo(invoiceNo);
      if (!order) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Check if PDF file exists
      const filePath = getInvoiceFilePath(invoiceNo);
      if (!fs.existsSync(filePath)) {
        // Regenerate PDF if it doesn't exist
        const { generateInvoicePDF } = require("../utils/invoiceGenerator");
        await generateInvoicePDF(order, order.OrderItems);
      }

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${invoiceNo}.pdf"`
      );

      // Stream the PDF file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        res.status(500).json({ error: "Error reading invoice file" });
      });
    } catch (error) {
      console.error("Invoice PDF error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Download invoice PDF (forces download instead of inline display)
   */
  async downloadInvoicePDF(req, res) {
    const { invoiceNo } = req.params;

    try {
      // Validate invoice exists
      const order = await orderService.getOrderByInvoiceNo(invoiceNo);
      if (!order) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      // Check if PDF file exists
      const filePath = getInvoiceFilePath(invoiceNo);
      if (!fs.existsSync(filePath)) {
        // Regenerate PDF if it doesn't exist
        const { generateInvoicePDF } = require("../utils/invoiceGenerator");
        await generateInvoicePDF(order, order.OrderItems);
      }

      // Set headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${invoiceNo}.pdf"`
      );

      // Stream the PDF file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on("error", (error) => {
        console.error("File stream error:", error);
        res.status(500).json({ error: "Error reading invoice file" });
      });
    } catch (error) {
      console.error("Invoice download error:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get invoice details (metadata only, not the PDF)
   */
  async getInvoiceDetails(req, res) {
    const { invoiceNo } = req.params;

    try {
      const order = await orderService.getOrderByInvoiceNo(invoiceNo);
      if (!order) {
        return res.status(404).json({ error: "Invoice not found" });
      }

      res.status(200).json({
        invoiceNo: order.invoice_no,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerEmail: order.customer_email,
        deliveryAddress: order.delivery_address,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total_price,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        orderStatus: order.status,
        orderDate: order.order_date,
        items: order.OrderItems,
      });
    } catch (error) {
      console.error("Invoice details error:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = orderController;
