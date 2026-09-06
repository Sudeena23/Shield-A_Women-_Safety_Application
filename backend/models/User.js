import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    bloodGroup: {
      type: String,
      default: ""
    },

    medicalNotes: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: "Kathmandu, Nepal"
    },

    emergencyPin: {
      type: String,
      default: "4321"
    },

    settings: {
      type: Object,
      default: {
        autoPush: true,
        sirenSound: true,
        audioRecord: true,
        locationStreaming: true,
        silentDuress: true,
        nightMode: false,
        autoSmsGuardians: true,
        sosDelaySeconds: 0,
        fakeCallerName: "Mom",
        fakeCallDelaySeconds: 5,
        sirenVolume: 80,
        guardianCheckInReminder: true,
        lowBatteryDistressAlert: true
      }
    },

    status: {
      type: String,
      enum: ["Active", "Suspended"],
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;