const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.get(
  "/all",
  authMiddleware,
  headOfficeOnly,
  paymentController.getAllPayments
);
router.post(
  "/one",
  authMiddleware,
  headOfficeOnly,
  paymentController.getPaymentById
);

module.exports = router;
