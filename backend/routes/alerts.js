import express from "express";
import Alert from "../models/Alert.js";
import Guardian from "../models/Guardian.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All alert routes require user to be logged in
router.use(protect);

const COOLDOWN_MS = 5 * 1000; // 5 seconds cooldown for rapid safety response & testing

// ==========================================
// 1. GET ALL ALERTS
// ==========================================
// Returns all alerts for admins, or user's own alerts for regular users
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const query = user?.role === "admin" ? {} : { user: req.userId };

    const alerts = await Alert.find(query)
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

// ==========================================
// 2. CREATE NEW SOS ALERT
// ==========================================
router.post("/", async (req, res) => {
  try {
    const { lat, lng, address, type, duressActivated } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates (lat, lng) are required",
      });
    }

    // Check cooldown to prevent spamming
    const recentAlert = await Alert.findOne({
      user: req.userId,
    }).sort({ createdAt: -1 });

    if (recentAlert) {
      const elapsed = Date.now() - new Date(recentAlert.createdAt).getTime();
      if (elapsed < COOLDOWN_MS) {
        const secondsLeft = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft}s before sending another alert`,
        });
      }
    }

    const user = req.user || (await User.findById(req.userId));
    const guardians = await Guardian.find({ user: req.userId });

    const alert = await Alert.create({
      user: req.userId,
      type: type || "SOS Alert",
      lat,
      lng,
      address: address || "",
      victimName: user ? user.name : "Unknown User",
      victimPhone: user ? user.phone : "",
      recipientsCount: guardians.length,
      duressActivated: !!duressActivated,
    });

    // Broadcast new SOS alert in real-time over free WebSockets
    const io = req.app.get("io");
    if (io) {
      io.emit("new-sos-alert", alert);
    }

    res.status(201).json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 3. UPDATE ALERT STATUS (Active, Unit Dispatched, Resolved)
// ==========================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    alert.status = status || "Resolved";
    await alert.save();

    // Broadcast update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("alert-status-updated", {
        alertId: alert._id,
        status: alert.status,
      });
    }

    res.json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 4. RESOLVE SOS ALERT
// ==========================================
router.patch("/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    alert.status = "Resolved";
    await alert.save();

    // Broadcast resolve event via socket
    const io = req.app.get("io");
    if (io) {
      io.emit("alert-resolved", { alertId: alert._id, status: "Resolved" });
    }

    res.json({
      success: true,
      alert,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==========================================
// 5. DELETE SOS ALERT
// ==========================================
router.delete("/:id", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    res.json({
      success: true,
      id: req.params.id,
      message: "Alert deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;