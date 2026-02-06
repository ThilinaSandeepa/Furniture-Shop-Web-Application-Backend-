const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const sequelize = require("./config/database");
const User = require("./models/user");
const Category = require("./models/category");
const Product = require("./models/product");
const ProductImage = require("./models/productImage");
const ProductFeature = require("./models/productFeature");
const Order = require("./models/order");
const OrderItem = require("./models/orderItem");
const Cart = require("./models/cart");
const Payment = require("./models/payment");

//Routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const emailRoutes = require("./routes/emailRoutes");
const statsRoutes = require("./routes/statsRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const dbName = process.env.DB_NAME;

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(bodyParser.json({ limit: "10mb" })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

//Routes
app.use("/api/user", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/analytics", analyticsRoutes);

sequelize
  .sync({ alter: false })
  .then(() => {
    console.log("Database synced successfully with auto-update.");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
