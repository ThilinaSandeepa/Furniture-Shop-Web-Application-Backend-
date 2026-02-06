const express = require("express");
const sequelize = require("../config/database");
const Product = require("../models/product");
const ProductFeature = require("../models/productFeature");
const ProductImage = require("../models/productImage");
const Category = require("../models/category");

const productService = {
  async addProduct(data) {
    const transaction = await sequelize.transaction();
    try {
      const {
        name,
        description,
        price,
        category_id,
        stock_quantity,
        features,
        images,
      } = data;

      const product = await Product.create(
        { name, description, price, category_id, stock_quantity },
        { transaction }
      );

      if (features && features.length > 0) {
        await ProductFeature.bulkCreate(
          features.map((feature) => ({
            product_id: product.id,
            feature_name: feature.name,
            feature_value: feature.value,
          })),
          { transaction }
        );
      }

      if (images && images.length > 0) {
        await ProductImage.bulkCreate(
          images.map((image) => ({
            product_id: product.id,
            image_path: image,
          })),
          { transaction }
        );
      }

      await transaction.commit();
      return product;
    } catch (error) {
      await transaction.rollback();
      throw new Error("Error adding product: " + error.message);
    }
  },

  async getProductById(productId) {
    return Product.findByPk(productId, {
      include: [ProductFeature, ProductImage],
    });
  },

  async getAllProducts() {
    return Product.findAll({
      where: { is_deleted: false },
      include: [
        {
          model: ProductFeature,
          where: { is_deleted: false },
          required: false,
        },
        {
          model: ProductImage,
          where: { is_deleted: false },
          required: false,
        },
        {
          model: Category,
        },
      ],
    });
  },

  async updateProduct(productId, data) {
    const transaction = await sequelize.transaction();
    try {
      const {
        name,
        description,
        price,
        category_id,
        stock_quantity,
        features,
        images,
      } = data;

      await Product.update(
        { name, description, price, category_id, stock_quantity },
        { where: { id: productId }, transaction }
      );

      if (features) {
        await ProductFeature.destroy({
          where: { product_id: productId },
          transaction,
        });
        await ProductFeature.bulkCreate(
          features.map((feature) => ({
            product_id: productId,
            feature_name: feature.name,
            feature_value: feature.value,
          })),
          { transaction }
        );
      }

      if (images) {
        await ProductImage.destroy({
          where: { product_id: productId },
          transaction,
        });
        await ProductImage.bulkCreate(
          images.map((image) => ({ product_id: productId, image_path: image })),
          { transaction }
        );
      }

      await transaction.commit();
      return { message: "Product updated successfully" };
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw new Error("Error updating product: " + error.message);
    }
  },

  async deleteProduct(productId) {
    return Product.update({ is_deleted: true }, { where: { id: productId } });
  },
};

module.exports = productService;
