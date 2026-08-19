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

    relationship: {
      type: String
    },

    isPrimary: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Guardian = mongoose.model("Guardian", guardianSchema);

export default Guardian;