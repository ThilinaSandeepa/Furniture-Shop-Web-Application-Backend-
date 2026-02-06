const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Payment = require("../models/payment");
const User = require("../models/user");
const Cart = require("../models/cart");
const sequelize = require("../config/database");
const ProductImage = require("../models/productImage");

const orderService = {
  async createOrder(userId, items, paymentMethod) {
    return await sequelize.transaction(async (t) => {
      let totalPrice = 0;

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        if (!product || product.stock_quantity < item.quantity) {
          throw new Error(
            `Product ${product.name} has insufficient stock. Available: ${product.stock_quantity}`
          );
        }
        totalPrice += product.price * item.quantity;
      }

      const order = await Order.create(
        {
          user_id: userId,
          total_price: totalPrice,
          status: "Pending",
        },
        { transaction: t }
      );

      for (const item of items) {
        const product = await Product.findByPk(item.productId);
        await OrderItem.create(
          {
            order_id: order.id,
            product_id: item.productId,
            quantity: item.quantity,
            subtotal_price: product.price * item.quantity,
          },
          { transaction: t }
        );

        await product.update(
          {
            stock_quantity: product.stock_quantity - item.quantity,
          },
          { transaction: t }
        );
      }

      const paymentStatus = paymentMethod === "CARD" ? "Completed" : "Pending";
      await Payment.create(
        {
          order_id: order.id,
          user_id: userId,
          amount: totalPrice,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
        },
        { transaction: t }
      );

      // UPDATE: Remove ordered items from user's cart after successful order creation
      // This ensures cart is cleared when order is placed via card or other payment methods
      // Using transaction to maintain data consistency
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

      return order;
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

    await order.update({ status: newStatus });
    return { success: true, message: "Order status updated successfully." };
  },
};

module.exports = orderService;
