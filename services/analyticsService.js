const Payment = require("../models/payment");
const Order = require("../models/order");
const User = require("../models/user");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

class AnalyticsService {
  async getMonthlyRevenue() {
    const currentYear = new Date().getFullYear();

    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          where: { is_deleted: false, status: "Delivered" },
          attributes: [],
        },
      ],
      where: {
        is_deleted: false,
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("Payment.createdAt")),
            currentYear
          ),
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Payment.payment_status")),
            "completed"
          ),
        ],
      },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("Payment.createdAt")), "month"],
        [sequelize.fn("SUM", sequelize.col("amount")), "revenue"],
      ],
      group: [sequelize.fn("MONTH", sequelize.col("Payment.createdAt"))],
      raw: true,
    });

    const monthlyRevenue = {};
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];

    months.forEach((month) => {
      monthlyRevenue[month] = 0;
    });

    payments.forEach((payment) => {
      const monthIndex = Number(payment.month) - 1;
      const month = months[monthIndex];
      if (!month) return;

      monthlyRevenue[month] = parseFloat(payment.revenue);
    });

    return monthlyRevenue;
  }

  async getTotalUsers() {
    const totalUsers = await User.count({
      where: { is_deleted: false, role: "User" },
    });
    return totalUsers;
  }

  async getTotalOrders() {
    const totalOrders = await Order.count({ where: { is_deleted: false } });
    return totalOrders;
  }

  async getTotalRevenue() {
    const totalRevenue = await Payment.sum("amount", {
      include: [
        {
          model: Order,
          where: { is_deleted: false, status: "Delivered" },
          attributes: [],
        },
      ],
      where: {
        is_deleted: false,
        [Op.and]: [
          sequelize.where(
            sequelize.fn("LOWER", sequelize.col("Payment.payment_status")),
            "completed"
          ),
        ],
      },
    });
    return totalRevenue || 0;
  }

  async getMostSoldItemsByProvince() {
    const rows = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { is_deleted: false, status: "Delivered" },
          attributes: [], // important: don't select Order columns
          include: [
            {
              model: User,
              attributes: [], // ✅ important: prevents selecting User.id, User.province, etc.
            },
          ],
        },
        {
          model: Product,
          attributes: [], // ✅ important: prevents Product.name being auto-selected again
        },
      ],
      attributes: [
        [sequelize.col("Order.User.province"), "province"],
        [sequelize.col("Product.name"), "productName"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      group: [
        sequelize.col("Order.User.province"),
        sequelize.col("Product.name"),
      ],
      order: [[sequelize.literal("totalSold"), "DESC"]],
      raw: true,
    });

    const result = {};
    rows.forEach(({ province, productName, totalSold }) => {
      if (!result[province]) result[province] = [];
      result[province].push({
        productName,
        totalSold: parseInt(totalSold, 10),
      });
    });

    return result;
  }

  async getMostPopularItems() {
    const mostPopularItems = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: { is_deleted: false, status: "Delivered" },
          attributes: [],
        },
        {
          model: Product,
          attributes: ["name"],
        },
      ],
      attributes: [
        [sequelize.col("Product.name"), "productName"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      group: ["productName"],
      order: [[sequelize.literal("totalSold"), "DESC"]],
      limit: 5,
      raw: true,
    });

    return mostPopularItems.map((item) => ({
      productName: item.productName,
      totalSold: parseInt(item.totalSold),
    }));
  }

  async getAllAnalytics() {
    const [
      monthlyRevenue,
      totalUsers,
      totalOrders,
      totalRevenue,
      mostSoldItemsByProvince,
      mostPopularItems,
    ] = await Promise.all([
      this.getMonthlyRevenue(),
      this.getTotalUsers(),
      this.getTotalOrders(),
      this.getTotalRevenue(),
      this.getMostSoldItemsByProvince(),
      this.getMostPopularItems(),
    ]);

    return {
      monthlyRevenue,
      totalUsers,
      totalOrders,
      totalRevenue,
      mostSoldItemsByProvince,
      mostPopularItems,
    };
  }
}

module.exports = new AnalyticsService();
