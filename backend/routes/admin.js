import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All admin routes require a logged-in user
router.use(protect);

// Only allow users with role "admin" past this point
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

router.use(requireAdmin);

// GET /api/admin/users
// Get all users (excluding passwords)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/admin/users/:id/suspend
// Toggle a user's status between Active and Suspended
router.patch("/users/:id/suspend", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = user.status === "Active"
      ? "Suspended"
      : "Active";

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
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

// DELETE /api/admin/users/:id
// Delete a user account
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      id: req.params.id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;