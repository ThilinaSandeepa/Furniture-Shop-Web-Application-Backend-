const Category = require("../models/category");

const CategoryService = {
  async addCategory(data) {
    if (Array.isArray(data)) {
      return await Category.bulkCreate(data);
    }
    return await Category.create(data);
  },

  async updateCategory(id, data) {
    await Category.update(data, { where: { id } });
    return await Category.findByPk(id);
  },

  async deleteCategory(id) {
    return await Category.update({ is_deleted: true }, { where: { id } });
  },

  async getOneCategory(id) {
    return await Category.findByPk(id);
  },

  async getAllCategories() {
    return await Category.findAll({ where: { is_deleted: false } });
  },
};

module.exports = CategoryService;
