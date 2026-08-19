import express from "express";
import Alert from "../models/Alert.js";
import Guardian from "../models/Guardian.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All alert routes require a logged-in user
router.use(protect);

const COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

// GET /api/alerts
// Get all alerts for the logged-in user
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/alerts
// Trigger a new SOS alert
router.post("/", async (req, res) => {
  try {
    const {
      lat,
      lng,
      address,
      type,
      duressActivated
    } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Location (lat, lng) is required"
      });
    }

    // Cooldown check
    const recentAlert = await Alert.findOne({
      user: req.userId
    }).sort({
      createdAt: -1
    });

    if (recentAlert) {
      const elapsed =
        Date.now() - new Date(recentAlert.createdAt).getTime();

      if (elapsed < COOLDOWN_MS) {
        const secondsLeft = Math.ceil(
          (COOLDOWN_MS - elapsed) / 1000
        );

        return res.status(429).json({
          success: false,
          message: `Please wait ${secondsLeft}s before sending another alert`
        });
      }
    }

    const guardianCount = await Guardian.countDocuments({
      user: req.userId
    });

    const alert = await Alert.create({
      user: req.userId,
      type: type || "SOS Alert",
      lat,
      lng,
      address,
      recipientsCount: guardianCount,
      duressActivated: !!duressActivated
    });

    res.status(201).json({
      success: true,
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/alerts/:id/resolve
// Mark an alert as resolved
router.patch("/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });
    }

    alert.status = "Resolved";

    await alert.save();

    res.json({
      success: true,
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;