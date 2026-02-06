const productService = require("../services/productService");

const productController = {
  async addProduct(req, res) {
    try {
      const newProduct = await productService.addProduct(req.body);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.body.id);
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const updatedProduct = await productService.updateProduct(
        req.body.id,
        req.body
      );
      res.status(200).json(updatedProduct);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      await productService.deleteProduct(req.body.id);
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = productController;
