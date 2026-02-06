const express = require("express");
const CartController = require("../controllers/cartController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post(
  "/add",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  CartController.addToCart
);
router.put("/update", authMiddleware, CartController.updateCart);
router.delete("/remove", authMiddleware, CartController.removeProductFromCart);
router.post("/one", authMiddleware, CartController.getOneProductFromCart);
router.post(
  "/all",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  CartController.getAllProductsFromCart
);

module.exports = router;
