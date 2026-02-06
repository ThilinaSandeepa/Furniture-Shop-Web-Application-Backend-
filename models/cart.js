const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Product = require("./product");

class Cart extends Model {}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
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
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "cart",
    timestamps: true,
  }
);

Cart.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Cart, { foreignKey: "user_id" });

Cart.belongsTo(Product, { foreignKey: "product_id" });
Product.hasMany(Cart, { foreignKey: "product_id" });

module.exports = Cart;
