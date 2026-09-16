import express from "express";
import Guardian from "../models/Guardian.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";
import { emailService } from "../utils/emailService.js";

const router = express.Router();
router.use(protect);
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
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required"
      });
    }

    if (isPrimary) {
      await Guardian.updateMany(
        { user: req.userId },
        { isPrimary: false }
      );
    }

    const newGuardian = await Guardian.create({
      user: req.userId,
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim().toLowerCase() : "",
      relationship: relationship ? relationship.trim() : "Friend",
      isPrimary: !!isPrimary,
      avatarBg: req.body.avatarBg || "bg-[#9e6133]",
      status: req.body.status || "Active"
    });
    if (newGuardian.email) {
      const user = await User.findById(req.userId);
      emailService.sendGuardianWelcomeEmail({
        guardianEmail: newGuardian.email,
        guardianName: newGuardian.name,
        userName: user?.name || "A Shield Safety User",
        userPhone: user?.phone || phone,
      }).catch((e) => console.warn("Welcome email background error:", e.message));
    }

    // If email is provided, send guardian confirmation email asynchronously
    if (newGuardian.email) {
      const user = await User.findById(req.userId);
      emailService.sendGuardianWelcomeEmail({
        guardianEmail: newGuardian.email,
        guardianName: newGuardian.name,
        userName: user?.name || "A Shield Safety User",
        userPhone: user?.phone || phone,
      }).catch((e) => console.warn("Welcome email background error:", e.message));
    }

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

// POST /api/guardians/:id/test-alert
// Send a real test emergency alert email & notification to a specific guardian
router.post("/:id/test-alert", async (req, res) => {
  try {
    const guardian = await Guardian.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!guardian) {
      return res.status(404).json({
        success: false,
        message: "Guardian not found",
      });
    }

    const user = await User.findById(req.userId);
    const userName = user?.name || "A Shield Safety User";
    const userPhone = user?.phone || "Not specified";
    const userEmail = user?.email || "";

    let emailResult = { success: false, message: "No email registered" };

    if (guardian.email && guardian.email.includes("@")) {
      emailResult = await emailService.sendSOSEmergencyEmail({
        guardianEmail: guardian.email,
        guardianName: guardian.name,
        victimName: `${userName} (Test Simulation)`,
        victimPhone: userPhone,
        victimEmail: userEmail,
        address: "Test Emergency Safety Broadcast, Kathmandu",
        lat: 27.7172,
        lng: 85.324,
        alertType: "TEST SOS Safety Alert",
        duressActivated: false,
        timestamp: new Date().toLocaleString(),
      });
    }

    res.json({
      success: true,
      message: guardian.email
        ? `Test emergency alert dispatched to ${guardian.name} (${guardian.email})`
        : `Test alert simulated for ${guardian.name} (${guardian.phone})`,
      emailSent: Boolean(emailResult.success),
      guardianName: guardian.name,
      guardianEmail: guardian.email || "",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;