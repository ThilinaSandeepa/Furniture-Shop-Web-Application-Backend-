const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./user");
const Order = require("./order");

class Payment extends Model {}

Payment.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payment_method: {
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
    modelName: "Payment",
    tableName: "payments",
    timestamps: true,
  }
);

Payment.belongsTo(Order, { foreignKey: "order_id" });
Order.hasMany(Payment, { foreignKey: "order_id" });

Payment.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Payment, { foreignKey: "user_id" });

module.exports = Payment;
