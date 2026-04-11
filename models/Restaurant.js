import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  location: {
    type: String,
    required: true
  },

  cuisine: {
    type: String,
    required: true
  },

 

  price: {
  type: Number,
  required: true
},
  description: {
    type: String
  },

  images: [
    {
      type: String
    }
  ],

  reviews: [
    {
      rating: Number,
      comment: String,
    },
  ],

  menu: [
    {
      name: String,
      price: Number,
      description: String
    }
  ],

  openingHours: {
    type: String
  },

  contact: {
    phone: String,
    email: String
  },

  totalTables: {
    type: Number,
    default: 10
  },

  

  reservationCount: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Restaurant", restaurantSchema);