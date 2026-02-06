const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

// User Sign Up route
router.post("/signup", userController.signUp);

// User Login route
router.post("/login", userController.login);

router.put(
  "/update",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  userController.updateUserDetails
);

router.put(
  "/forgot-password",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  userController.forgotPassword
);

router.get(
  "/customer/all",
  authMiddleware,
  (req, res, next) => {
    req.body.userId = req.user.id;
    next();
  },
  userController.getAllAdminsWithOrders
);

module.exports = router;
