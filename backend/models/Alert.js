import mongoose from "mongoose";

const alertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      default: "SOS Alert"
    },

    title: {
      type: String,
      default: "Emergency SOS Broadcast Dispatched"
    },

    status: {
      type: String,
      enum: ["Active", "Resolved"],
      default: "Active"
    },

    lat: {
      type: Number,
      required: true
    },

    lng: {
      type: Number,
      required: true
    },

    address: {
      type: String,
      default: ""
    },

    victimName: {
      type: String,
      default: ""
    },

    victimPhone: {
      type: String,
      default: ""
    },

    recipientsCount: {
      type: Number,
      default: 0
    },

    details: {
      type: String,
      default: "SOS activated by user press in Shield Mobile Portal"
    },

    duressActivated: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Alert = mongoose.model("Alert", alertSchema);

export default Alert;