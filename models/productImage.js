const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./product");

class ProductImage extends Model {}

ProductImage.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    image_path: {
      type: DataTypes.TEXT("long"),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "ProductImage",
    tableName: "product_images",
    timestamps: true,
  }
);

ProductImage.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(ProductImage, { foreignKey: "product_id" });

module.exports = ProductImage;
