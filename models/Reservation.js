import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  partySize: { type: Number, required: true },
  status: { type: String, enum: ["pending","confirmed","cancelled","paid"], default: "pending" },
  totalAmount: {
  type: Number,
  default: 0
},
paidAmount: {
  type: Number,
  default: 0
}
}, { timestamps: true });

export default mongoose.model("Reservation", reservationSchema);