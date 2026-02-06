const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Product = require("./product");

class ProductFeature extends Model {}

ProductFeature.init(
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
    feature_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    feature_value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "ProductFeature",
    tableName: "product_features",
    timestamps: true,
  }
);

ProductFeature.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(ProductFeature, { foreignKey: "product_id" });

module.exports = ProductFeature;
