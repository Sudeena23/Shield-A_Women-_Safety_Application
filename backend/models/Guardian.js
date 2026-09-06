import mongoose from "mongoose";

const guardianSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    phone: {
      type: String,
      required: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ""
    },

    relationship: {
      type: String,
      default: "Friend"
    },

    isPrimary: {
      type: Boolean,
      default: false
    },

    avatarBg: {
      type: String,
      default: "bg-[#9e6133]"
    },

    status: {
      type: String,
      default: "Active"
    }
  },
  {
    timestamps: true
  }
);

const Guardian = mongoose.model("Guardian", guardianSchema);

export default Guardian;