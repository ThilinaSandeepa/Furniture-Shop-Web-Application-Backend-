const paymentService = require("../services/paymentService");

const paymentController = {
  async getAllPayments(req, res) {
    try {
      const payments = await paymentService.getAllPayments();
      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getPaymentById(req, res) {
    try {
      const payment = await paymentService.getPaymentById(req.body.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.status(200).json(payment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = paymentController;
