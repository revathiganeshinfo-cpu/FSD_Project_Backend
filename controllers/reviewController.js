import Review from "../models/Review.js";
import Restaurant from "../models/Restaurant.js";
import mongoose from "mongoose";

export const createReview = async (req, res) => {
  try {
    const { restaurant, rating, comment, photos } = req.body;
    const user = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({ message: "Invalid restaurant id" });
    }

    const existing = await Review.findOne({ user, restaurant });
    if (existing) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    const review = await Review.create({
      user,
      restaurant,
      rating,
      comment,
      photos: photos || []
    });

    await recalcRating(restaurant);

    res.status(201).json({
      success: true,
      review
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id })
      .populate("user", "name");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate("restaurant", "name");

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.rating = req.body.rating;
    review.comment = req.body.comment;

    const updated = await review.save();

    res.json(updated);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return res.status(404).json({ message: "Not found" });

    if (review.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not allowed" });

    const restaurantId = review.restaurant;

    await review.deleteOne();
    await recalcRating(restaurantId);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const replyReview = async (req, res) => {
  try {
    const { reply } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Not found" });

    review.ownerReply = reply;
    await review.save();

    res.json({ success: true, review });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const recalcRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurant: restaurantId });

  const avg =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : 0;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: avg
  });
};