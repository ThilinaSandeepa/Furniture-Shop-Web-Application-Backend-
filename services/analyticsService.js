const Payment = require("../models/payment");
const Order = require("../models/order");
const User = require("../models/user");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Category = require("../models/category");
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
    const totalUsers = await Order.count({
      where: { is_deleted: false, status: "Delivered" },
      distinct: true,
      col: "user_id",
    });
    return totalUsers;
  }

  async getMonthlyOrders() {
    const currentYear = new Date().getFullYear();

    const orders = await Order.findAll({
      where: {
        is_deleted: false,
        status: "Delivered",
        order_date: sequelize.where(
          sequelize.fn("YEAR", sequelize.col("order_date")),
          currentYear
        ),
      },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("order_date")), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orders"],
      ],
      group: [sequelize.fn("MONTH", sequelize.col("order_date"))],
      raw: true,
    });

    const monthlyOrders = {};
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
      monthlyOrders[month] = 0;
    });

    orders.forEach((order) => {
      const monthIndex = Number(order.month) - 1;
      const month = months[monthIndex];
      if (!month) return;

      monthlyOrders[month] = parseInt(order.orders, 10);
    });

    return monthlyOrders;
  }

  async getTotalOrders() {
    const totalOrders = await Order.count({
      where: { is_deleted: false, status: "Delivered" },
    });
    return totalOrders;
  }

  async getThisMonthDeliveredOrders() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    return await Order.count({
      where: {
        is_deleted: false,
        status: "Delivered",
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("order_date")),
            currentYear
          ),
          sequelize.where(
            sequelize.fn("MONTH", sequelize.col("order_date")),
            currentMonth
          ),
        ],
      },
    });
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

  async getMonthlyOrderStatusBreakdown() {
    const currentYear = new Date().getFullYear();
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

    const trackedStatuses = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const rows = await Order.findAll({
      where: {
        is_deleted: false,
        order_date: sequelize.where(
          sequelize.fn("YEAR", sequelize.col("order_date")),
          currentYear
        ),
      },
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("order_date")), "month"],
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "totalOrders"],
      ],
      group: [
        sequelize.fn("MONTH", sequelize.col("order_date")),
        sequelize.col("status"),
      ],
      raw: true,
    });

    const breakdown = {};

    months.forEach((month) => {
      breakdown[month] = {
        Pending: 0,
        Processing: 0,
        Shipped: 0,
        Delivered: 0,
        Cancelled: 0,
      };
    });

    rows.forEach((row) => {
      const monthIndex = Number(row.month) - 1;
      const monthName = months[monthIndex];
      const status = row.status;

      if (!monthName || !trackedStatuses.includes(status)) {
        return;
      }

      breakdown[monthName][status] = parseInt(row.totalOrders, 10);
    });

    return breakdown;
  }

  async getMonthlyDeliveredCategoryWise() {
    const currentYear = new Date().getFullYear();
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

    const rows = await OrderItem.findAll({
      include: [
        {
          model: Order,
          where: {
            is_deleted: false,
            status: "Delivered",
            [Op.and]: [
              sequelize.where(
                sequelize.fn("YEAR", sequelize.col("Order.order_date")),
                currentYear
              ),
            ],
          },
          attributes: [],
        },
        {
          model: Product,
          attributes: [],
          include: [
            {
              model: Category,
              attributes: [],
            },
          ],
        },
      ],
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("Order.order_date")), "month"],
        [sequelize.col("Product.Category.name"), "categoryName"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalSold"],
      ],
      where: { is_deleted: false },
      group: [
        sequelize.fn("MONTH", sequelize.col("Order.order_date")),
        sequelize.col("Product.Category.name"),
      ],
      order: [
        [sequelize.fn("MONTH", sequelize.col("Order.order_date")), "ASC"],
        [sequelize.literal("totalSold"), "DESC"],
      ],
      raw: true,
    });

    const result = {};
    months.forEach((month) => {
      result[month] = [];
    });

    rows.forEach((row) => {
      const monthIndex = Number(row.month) - 1;
      const monthName = months[monthIndex];
      if (!monthName) return;

      result[monthName].push({
        categoryName: row.categoryName || "Uncategorized",
        totalSold: parseInt(row.totalSold, 10),
      });
    });

    return result;
  }

  async getAllAnalytics() {
    const [
      monthlyRevenue,
      monthlyOrders,
      totalUsers,
      totalOrders,
      thisMonthDeliveredOrders,
      totalRevenue,
      mostSoldItemsByProvince,
      mostPopularItems,
      monthlyDeliveredCategoryWise,
      monthlyOrderStatusBreakdown,
    ] = await Promise.all([
      this.getMonthlyRevenue(),
      this.getMonthlyOrders(),
      this.getTotalUsers(),
      this.getTotalOrders(),
      this.getThisMonthDeliveredOrders(),
      this.getTotalRevenue(),
      this.getMostSoldItemsByProvince(),
      this.getMostPopularItems(),
      this.getMonthlyDeliveredCategoryWise(),
      this.getMonthlyOrderStatusBreakdown(),
    ]);

    return {
      monthlyRevenue,
      monthlyOrders,
      totalUsers,
      totalOrders,
      thisMonthDeliveredOrders,
      totalRevenue,
      mostSoldItemsByProvince,
      mostPopularItems,
      monthlyDeliveredCategoryWise,
      monthlyOrderStatusBreakdown,
    };
  }
}

module.exports = new AnalyticsService();
