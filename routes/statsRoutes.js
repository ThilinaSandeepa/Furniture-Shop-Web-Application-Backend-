const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const statsController = require("../controllers/statsController");

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.get(
  "/details",
  authMiddleware,
  headOfficeOnly,
  statsController.getStats
);

module.exports = router;
