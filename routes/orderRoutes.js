const express = require("express");
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.post(
  "/create",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  orderController.createOrder
);
router.delete("/cancel", authMiddleware, orderController.cancelOrder);
router.post("/one", authMiddleware, orderController.getOrder);
router.get(
  "/all",
  authMiddleware,
  headOfficeOnly,
  orderController.getAllOrders
);
router.post(
  "/user/all",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  orderController.getOrdersByUserId
);
router.put(
  "/status",
  authMiddleware,
  headOfficeOnly,
  orderController.updateOrderStatus
);

module.exports = router;
