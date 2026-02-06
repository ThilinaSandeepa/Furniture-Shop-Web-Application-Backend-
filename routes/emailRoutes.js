const express = require("express");
const emailController = require("../controllers/emailController");
const router = express.Router();

router.post("/send-email", emailController.sendContactEmail);

module.exports = router;
