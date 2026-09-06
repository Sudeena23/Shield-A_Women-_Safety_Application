
import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
  
    emergencyAutoDispatch: {
      type: Boolean,
      default: true,
    },
    sosCooldownSeconds: {
      type: Number,
      default: 120,
    },

    gpsTrackingInterval: {
      type: Number,
      default: 5,
    },

    
    emergencyRadiusKm: {
      type: Number,
      default: 10,
    },
    audioRecordDurationSeconds: {
      type: Number,
      default: 30,
    },

    requireAdmin2FA: {
      type: Boolean,
      default: false,
    },
    sessionTimeoutMinutes: {
      type: Number,
      default: 60,
    },
    allowPublicRegistration: {
      type: Boolean,
      default: true,
    },

    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceNotice: {
      type: String,
      default:
        "Shield system is currently undergoing scheduled safety maintenance. Emergency hotlines remain active.",
    },
    updatedBy: {
      type: String,
      default: "System Admin",
    },
  },
  {
    timestamps: true, 
  }
);

const SystemSetting = mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
