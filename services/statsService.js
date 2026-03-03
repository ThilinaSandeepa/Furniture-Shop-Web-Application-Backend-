const User = require("../models/user");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const Category = require("../models/category");
const sequelize = require("../config/database");

const stats = {
  async getTotalCustomers() {
    return await User.count({ where: { role: "User", is_deleted: false } });
  },

  async getTotalOrders() {
    return await Order.count({ where: { is_deleted: false } });
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

    const revenueData = await Order.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("order_date")), "month"],
        [sequelize.fn("SUM", sequelize.col("total_price")), "total"],
      ],
      where: {
        is_deleted: false,
        order_date: sequelize.where(
          sequelize.fn("YEAR", sequelize.col("order_date")),
          currentYear
        ),
      },
      group: [sequelize.fn("MONTH", sequelize.col("order_date"))],
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
          where: { is_deleted: false },
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

  async getCategoryPerformance() {
    const deliveredOrderItems = await OrderItem.findAll({
      attributes: ["quantity"],
      include: [
        {
          model: Product,
          attributes: ["id"],
          where: { is_deleted: false },
          include: [
            {
              model: Category,
              attributes: ["name"],
              where: { is_deleted: false },
            },
          ],
        },
        {
          model: Order,
          attributes: [],
          where: { is_deleted: false },
        },
      ],
      where: { is_deleted: false },
    });

    const unitsByCategory = deliveredOrderItems.reduce((acc, item) => {
      const categoryName = item?.Product?.Category?.name || "Uncategorized";
      const quantity = parseInt(item.quantity || 0, 10);

      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }

      acc[categoryName] += quantity;
      return acc;
    }, {});

    return Object.entries(unitsByCategory)
      .map(([name, total_units]) => ({ name, total_units }))
      .sort((a, b) => b.total_units - a.total_units);
  },

  async getPendingOrders() {
    return await Order.count({
      where: {
        is_deleted: false,
        status: "Pending",
      },
    });
  },

  async getProcessingOrders() {
    return await Order.count({
      where: { is_deleted: false, status: "Processing" },
    });
  },

  async getShippedOrders() {
    return await Order.count({
      where: { is_deleted: false, status: "Shipped" },
    });
  },

  async getCancelledOrders() {
    return await Order.count({
      where: { is_deleted: false, status: "Cancelled" },
    });
  },

  async getDeliveredOrders() {
    return await Order.count({
      where: { is_deleted: false, status: "Delivered" },
    });
  },
};

module.exports = stats;
