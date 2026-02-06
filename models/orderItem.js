const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Order = require("./order");
const Product = require("./product");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Order,
        key: "id",
      },
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Product,
        key: "id",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subtotal_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true,
  }
);

OrderItem.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(OrderItem, { foreignKey: "order_id" });

OrderItem.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

module.exports = OrderItem;
