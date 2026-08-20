/**
 * ----------------------------------------------------
 * Stores emergency broadcast announcements sent by admins
 * to all users via free WebSockets.
 * ----------------------------------------------------
 */
import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    // Title of the emergency broadcast
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Detailed description/instructions for users
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Category of warning
    category: {
      type: String,
      enum: [
        "Severe Weather",
        "Security Advisory",
        "Curfew Alert",
        "System Notice",
        "Hazard Zone",
      ],
      default: "Security Advisory",
    },

    // Priority level: Normal, High, or Critical
    priority: {
      type: String,
      enum: ["Normal", "High", "Critical"],
      default: "Normal",
    },

    // Active status
    active: {
      type: Boolean,
      default: true,
    },

    // Who sent the alert
    sentBy: {
      type: String,
      default: "Central Dispatch",
    },

    // Number of users who received the alert
    recipientCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Broadcast = mongoose.model("Broadcast", broadcastSchema);

export default Broadcast;
