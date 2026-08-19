import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Helper to create a signed JWT for a given user id
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// POST /api/auth/register
// Create a new user account
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      emergencyPin,
      bloodGroup,
      medicalNotes
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: cleanEmail
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isAdmin = cleanEmail.includes("admin");

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone,
      role: isAdmin ? "admin" : "user",
      emergencyPin,
      bloodGroup,
      medicalNotes
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        emergencyPin: newUser.emergencyPin,
        bloodGroup: newUser.bloodGroup,
        medicalNotes: newUser.medicalNotes,
        status: newUser.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/auth/login
// Log in an existing user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        emergencyPin: user.emergencyPin,
        bloodGroup: user.bloodGroup,
        medicalNotes: user.medicalNotes,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/auth/me
// Get the currently logged-in user
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;