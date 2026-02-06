const Payment = require("../models/payment");
const Order = require("../models/order");
const User = require("../models/user");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");

const paymentService = {
  async getAllPayments() {
    return await Payment.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: Order,
          include: [
            {
              model: User,
            },
            {
              model: OrderItem,
              include: [
                {
                  model: Product,
                },
              ],
            },
          ],
        },
      ],
    });
  },

  async getPaymentById(id) {
    return await Payment.findByPk(id, {
      include: [
        {
          model: Order,
          include: [
            {
              model: User,
            },
            {
              model: OrderItem,
              include: [
                {
                  model: Product,
                },
              ],
            },
          ],
        },
      ],
    });
  },
};

module.exports = paymentService;
