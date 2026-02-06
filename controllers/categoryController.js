const categoryService = require("../services/categoryService");

const CategoryController = {
  async addCategory(req, res) {
    try {
      const data = req.body;
      const category = await categoryService.addCategory(data);
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCategory(req, res) {
    try {
      const { id } = req.body;
      const data = req.body;
      const updatedCategory = await categoryService.updateCategory(id, data);
      res.status(200).json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCategory(req, res) {
    try {
      const { id } = req.body;
      await categoryService.deleteCategory(id);
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOneCategory(req, res) {
    try {
      const { id } = req.body;
      const category = await categoryService.getOneCategory(id);
      res.status(200).json(category);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllCategories(req, res) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = CategoryController;
