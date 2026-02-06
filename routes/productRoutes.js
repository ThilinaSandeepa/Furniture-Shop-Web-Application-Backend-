const express = require("express");
const productController = require("../controllers/productController");
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
  productController.addProduct
);
router.get("/all", productController.getAllProducts);
router.post("/one", productController.getProductById);
router.put(
  "/update",
  authMiddleware,
  headOfficeOnly,
  productController.updateProduct
);
router.delete(
  "/delete",
  authMiddleware,
  headOfficeOnly,
  productController.deleteProduct
);

module.exports = router;
