const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Payment = require("../models/payment");
const User = require("../models/user");
const Cart = require("../models/cart");
const sequelize = require("../config/database");
const ProductImage = require("../models/productImage");
const { generateInvoicePDF } = require("../utils/invoiceGenerator");

/**
 * Generate a unique invoice number
 * Format: INV-YYYYMMDD-XXXX (where XXXX is a random 4-digit number)
 */
const generateInvoiceNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const invoiceNo = `INV-${dateStr}-${randomStr}`;

  // Check if this invoice number already exists
  const existing = await Order.findOne({ where: { invoice_no: invoiceNo } });
  if (existing) {
    // Recursively generate a new one if collision occurs (very rare)
    return generateInvoiceNumber();
  }

  return invoiceNo;
};

const orderService = {
  async createOrder(
    userId,
    items,
    paymentMethod,
    customerDetails
  ) {
    return await sequelize.transaction(async (t) => {
      let subtotal = 0;
      const products = [];

      // Validate and fetch all products
      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product || product.stock_quantity < item.quantity) {
          throw new Error(
            `Product ${product ? product.name : "Unknown"} has insufficient stock. Available: ${
              product ? product.stock_quantity : 0
            }`
          );
        }
        subtotal += product.price * item.quantity;
        products.push(product);
      }

      // Calculate totals
      const shipping = 0; // Free shipping for all products
      const tax = 0; // Tax is already included in product price
      const discount = customerDetails.discount || 0;
      const totalPrice = subtotal + shipping + tax - discount;

      // Generate unique invoice number
      const invoiceNo = await generateInvoiceNumber();

      // Create order with all invoice details
      const order = await Order.create(
        {
          invoice_no: invoiceNo,
          user_id: userId,
          customer_name: customerDetails.customerName,
          customer_phone: customerDetails.customerPhone,
          customer_email: customerDetails.customerEmail || "",
          delivery_address: customerDetails.deliveryAddress,
          subtotal: subtotal,
          tax: tax,
          shipping: shipping,
          discount: discount,
          total_price: totalPrice,
          payment_method: paymentMethod,
          payment_status:
            paymentMethod === "CARD" ? "Completed" : "Pending",
          status: "Pending",
          order_date: new Date(),
        },
        { transaction: t }
      );

      // Create order items with unit prices
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const product = products[i];
        const unitPrice = parseFloat(product.price);
        const lineTotal = unitPrice * item.quantity;

        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal_price: lineTotal,
          },
          { transaction: t }
        );

        // Update product stock
        await product.update(
          {
            stock_quantity: product.stock_quantity - item.quantity,
          },
          { transaction: t }
        );
      }

      // Create payment record
      await Payment.create(
        {
          order_id: order.id,
          user_id: userId,
          amount: totalPrice,
          payment_status:
            paymentMethod === "CARD" ? "Completed" : "Pending",
          payment_method: paymentMethod,
        },
        { transaction: t }
      );

      // Clear the cart for this user
      if (userId) {
        for (const item of items) {
          await Cart.destroy(
            {
              where: {
                user_id: userId,
                product_id: item.productId,
              },
            },
            { transaction: t }
          );
        }
      }

      // Fetch complete order with items for PDF generation
      const completeOrder = await Order.findByPk(order.id, {
        include: [
          {
            model: OrderItem,
            include: [Product],
          },
        ],
        transaction: t,
      });

      // Generate and save PDF invoice
      try {
        const pdfResult = await generateInvoicePDF(
          completeOrder,
          completeOrder.OrderItems
        );
        
        // Update order with invoice path
        await order.update(
          { invoice_path: pdfResult.filePath },
          { transaction: t }
        );
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        // Continue even if PDF generation fails
      }

      return {
        orderId: order.id,
        invoiceNo: order.invoice_no,
        totalPrice: totalPrice,
        status: order.status,
      };
    });
  },

  async cancelOrder(orderId) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const createdAt = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDifference = (currentTime - createdAt) / (1000 * 60 * 60);

    if (timeDifference > 24) {
      throw new Error("Order cannot be canceled after 24 hours");
    }

    return await sequelize.transaction(async (t) => {
      const orderItems = await OrderItem.findAll({
        where: { order_id: orderId },
      });

      for (const item of orderItems) {
        const product = await Product.findByPk(item.product_id);
        await product.update(
          {
            stock_quantity: product.stock_quantity + item.quantity,
          },
          { transaction: t }
        );
      }

      await Order.update(
        { is_deleted: true },
        { where: { id: orderId }, transaction: t }
      );
      await Payment.update(
        { is_deleted: true },
        { where: { order_id: orderId }, transaction: t }
      );
    });
  },

  async getOrder(orderId) {
    return await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
        Payment,
        User,
      ],
    });
  },

  async getOrderByInvoiceNo(invoiceNo) {
    return await Order.findOne({
      where: { invoice_no: invoiceNo, is_deleted: false },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
        Payment,
        User,
      ],
    });
  },

  async getAllOrders() {
    return await Order.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
          ],
        },
        {
          model: Payment,
        },
        {
          model: User,
        },
      ],
    });
  },

  async getOrdersByUserId(userId) {
    return await Order.findAll({
      where: { user_id: userId, is_deleted: false },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
            },
          ],
        },
        {
          model: Payment,
        },
      ],
    });
  },

  async updateOrderStatus(orderId, newStatus) {
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    const createdAt = new Date(order.createdAt);
    const currentTime = new Date();
    const timeDifference = (currentTime - createdAt) / (1000 * 60 * 60);

    if (timeDifference < 24) {
      return {
        success: false,
        message: "Order status cannot be updated within 24 hours of creation.",
      };
    }

    return await sequelize.transaction(async (t) => {
      // Update order status
      await order.update({ status: newStatus }, { transaction: t });

      // If order status is changed to "Delivered", update payment status to "Completed"
      if (newStatus === "Delivered") {
        await Payment.update(
          { payment_status: "Completed" },
          { where: { order_id: orderId }, transaction: t }
        );
      }

      return { success: true, message: "Order status updated successfully." };
    });
  },
};

module.exports = orderService;
