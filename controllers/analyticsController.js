const analyticsService = require("../services/analyticsService");

class AnalyticsController {
  async getAllAnalytics(req, res) {
    try {
      const analyticsData = await analyticsService.getAllAnalytics();
      res.status(200).json({
        success: true,
        data: analyticsData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch analytics data",
        error: error.message,
      });
    }
  }
}

module.exports = new AnalyticsController();
