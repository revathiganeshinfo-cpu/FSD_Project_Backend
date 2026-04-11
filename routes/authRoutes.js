import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;


router.post("/register", async (req, res) => {

  try {

    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success:false,
        message:"All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success:false,
        message:"Email already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user"
    });

    const token = jwt.sign( 
      { id:newUser._id, role:newUser.role },
      JWT_SECRET,
      { expiresIn:"1d" }
    );

    res.status(201).json({
      success:true,
      message:"User registered successfully",
      token,
      user:newUser
    });

  } catch (error) {

    console.error("REGISTER ERROR:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});



router.post("/login", async (req,res)=>{

  try{

    const { email,password } = req.body;

    if(!email || !password){
      return res.status(400).json({
        success:false,
        message:"Email and password required"
      });
    }

    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      });
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
      return res.status(400).json({
        success:false,
        message:"Invalid password"
      });
    }

    const token = jwt.sign(
      { id:user._id, role:user.role },
      JWT_SECRET,
      { expiresIn:"1d" }
    );

    res.status(200).json({
      success:true,
      message:"Login successful",
      token,
      role:user.role
    });

  }catch(error){

    console.error("LOGIN ERROR:",error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});

export default router;