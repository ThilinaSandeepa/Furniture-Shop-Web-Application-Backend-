const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/user");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");

dotenv.config();

const userService = {
  async signUp(data) {
    try {
      const {
        name,
        email,
        phone_number,
        password,
        role,
        address,
        province,
        district,
        postal_code,
      } = data;

      // User already exists da nadda kiyala check karanna (email eka through)
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("Email already exists. Please use a different email.");
      }

      // Password eka save karanna kalin hash karanna.
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email,
        phone_number,
        password: hashedPassword,
        role,
        address,
        province,
        district,
        postal_code,
      });

      // Token ekak genarate karanna .
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5h" } // Token eka expire venna ona time eka define karaganna .
      );

      return { user, token }; // User details & token eka return karaganna .
    } catch (error) {
      console.log(error);
      throw new Error("Error while creating user: " + error.message);
    }
  },

  async login(email, password) {
    try {
      const user = await User.findOne({ where: { email } }); // Email eken user kenek exicts da kiyala check karanna .
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password); // User kenek innavanam password eka match venavada kiyala check karanna .
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "5h" } // Token eka expire venna ona time eka define karaganna .
      );

      return { user, token };
    } catch (error) {
      throw new Error("Login failed: " + error.message);
    }
  },

  async updateUserDetails(updateData) {
    try {
      const {
        userId,
        name,
        email,
        phone_number,
        address,
        province,
        district,
        postal_code,
      } = updateData;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (phone_number) user.phone_number = phone_number;
      if (address) user.address = address;
      if (province) user.province = province;
      if (district) user.district = district;
      if (postal_code) user.postal_code = postal_code;

      await user.save();

      return user;
    } catch (error) {
      throw new Error("Error updating user details: " + error.message);
    }
  },

  async forgotPassword(data) {
    try {
      const { userId, newPassword } = data;

      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      await user.save();

      return { message: "Password updated successfully" };
    } catch (error) {
      throw new Error("Error updating password: " + error.message);
    }
  },

  async getAllAdminsWithOrders() {
    try {
      const admins = await User.findAll({
        where: { role: "User", is_deleted: false },
        include: [
          {
            where: { is_deleted: false },
            model: Order,
            required: false,
            include: [
              {
                model: OrderItem,
                include: [
                  {
                    model: Product,
                  },
                ],
              },
            ],
          },
        ],
      });

      return admins;
    } catch (error) {
      throw new Error("Error fetching admins with orders: " + error.message);
    }
  },
};

module.exports = userService;
