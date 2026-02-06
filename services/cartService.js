const Cart = require("../models/cart");
const Product = require("../models/product");
const ProductImage = require("../models/productImage");

const cartService = {
  async addToCart(userId, productId, quantity) {
    try {
      const cartItem = await Cart.create({
        user_id: userId,
        product_id: productId,
        quantity,
      });
      return { status: 201, data: cartItem };
    } catch (err) {
      return { status: 500, data: err.message };
    }
  },

  async updateCart(cartId, quantity) {
    try {
      const cartItem = await Cart.findByPk(cartId);
      if (!cartItem) return { status: 404, data: "Cart item not found" };
      cartItem.quantity = quantity;
      await cartItem.save();
      return { status: 200, data: cartItem };
    } catch (err) {
      return { status: 500, data: err.message };
    }
  },

  async removeProductFromCart(cartId) {
    try {
      const cartItem = await Cart.destroy({ where: { id: cartId } });
      return { status: 200, data: "Product removed from cart" };
    } catch (err) {
      return { status: 500, data: err.message };
    }
  },

  async getOneProductFromCart(cartId) {
    try {
      const cartItem = await Cart.findByPk(cartId, { include: Product });
      if (!cartItem) return { status: 404, data: "Cart item not found" };
      return { status: 200, data: cartItem };
    } catch (err) {
      return { status: 500, data: err.message };
    }
  },

  async getAllProductsFromCart(userId) {
    try {
      const cartItems = await Cart.findAll({
        where: { user_id: userId },
        include: [{ model: Product, include: [{ model: ProductImage }] }],
      });

      return { status: 200, data: cartItems };
    } catch (err) {
      return { status: 500, data: err.message };
    }
  },
};

module.exports = cartService;
