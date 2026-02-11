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

// Order creation with customer details and payment method
router.post(
  "/create",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  orderController.createOrder
);

// Cancel order
router.delete("/cancel", authMiddleware, orderController.cancelOrder);

// Get single order
router.post("/one", authMiddleware, orderController.getOrder);

// Get all orders (admin only)
router.get(
  "/all",
  authMiddleware,
  headOfficeOnly,
  orderController.getAllOrders
);

// Get user's orders
router.post(
  "/user/all",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  orderController.getOrdersByUserId
);

// Update order status (admin only)
router.put(
  "/status",
  authMiddleware,
  headOfficeOnly,
  orderController.updateOrderStatus
);

// ===== INVOICE/PDF ENDPOINTS =====

// Get invoice PDF (view inline in browser)
router.get("/invoice/:invoiceNo/pdf", orderController.getInvoicePDF);

// Download invoice PDF (forces download)
router.get("/invoice/:invoiceNo/download", orderController.downloadInvoicePDF);

// Get invoice details (metadata only)
router.get("/invoice/:invoiceNo/details", orderController.getInvoiceDetails);

module.exports = router;
