
import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
  
    title: {
      type: String,
      required: true,
      trim: true,
    },

   
    message: {
      type: String,
      required: true,
      trim: true,
    },


   
    priority: {
      type: String,
      enum: ["Normal", "High", "Critical"],
      default: "Normal",
    },

    sentBy: {
      type: String,
    },

    
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
