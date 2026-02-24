const statsService = require("../services/statsService");

const statsController = {
  async getStats(req, res) {
    try {
      const totalCustomers = await statsService.getTotalCustomers();
      const totalOrders = await statsService.getTotalOrders();
      const pendingOrders = await statsService.getPendingOrders();
      const processingOrders = await statsService.getProcessingOrders();
      const shippedOrders = await statsService.getShippedOrders();
      const cancelledOrders = await statsService.getCancelledOrders();
      const deliveredOrders = await statsService.getDeliveredOrders();
      const totalMonthlyRevenue = await statsService.getTotalMonthlyRevenue();
      const topProducts = await statsService.getTopProducts();

      res.json({
        total_customers: totalCustomers,
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        processing_orders: processingOrders,
        shipped_orders: shippedOrders,
        cancelled_orders: cancelledOrders,
        delivered_orders: deliveredOrders,
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
