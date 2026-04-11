import express from "express";
import mongoose from "mongoose";
import Restaurant from "../models/Restaurant.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { name, location, cuisine, price } = req.query;

    const filter = {};

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (cuisine) {
      filter.cuisine = { $regex: cuisine, $options: "i" };
    }

    if (price) {
      filter.price ={ $lte: Number(price) };
    }

    const restaurants = await Restaurant.find(filter);

    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/recommendations", async (req, res) => {
  try {
    const { cuisine } = req.query;
    const filter = {};

    if (cuisine) filter.cuisine = cuisine;

    const restaurants = await Restaurant.find(filter)
      .sort({ rating: -1, reservationCount: -1 })
      .limit(5);

    res.json({ success: true, recommendations: restaurants });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.status(200).json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.status(200).json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, location, cuisine, price } = req.body;
        if (!name || !location || !cuisine || !price) {
          return res.status(400).json({ success: false, message: "All fields required" });
        }

    const restaurant = new Restaurant({ name, location, cuisine, price });
    await restaurant.save();

    res.status(201).json({ success: true, message: "Restaurant added successfully", restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findByIdAndUpdate(id, req.body, { new: true });
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.json({ success: true, message: "Restaurant updated", restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid restaurant ID" });
    }

    const restaurant = await Restaurant.findByIdAndDelete(id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    res.json({ success: true, message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;