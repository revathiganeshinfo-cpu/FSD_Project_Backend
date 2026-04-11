
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Reservation from "../models/Reservation.js";
import Review from "../models/Review.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

import {
  getAllUsers,
  getAllRestaurants,
  deleteRestaurant,
  getAllReviews,
  deleteReview,
  getAllReservations
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email });

    if (!admin || admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.use(authMiddleware, adminMiddleware);

router.get("/users", getAllUsers);

router.get("/restaurants", getAllRestaurants);

router.post("/restaurants", async (req, res) => {
  try {
    const { name, location, cuisine, price } = req.body;

    const finalPrice = price;

    if (!name || !location || !cuisine || !finalPrice) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const restaurant = await Restaurant.create({
      name,
      location,
      cuisine,
      price: finalPrice
    });

    res.status(201).json({
      success: true,
      message: "Restaurant added",
      restaurant
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.put("/restaurants/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.json({
      success: true,
      message: "Restaurant updated",
      restaurant
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    const revenueData = await Reservation.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$paidAmount" }
        }
      }
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalRestaurants,
        totalReservations,
        totalRevenue
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

router.delete("/restaurants/:id", deleteRestaurant);

router.get("/reviews", getAllReviews);

router.get("/reservations", getAllReservations);
router.get("/stats", getAdminStats);




export default router;