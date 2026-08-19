import express from "express";
import Guardian from "../models/Guardian.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All guardian routes require a logged-in user
router.use(protect);

// GET /api/guardians
// Get all guardians belonging to the logged-in user
router.get("/", async (req, res) => {
  try {
    const guardians = await Guardian.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      guardians
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST /api/guardians
// Add a new guardian
router.post("/", async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required"
      });
    }

    // If this guardian is primary,
    // remove primary status from existing guardians
    if (isPrimary) {
      await Guardian.updateMany(
        { user: req.userId },
        { isPrimary: false }
      );
    }

    const newGuardian = await Guardian.create({
      user: req.userId,
      name,
      phone,
      relationship,
      isPrimary: !!isPrimary
    });

    res.status(201).json({
      success: true,
      guardian: newGuardian
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PUT /api/guardians/:id
// Update an existing guardian
router.put("/:id", async (req, res) => {
  try {
    const guardian = await Guardian.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: "Guardian not found"
      });
    }

    if (req.body.isPrimary) {
      await Guardian.updateMany(
        { user: req.userId },
        { isPrimary: false }
      );
    }

    Object.assign(guardian, req.body);

    await guardian.save();

    res.json({
      success: true,
      guardian
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// PATCH /api/guardians/:id/primary
// Set a specific guardian as primary
router.patch("/:id/primary", async (req, res) => {
  try {
    const guardian = await Guardian.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: "Guardian not found"
      });
    }

    await Guardian.updateMany(
      { user: req.userId },
      { isPrimary: false }
    );

    guardian.isPrimary = true;

    await guardian.save();

    const guardians = await Guardian.find({
      user: req.userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      guardians
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE /api/guardians/:id
// Delete a guardian
router.delete("/:id", async (req, res) => {
  try {
    const guardian = await Guardian.findOneAndDelete({
      _id: req.params.id,
      user: req.userId
    });

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: "Guardian not found"
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