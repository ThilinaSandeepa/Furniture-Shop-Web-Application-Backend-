const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const analyticsController = require("../controllers/analyticsController");

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
  analyticsController.getAllAnalytics
);

module.exports = router;
