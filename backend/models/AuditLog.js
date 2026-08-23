/**
 *
 * Records important actions in the app (like when someone
 * sends a broadcast, changes settings, or logs in).
 */
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // Name of the action (e.g. "USER_CREATED", "SETTINGS_UPDATED")
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // Category: dispatch, user, broadcast, security, or system
    category: {
      type: String,
      enum: ["dispatch", "user", "broadcast", "security", "system"],
      default: "system",
    },

    // Plain English explanation of what happened
    details: {
      type: String,
      default: "",
    },

    // Who did the action (e.g. admin email)
    actor: {
      type: String,
      default: "Admin",
    },

    // Target object ID or affected user
    target: {
      type: String,
      default: "",
    },

    // IP address of user/admin
    ip: {
      type: String,
      default: "127.0.0.1",
    },
  },
  {
    timestamps: true, // Automatically records timestamp
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
