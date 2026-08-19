import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    lat: {
      type: Number,
      required: true
    },

    lng: {
      type: Number,
      required: true
    },

    isSharing: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;