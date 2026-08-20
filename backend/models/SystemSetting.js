/**
 * Stores general configurations for the Shield Safety app..
 * ----------------------------------------------------
 */
import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    // Auto-create dispatch task when SOS is triggered (true/false)
    emergencyAutoDispatch: {
      type: Boolean,
      default: true,
    },

    // Seconds user must wait between pressing SOS to prevent spam
    sosCooldownSeconds: {
      type: Number,
      default: 120,
    },


    // Seconds between live GPS updates on the map
    gpsTrackingInterval: {
      type: Number,
      default: 5,
    },

    // Default search radius in kilometers for emergency responder map
    emergencyRadiusKm: {
      type: Number,
      default: 10,
    },

    // Duration of audio clip recorded during an emergency
    audioRecordDurationSeconds: {
      type: Number,
      default: 30,
    },

    // Two-factor authentication toggle for extra admin security
    requireAdmin2FA: {
      type: Boolean,
      default: false,
    },

    // Idle session timeout in minutes
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
    },

    // Allow new users to register publicly (true) or restrict to admin-created (false)
    allowPublicRegistration: {
      type: Boolean,
      default: true,
    },

    // Put system in maintenance mode
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    // Message shown when maintenance mode is turned on
    maintenanceNotice: {
      type: String,
      default:
        "Shield system is currently undergoing scheduled safety maintenance. Emergency hotlines remain active.",
    },

    // Email or name of administrator who last changed settings
    updatedBy: {
      type: String,
      default: "System Admin",
    },
  },
  {
    timestamps: true, // Automatically tracks createdAt & updatedAt
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
