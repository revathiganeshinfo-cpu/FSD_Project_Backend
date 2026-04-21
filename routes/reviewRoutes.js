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

router.post("/", authMiddleware, (req, res, next) => {
  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin cannot create reviews"
    });
  }
  next();
}, createReview);
router.get("/restaurant/:id", getRestaurantReviews);
router.get("/my", authMiddleware, getMyReviews);

router.put("/:id", authMiddleware, (req, res, next) => {
  if (req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin cannot update reviews"
    });
  }
  next();
}, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

router.put("/reply/:id", authMiddleware, replyReview);
export default router;    