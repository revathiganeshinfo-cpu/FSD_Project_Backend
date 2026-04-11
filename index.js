import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import adminRoutes from "./routes/adminRoutes.js"

import connectDB from "./config/dbConfig.js"

import authRoutes from "./routes/authRoutes.js"
import restaurantRoutes from "./routes/restaurantRoutes.js"
import reservationRoutes from "./routes/reservationRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import stripeRoutes from "./routes/stripeRoutes.js"

dotenv.config()

connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth",authRoutes)
app.use("/api/restaurants",restaurantRoutes)
app.use("/api/reservations",reservationRoutes)
app.use("/api/reviews",reviewRoutes)
app.use("/api/stripe",stripeRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api",reservationRoutes) // 🔥 THIS WAS MISSING

const PORT = process.env.PORT || 5000

app.listen(PORT,()=>{
console.log(`Server running on port ${PORT}`)
})