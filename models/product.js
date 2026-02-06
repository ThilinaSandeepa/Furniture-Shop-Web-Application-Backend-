const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Category = require("./category");

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Category,
        key: "id",
      },
    },
    stock_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true,
  }
);

Product.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Product, { foreignKey: "category_id" });

module.exports = Product;
