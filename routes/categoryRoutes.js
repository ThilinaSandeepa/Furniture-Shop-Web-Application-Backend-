const express = require("express");
const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

const headOfficeOnly = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.post(
  "/add",
  authMiddleware,
  headOfficeOnly,
  categoryController.addCategory
);
router.put(
  "/update",
  authMiddleware,
  headOfficeOnly,
  categoryController.updateCategory
);
router.delete(
  "/delete",
  authMiddleware,
  headOfficeOnly,
  categoryController.deleteCategory
);
router.post(
  "/one",
  authMiddleware,
  headOfficeOnly,
  categoryController.getOneCategory
);
router.get("/all", authMiddleware, categoryController.getAllCategories);

module.exports = router;
