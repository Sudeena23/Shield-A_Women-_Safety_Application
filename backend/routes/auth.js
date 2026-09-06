import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "ShieldSafetyApp_2026_SecureKey_9xK2mP7q";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "30d" });
};
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, emergencyPin, bloodGroup, medicalNotes } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists" });
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
      medicalNotes,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || "",
        role: newUser.role,
        emergencyPin: newUser.emergencyPin,
        bloodGroup: newUser.bloodGroup,
        medicalNotes: newUser.medicalNotes,
        address: newUser.address,
        settings: newUser.settings,
        status: newUser.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        emergencyPin: user.emergencyPin,
        bloodGroup: user.bloodGroup,
        medicalNotes: user.medicalNotes,
        address: user.address,
        settings: user.settings,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
const handleUpdateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "phone",
      "emergencyPin",
      "bloodGroup",
      "medicalNotes",
      "address",
      "settings"
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const targetUserId = req.params.id || req.userId;

    const user = await User.findByIdAndUpdate(targetUserId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

router.put("/me", protect, handleUpdateProfile);
router.put("/profile/:id", protect, handleUpdateProfile);
router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect current password"
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;