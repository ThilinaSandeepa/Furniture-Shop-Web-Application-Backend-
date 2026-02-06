const userService = require("../services/userService");

const userController = {
  async signUp(req, res) {
    try {
      const userData = req.body;
      const signupuser = await userService.signUp(userData);
      res.status(201).json({
        message: "User registered successfully",
        user: signupuser.user,
        token: signupuser.token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      res.status(200).json({
        message: "Login successful",
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async updateUserDetails(req, res) {
    try {
      const updatedUser = await userService.updateUserDetails(req.body);
      res.status(200).json({
        message: "User details updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async forgotPassword(req, res) {
    try {
      const response = await userService.forgotPassword(req.body);
      res.status(200).json({
        message: response.message,
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getAllAdminsWithOrders(req, res) {
    try {
      const response = await userService.getAllAdminsWithOrders();
      res.status(200).json(response);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = userController;
