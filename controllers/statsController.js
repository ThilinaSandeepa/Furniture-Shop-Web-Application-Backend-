const statsService = require("../services/statsService");

const statsController = {
  async getStats(req, res) {
    try {
      const totalCustomers = await statsService.getTotalCustomers();
      const totalOrders = await statsService.getTotalOrders();
      const pendingOrders = await statsService.getPendingOrders();
      const totalMonthlyRevenue = await statsService.getTotalMonthlyRevenue();
      const topProducts = await statsService.getTopProducts();

      res.json({
        total_customers: totalCustomers,
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        total_monthly_revenue: totalMonthlyRevenue,
        top_products: topProducts,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
};

module.exports = statsController;
