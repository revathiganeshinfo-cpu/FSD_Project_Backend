import express from "express";
import {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  replyReview
} from "../controllers/reviewController.js";


import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createReview);
router.get("/restaurant/:id", getRestaurantReviews);
router.get("/my", authMiddleware, getMyReviews);

router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

router.put("/reply/:id", authMiddleware, replyReview);
export default router;