
import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["dispatch", "user", "broadcast", "security", "system"],
      default: "system",
    },
    details: {
      type: String,
      default: "",
    },

   
    actor: {
      type: String,
      default: "Admin",
    },


    target: {
      type: String,
      default: "",
    },

    
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
