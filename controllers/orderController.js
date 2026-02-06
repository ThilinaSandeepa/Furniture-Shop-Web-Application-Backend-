const orderService = require("../services/orderService");

const orderController = {
  async createOrder(req, res) {
    const { userId, items, paymentMethod } = req.body;
    try {
      const order = await orderService.createOrder(
        userId,
        items,
        paymentMethod
      );
      res.status(201).json(order);
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ error: error.message });
    }
  },

  async cancelOrder(req, res) {
    const { orderId } = req.body;
    try {
      await orderService.cancelOrder(orderId);
      res.status(200).send({ message: "Order cancelled" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getOrder(req, res) {
    const { orderId } = req.body;
    try {
      const order = await orderService.getOrder(orderId);
      res.status(200).json(order);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrdersByUserId(req, res) {
    const { userId } = req.body;
    try {
      const orders = await orderService.getOrdersByUserId(userId);
      res.status(200).json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    const { orderId, newStatus } = req.body;
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      res.status(200).send({ message: "Order status updated" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = orderController;
