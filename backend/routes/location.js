import express from "express";
import Location from "../models/Location.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All location routes require a logged-in user
router.use(protect);

// POST /api/location
// Save/update the logged-in user's current location
router.post("/", async (req, res) => {
  try {
    const { lat, lng, isSharing } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required"
      });
    }

    const location = await Location.findOneAndUpdate(
      { user: req.userId },
      {
        lat,
        lng,
        isSharing:
          isSharing !== undefined ? isSharing : true
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      success: true,
      location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET /api/location/me
// Get the logged-in user's own last saved location
router.get("/me", async (req, res) => {
  try {
    const location = await Location.findOne({
      user: req.userId
    });

    res.json({
      success: true,
      location: location || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/location/stop
// Stop sharing location
router.patch("/stop", async (req, res) => {
  try {
    const location = await Location.findOneAndUpdate(
      { user: req.userId },
      { isSharing: false },
      { new: true }
    );

    res.json({
      success: true,
      location: location || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;