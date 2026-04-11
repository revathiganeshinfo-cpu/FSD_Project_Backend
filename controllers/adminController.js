import User from "../models/User.js";
import Restaurant from "../models/Restaurant.js";
import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";



/* GET ALL USERS */
export const getAllUsers = async (req, res) => {
  try {
    console.log("🔥 getAllUsers called");

    const users = await User.find();

    res.json({
      success: true,
      users
    });

  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



/* GET ALL RESTAURANTS */
export const getAllRestaurants = async (req,res)=>{
 try{

  const restaurants = await Restaurant.find();

  res.json(restaurants);

 }catch(error){
  res.status(500).json({message:error.message});
 }
};



/* DELETE RESTAURANT */
export const deleteRestaurant = async (req,res)=>{
 try{

  await Restaurant.findByIdAndDelete(req.params.id);

  res.json({message:"Restaurant deleted"});

 }catch(error){
  res.status(500).json({message:error.message});
 }
};



/* GET ALL REVIEWS */
export const getAllReviews = async (req,res)=>{
 try{

  const reviews = await Review.find()
   .populate("user")
   .populate("restaurant");

  res.json(reviews);

 }catch(error){
  res.status(500).json({message:error.message});
 }
};



/* DELETE REVIEW */
export const deleteReview = async (req,res)=>{
 try{

  await Review.findByIdAndDelete(req.params.id);

  res.json({message:"Review deleted"});

 }catch(error){
  res.status(500).json({message:error.message});
 }
};



/* GET ALL RESERVATIONS */
export const getAllReservations = async (req,res)=>{
 try{

  const reservations = await Reservation.find()
   .populate("user")
   .populate("restaurant");

  res.json(reservations);

 }catch(error){
  res.status(500).json({message:error.message});
 }
};