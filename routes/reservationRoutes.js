import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createReservation,
  getUserReservations,
  updateReservation,
  cancelReservation,
  checkAvailability,
  markAsPaid
} from "../controllers/reservationController.js";

const router = express.Router();

router.post("/", authMiddleware, createReservation);
router.get("/my", authMiddleware, getUserReservations);

router.get("/check", checkAvailability);

router.put("/:id", authMiddleware, updateReservation);
router.delete("/:id", authMiddleware, cancelReservation);

router.put("/pay/:id", markAsPaid);

export default router;