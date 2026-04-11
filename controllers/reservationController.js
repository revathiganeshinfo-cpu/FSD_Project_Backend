import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import mongoose from "mongoose";

export const createReservation = async (req, res) => {
  try {
    const { restaurant, date, time, partySize } = req.body;
    const user = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({ message: "Invalid restaurant ID" });
    }

    const restaurantData = await Restaurant.findById(restaurant);
    if (!restaurantData) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const reservations = await Reservation.find({ restaurant, date, time });

    const booked = reservations.reduce((sum, r) => sum + r.partySize, 0);
    const totalSeats = restaurantData.totalTables * 4;

    if (booked + partySize > totalSeats) {
      return res.status(400).json({
        message: "No availability for this time slot"
      });
    }

    const price = Number(
      restaurantData.price
    );

    const reservationDoc = await Reservation.create({
      user,
      restaurant,
      date,
      time,
      partySize,
      totalAmount: price * partySize,
      paidAmount: 0,
      status: "pending"
    });

    await Restaurant.findByIdAndUpdate(restaurant, {
      $inc: { reservationCount: 1 }
    });

    res.status(201).json({
      success: true,
      reservation: reservationDoc
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user.id })
      .populate({
        path: "restaurant",
        select: "name price price"
      });

    res.json({ success: true, reservations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const newPartySize = req.body.partySize || reservation.partySize;
    const newDate = req.body.date || reservation.date;
    const newTime = req.body.time || reservation.time;

    const restaurantData = await Restaurant.findById(reservation.restaurant);

    const reservations = await Reservation.find({
      restaurant: reservation.restaurant,
      date: newDate,
      time: newTime,
      _id: { $ne: id }
    });

    const booked = reservations.reduce((sum, r) => sum + r.partySize, 0);
    const totalSeats = restaurantData.totalTables * 4;

    if (booked + newPartySize > totalSeats) {
      return res.status(400).json({
        message: "No availability for updated slot"
      });
    }

    reservation.date = newDate;
    reservation.time = newTime;
    reservation.partySize = newPartySize;

    const price = Number(
      restaurantData.price
    );

    const oldTotal = reservation.totalAmount || 0;
    const newTotal = price * newPartySize;

    reservation.totalAmount = newTotal;

    const difference = newTotal - oldTotal;

    let extraToPay = 0;
    let refundAmount = 0;

    if (difference > 0) {
      extraToPay = difference;

      if (reservation.paidAmount < newTotal) {
        reservation.status = "pending";
      }
    }

    if (difference < 0) {
      refundAmount = Math.abs(difference);
    }

    const updated = await reservation.save();

    res.json({
      success: true,
      updated,
      extraToPay,
      refundAmount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Reservation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Reservation cancelled"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .populate("restaurant", "name price");

    res.json({ success: true, reservations });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const checkAvailability = async (req, res) => {
  try {
    const { restaurant, date, time } = req.query;

    const reservations = await Reservation.find({ restaurant, date, time });

    const booked = reservations.reduce((sum, r) => sum + r.partySize, 0);

    const restaurantData = await Restaurant.findById(restaurant);
    const totalSeats = restaurantData.totalTables * 4;

    res.json({
      success: true,
      availableSeats: totalSeats - booked
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const total = Number(reservation.totalAmount || 0);
    const paid = Number(reservation.paidAmount || 0);

    const remaining = total - paid;

    if (remaining <= 0) {
      reservation.status = "paid"; // ensure status correct
      await reservation.save();

      return res.json({
        success: true,
        message: "Already fully paid",
        reservation
      });
    }

    // update payment
    reservation.paidAmount = paid + remaining;

    // FORCE status update (important fix)
    if (reservation.paidAmount >= total) {
      reservation.status = "paid";
    } else {
      reservation.status = "pending";
    }

    await reservation.save();

    res.json({
      success: true,
      message: "Payment updated",
      reservation
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};