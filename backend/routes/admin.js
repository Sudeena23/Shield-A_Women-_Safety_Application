import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import Alert from "../models/Alert.js";
import SystemSetting from "../models/SystemSetting.js";
import AuditLog from "../models/AuditLog.js";
import Broadcast from "../models/Broadcast.js";
import { protect, adminProtect } from "../middleware/auth.js";

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(adminProtect);

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

// GET /api/admin/users
// Get all registered users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/admin/users/:id
// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/admin/users
// Admin creates a new user account
router.post("/users", async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await User.create({
      name,
      email: cleanEmail,
      phone: phone || "",
      role: role || "user",
      status: status || "Active",
      password: hashedPassword,
    });

    // Log action
    try {
      await AuditLog.create({
        action: "USER_CREATED",
        category: "user",
        details: `Created new ${role || "user"} account for ${name} (${cleanEmail})`,
        actor: req.user?.email || "Admin",
        target: String(user._id),
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    const userWithoutPassword = await User.findById(user._id).select("-password");

    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      tempPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PATCH /api/admin/users/:id/suspend
// Toggle user Active / Suspended status
router.patch("/users/:id/suspend", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const prevStatus = user.status;
    user.status = user.status === "Active" ? "Suspended" : "Active";
    await user.save();

    // Log action
    try {
      await AuditLog.create({
        action: user.status === "Suspended" ? "USER_SUSPENDED" : "USER_ACTIVATED",
        category: "user",
        details: `Status changed from ${prevStatus} to ${user.status} for ${user.name}`,
        actor: req.user?.email || "Admin",
        target: String(user._id),
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    const updatedUser = await User.findById(user._id).select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PATCH /api/admin/users/:id
// Update user details
router.patch("/users/:id", async (req, res) => {
  try {
    const allowedFields = ["name", "email", "phone", "role", "status", "bloodGroup", "medicalNotes"];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log action
    try {
      await AuditLog.create({
        action: "USER_UPDATED",
        category: "user",
        details: `Updated details for ${user.name} (${user.email})`,
        actor: req.user?.email || "Admin",
        target: String(user._id),
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/admin/users/:id
// Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Log action
    try {
      await AuditLog.create({
        action: "USER_DELETED",
        category: "user",
        details: `Deleted user ${user.name} (${user.email})`,
        actor: req.user?.email || "Admin",
        target: String(req.params.id),
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.json({
      success: true,
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET /api/admin/alerts
// Fetch all system-wide alerts for admin dashboard monitoring
router.get("/alerts", async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate("user", "name email phone bloodGroup medicalNotes")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/admin/clear-resolved-alerts
// Remove resolved alerts from database
router.post("/clear-resolved-alerts", async (req, res) => {
  try {
    const result = await Alert.deleteMany({ status: "Resolved" });

    // Log action
    try {
      await AuditLog.create({
        action: "ALERTS_CLEARED",
        category: "dispatch",
        details: `Cleared ${result.deletedCount} resolved SOS alert records from database`,
        actor: req.user?.email || "Admin",
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `Cleared ${result.deletedCount} resolved alerts`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// SYSTEM SETTINGS ENDPOINTS
// ==========================================

// GET /api/admin/settings
// Get system settings (creates default if none exist)
router.get("/settings", async (req, res) => {
  try {
    let settings = await SystemSetting.findOne().sort({ createdAt: -1 });

    if (!settings) {
      settings = await SystemSetting.create({});
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PUT /api/admin/settings
// Update system settings
router.put("/settings", async (req, res) => {
  try {
    let settings = await SystemSetting.findOne().sort({ createdAt: -1 });

    const updates = {
      ...req.body,
      updatedBy: req.user?.email || "Admin",
    };

    if (!settings) {
      settings = await SystemSetting.create(updates);
    } else {
      settings = await SystemSetting.findByIdAndUpdate(settings._id, updates, {
        new: true,
        runValidators: true,
      });
    }

    // Log action
    try {
      await AuditLog.create({
        action: "SETTINGS_UPDATED",
        category: "system",
        details: "Updated system dispatch & safety configurations",
        actor: req.user?.email || "Admin",
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    // Notify connected clients via Socket.io if available
    const io = req.app.get("io");
    if (io) {
      io.emit("system-settings-changed", settings);
    }

    res.json({
      success: true,
      settings,
      message: "System settings updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// EMERGENCY BROADCAST ENDPOINTS
// ==========================================

// GET /api/admin/broadcasts
// Get list of broadcasts
router.get("/broadcasts", async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      broadcasts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/admin/broadcasts
// Create and send emergency public broadcast
router.post("/broadcasts", async (req, res) => {
  try {
    const { title, message, category, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required for broadcast",
      });
    }

    const totalUsers = await User.countDocuments();

    const broadcast = await Broadcast.create({
      title,
      message,
      category: category || "Security Advisory",
      priority: priority || "Normal",
      sentBy: req.user?.name || req.user?.email || "Central Dispatch",
      recipientCount: totalUsers,
      active: true,
    });

    // Broadcast via Socket.io to all connected clients
    const io = req.app.get("io");
    if (io) {
      io.emit("emergency-broadcast", {
        id: broadcast._id,
        title: broadcast.title,
        message: broadcast.message,
        category: broadcast.category,
        priority: broadcast.priority,
        sentBy: broadcast.sentBy,
        timestamp: broadcast.createdAt,
      });
    }

    // Log action
    try {
      await AuditLog.create({
        action: "BROADCAST_SENT",
        category: "broadcast",
        details: `Dispatched ${priority} broadcast: "${title}" to all users`,
        actor: req.user?.email || "Admin",
        target: String(broadcast._id),
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.status(201).json({
      success: true,
      broadcast,
      message: "Emergency broadcast dispatched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/admin/broadcasts/:id
// Delete/dismiss a broadcast
router.delete("/broadcasts/:id", async (req, res) => {
  try {
    const broadcast = await Broadcast.findByIdAndDelete(req.params.id);

    if (!broadcast) {
      return res.status(404).json({
        success: false,
        message: "Broadcast not found",
      });
    }

    // Log action
    try {
      await AuditLog.create({
        action: "BROADCAST_REMOVED",
        category: "broadcast",
        details: `Removed broadcast alert "${broadcast.title}"`,
        actor: req.user?.email || "Admin",
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.json({
      success: true,
      message: "Broadcast removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// AUDIT LOGS ENDPOINTS
// ==========================================

// GET /api/admin/logs
// Get system audit logs with optional filtering
router.get("/logs", async (req, res) => {
  try {
    const { category, search, limit = 100 } = req.query;
    const query = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
        { actor: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// POST /api/admin/logs
// Manually insert an audit log entry
router.post("/logs", async (req, res) => {
  try {
    const { action, category, details, target } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: "Action is required",
      });
    }

    const log = await AuditLog.create({
      action,
      category: category || "system",
      details: details || "",
      target: target || "",
      actor: req.user?.email || "Admin",
      ip: req.ip || "127.0.0.1",
    });

    res.status(201).json({
      success: true,
      log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE /api/admin/logs
// Clear all audit logs
router.delete("/logs", async (req, res) => {
  try {
    await AuditLog.deleteMany({});

    // Create a new entry noting that logs were cleared
    await AuditLog.create({
      action: "LOGS_CLEARED",
      category: "system",
      details: "Audit history cleared by administrator",
      actor: req.user?.email || "Admin",
    });

    res.json({
      success: true,
      message: "Audit logs cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// SECURITY & PASSWORD MANAGEMENT
// ==========================================

// POST /api/admin/change-password
// Change admin password with verification
router.post("/change-password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Log action
    try {
      await AuditLog.create({
        action: "PASSWORD_CHANGED",
        category: "security",
        details: "Administrator changed their master password",
        actor: user.email,
      });
    } catch (e) {
      console.warn("Audit log error:", e.message);
    }

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// SYSTEM STATS & TEST TOOLS
// ==========================================

// GET /api/admin/stats
// Comprehensive diagnostic stats
router.get("/stats", async (req, res) => {
  try {
    const [
      totalUsers,
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      totalBroadcasts,
      totalLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Alert.countDocuments(),
      Alert.countDocuments({ status: { $in: ["Active", "Unit Dispatched"] } }),
      Alert.countDocuments({ status: "Resolved" }),
      Broadcast.countDocuments({ active: true }),
      AuditLog.countDocuments(),
    ]);

    const io = req.app.get("io");
    const activeSockets = io?.engine?.clientsCount || 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        totalBroadcasts,
        totalLogs,
        activeSockets,
        serverUptime: process.uptime(),
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;