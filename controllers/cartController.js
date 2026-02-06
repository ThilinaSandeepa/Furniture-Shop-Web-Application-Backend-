const CartService = require("../services/cartService");

const cartController = {
  async addToCart(req, res) {
    const { userId, productId, quantity } = req.body;
    const result = await CartService.addToCart(userId, productId, quantity);
    res.status(result.status).json(result.data);
  },

  async updateCart(req, res) {
    const { cartId, quantity } = req.body;
    const result = await CartService.updateCart(cartId, quantity);
    res.status(result.status).json(result.data);
  },

  async removeProductFromCart(req, res) {
    const { cartId } = req.body;
    const result = await CartService.removeProductFromCart(cartId);
    res.status(result.status).json({ message: result.data });
  },

  async getOneProductFromCart(req, res) {
    const { cartId } = req.body;
    const result = await CartService.getOneProductFromCart(cartId);
    res.status(result.status).json(result.data);
  },

  async getAllProductsFromCart(req, res) {
    const { userId } = req.body;
    const result = await CartService.getAllProductsFromCart(userId);
    res.status(result.status).json(result.data);
  },
};

module.exports = cartController;
