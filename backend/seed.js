/**
 * DATABASE SEED SCRIPT 
 * ----------------------------------------------------
 * Seeds default administrator, test user, guardians,
 * sample SOS dispatches, broadcasts, and system settings.
 * Run with: npm run seed
 * ----------------------------------------------------
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Guardian from "./models/Guardian.js";
import Alert from "./models/Alert.js";
import SystemSetting from "./models/SystemSetting.js";
import AuditLog from "./models/AuditLog.js";
import Broadcast from "./models/Broadcast.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/shield";
    console.log(`Connecting to MongoDB at ${dbUrl}...`);
    await mongoose.connect(dbUrl);

    console.log("Cleaning existing database collections...");
    await User.deleteMany({});
    await Guardian.deleteMany({});
    await Alert.deleteMany({});
    await SystemSetting.deleteMany({});
    await AuditLog.deleteMany({});
    await Broadcast.deleteMany({});

    console.log("Creating default admin and user accounts...");
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash("admin123", salt);
    const userPassword = await bcrypt.hash("user123", salt);

    const admin = await User.create({
      name: "Shield Administrator",
      email: "admin@shield.com",
      password: adminPassword,
      phone: "+977 9801234567",
      role: "admin",
      status: "Active",
      bloodGroup: "O+",
      medicalNotes: "Emergency Duty Officer",
    });

    const user = await User.create({
      name: "Sneha Sharma",
      email: "user@shield.com",
      password: userPassword,
      phone: "+977 9841-382910",
      role: "user",
      bloodGroup: "O+",
      medicalNotes: "No known allergies. Asthma inhaler in backpack.",
      status: "Active",
      emergencyPin: "9911",
    });

    console.log("Creating default emergency guardians...");
    await Guardian.create({
      user: user._id,
      name: "Priya Sharma",
      phone: "+977 9841-987654",
      relationship: "Mother",
      isPrimary: true,
    });

    await Guardian.create({
      user: user._id,
      name: "Rohan Sharma",
      phone: "+977 9841-234567",
      relationship: "Brother",
      isPrimary: false,
    });

    console.log("Creating initial sample SOS alerts...");
    await Alert.create({
      user: user._id,
      type: "SOS Alert",
      lat: 27.7172,
      lng: 85.324,
      address: "Durbar Marg, Kathmandu",
      victimName: user.name,
      victimPhone: user.phone,
      recipientsCount: 2,
      status: "Active",
      details: "Emergency SOS triggered from Shield Mobile Application",
    });

    console.log("Creating default system settings...");
    await SystemSetting.create({
      emergencyAutoDispatch: true,
      sosCooldownSeconds: 120,
      smsGatewayMode: "mock",
      smsEmergencyTemplate:
        "EMERGENCY SOS ALERT! {victimName} needs immediate assistance! Location: {location}. Live Map: {mapLink}",
      gpsTrackingInterval: 5,
      emergencyRadiusKm: 10,
      audioRecordDurationSeconds: 30,
      requireAdmin2FA: false,
      sessionTimeoutMinutes: 60,
      allowPublicRegistration: true,
      maintenanceMode: false,
      maintenanceNotice:
        "Shield system is currently undergoing scheduled safety maintenance.",
      updatedBy: admin.email,
    });

    console.log("Creating sample emergency broadcast...");
    await Broadcast.create({
      title: "Monsoon Weather Advisory - High Flood Risk",
      message:
        "Heavy rainfall anticipated across low-lying zones in Kathmandu valley. Keep emergency tracking enabled.",
      category: "Severe Weather",
      priority: "High",
      sentBy: admin.name,
      recipientCount: 15,
      active: true,
    });

    console.log("Creating initial audit log entries...");
    await AuditLog.create({
      action: "SYSTEM_INITIALIZED",
      category: "system",
      details: "Shield Safety database initialized and seeded with default data",
      actor: admin.email,
      ip: "127.0.0.1",
    });

    console.log("\n==========================================");
    console.log("DATABASE SEEDED SUCCESSFULLY!");
    console.log("==========================================");
    console.log("Demo Credentials:");
    console.log("  Admin Login:");
    console.log("    Email:    admin@shield.com");
    console.log("    Password: admin123");
    console.log("  User Login:");
    console.log("    Email:    user@shield.com");
    console.log("    Password: user123");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
