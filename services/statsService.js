const { Op } = require("sequelize");
const User = require("../models/user");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Payment = require("../models/payment");
const sequelize = require("../config/database");

const stats = {
  async getTotalCustomers() {
    return await User.count({ where: { role: "User", is_deleted: false } });
  },

  async getTotalOrders() {
    return await Order.count({ where: { is_deleted: false, status: "Delivered" } });
  },

  async getTotalMonthlyRevenue() {
    const currentYear = new Date().getFullYear();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let monthlyRevenue = Array(12).fill(0);

    const revenueData = await Payment.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("Payment.createdAt")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "total"],
      ],
      include: [
        {
          model: Order,
          attributes: [],
          where: { is_deleted: false, status: "Delivered" },
        },
      ],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("Payment.createdAt")),
            currentYear
          ),
          { payment_status: "completed" },
        ],
      },
      group: [sequelize.fn("MONTH", sequelize.col("Payment.createdAt"))],
    });

    revenueData.forEach(({ dataValues }) => {
      monthlyRevenue[dataValues.month - 1] = parseFloat(dataValues.total);
    });

    return months.map((month, index) => ({ [month]: monthlyRevenue[index] }));
  },

  async getTopProducts() {
    const topProducts = await OrderItem.findAll({
      attributes: [
        "product_id",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total_orders"],
        [sequelize.fn("SUM", sequelize.col("subtotal_price")), "total_revenue"],
      ],
      include: [
        {
          model: Product,
          attributes: ["name"],
        },
        {
          model: Order,
          attributes: [],
          where: { is_deleted: false, status: "Delivered" },
        },
      ],
      group: ["product_id", "Product.id"],
      order: [[sequelize.literal("total_revenue"), "DESC"]],
      limit: 3,
    });

    return topProducts.map((item) => ({
      name: item.Product.name,
      total_orders: item.getDataValue("total_orders"),
      total_revenue: item.getDataValue("total_revenue"),
    }));
  },

  async getPendingOrders() {
    return await Order.count({ where: { is_deleted: false, status: "Pending" } });
  },
};

module.exports = stats;
