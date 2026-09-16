import express from "express";
import Alert from "../models/Alert.js";
import Guardian from "../models/Guardian.js";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { protect } from "../middleware/auth.js";
import { emailService } from "../utils/emailService.js";

const router = express.Router();

// All alert routes require user to be logged in
router.use(protect);

const COOLDOWN_MS = 5 * 1000; 
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
router.post("/", async (req, res) => {
  try {
    const { lat, lng, address, type, duressActivated } = req.body;

    if (lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates (lat, lng) are required",
      });
    }
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
    const guardiansWithEmail = guardians.filter(
      (g) => g.email && g.email.includes("@")
    );

    if (guardiansWithEmail.length > 0) {
      console.log(
        `[SOS Alert] Disagreeing with danger: Dispatching emergency emails to ${guardiansWithEmail.length} trusted contacts...`
      );

      // Send to all guardians concurrently in the background
      Promise.allSettled(
        guardiansWithEmail.map(async (guardian) => {
          const result = await emailService.sendSOSEmergencyEmail({
            guardianEmail: guardian.email,
            guardianName: guardian.name,
            victimName: user?.name || "A Shield User",
            victimPhone: user?.phone || "Not specified",
            victimEmail: user?.email || "",
            address: address || "GPS Coordinates Attached",
            lat: Number(lat),
            lng: Number(lng),
            alertType: type || "Emergency SOS Alert",
            duressActivated: !!duressActivated,
            timestamp: new Date().toLocaleString(),
          });

          // Log to audit log so administrator can see the email dispatch
          await AuditLog.create({
            action: "EMERGENCY_EMAIL_DISPATCHED",
            category: "dispatch",
            details: `Emergency SOS email sent to ${guardian.name} (${guardian.email}) for user ${user?.name || "Citizen"} at GPS: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
            actor: user?.email || "SOS User",
            target: guardian.email,
            ip: req.ip || "127.0.0.1",
          }).catch(() => {});

          return result;
        })
      ).then((results) => {
        const fulfilled = results.filter((r) => r.status === "fulfilled").length;
        console.log(`[SOS Alert] ✓ Successfully logged & dispatched ${fulfilled} guardian alert emails.`);
      }).catch((e) => {
        console.warn("[SOS Alert] Background email error:", e.message);
      });
    }

    // ----------------------------------------------------
    // NODEMAILER: Dispatch Emergency Email to Trusted Contacts
    // ----------------------------------------------------
    const guardiansWithEmail = guardians.filter(
      (g) => g.email && g.email.includes("@")
    );

    if (guardiansWithEmail.length > 0) {
      console.log(
        `[SOS Alert] Disagreeing with danger: Dispatching emergency emails to ${guardiansWithEmail.length} trusted contacts...`
      );

      // Send to all guardians concurrently in the background
      Promise.allSettled(
        guardiansWithEmail.map(async (guardian) => {
          const result = await emailService.sendSOSEmergencyEmail({
            guardianEmail: guardian.email,
            guardianName: guardian.name,
            victimName: user?.name || "A Shield User",
            victimPhone: user?.phone || "Not specified",
            victimEmail: user?.email || "",
            address: address || "GPS Coordinates Attached",
            lat: Number(lat),
            lng: Number(lng),
            alertType: type || "Emergency SOS Alert",
            duressActivated: !!duressActivated,
            timestamp: new Date().toLocaleString(),
          });

          // Log to audit log so administrator can see the email dispatch
          await AuditLog.create({
            action: "EMERGENCY_EMAIL_DISPATCHED",
            category: "dispatch",
            details: `Emergency SOS email sent to ${guardian.name} (${guardian.email}) for user ${user?.name || "Citizen"} at GPS: ${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`,
            actor: user?.email || "SOS User",
            target: guardian.email,
            ip: req.ip || "127.0.0.1",
          }).catch(() => {});

          return result;
        })
      ).then((results) => {
        const fulfilled = results.filter((r) => r.status === "fulfilled").length;
        console.log(`[SOS Alert] ✓ Successfully logged & dispatched ${fulfilled} guardian alert emails.`);
      }).catch((e) => {
        console.warn("[SOS Alert] Background email error:", e.message);
      });
    }

    res.status(201).json({
      success: true,
      alert,
      emailsDispatchedCount: guardiansWithEmail.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
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