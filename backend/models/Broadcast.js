
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


    // Priority level: Normal, High, or Critical
    priority: {
      type: String,
      enum: ["Normal", "High", "Critical"],
      default: "Normal",
    },


    // Who sent the alert
    sentBy: {
      type: String,
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
