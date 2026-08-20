/**
 * DATABASE CONNECTION (100% Free & Noob-Friendly)
 * ----------------------------------------------------
 * Connects to MongoDB (local or MongoDB Atlas).
 * If MongoDB is offline, it logs a clear beginner tip
 * instead of crashing the whole server.
 * ----------------------------------------------------
 */
import mongoose from "mongoose";

export const connectDB = async () => {
  const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/shield";

  try {
    console.log(`Connecting to MongoDB at: ${dbUrl}...`);
    const connection = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
    });

    console.log(`✓ Successfully connected to MongoDB database: "${connection.connection.name}"`);
  } catch (error) {
    console.warn("------------------------------------------------------------------");
    console.warn("⚠️  MongoDB Connection Notice:");
    console.warn(`    ${error.message}`);
    console.warn("💡  Tip: Make sure MongoDB is running locally, or use MongoDB Atlas.");
    console.warn("    Shield API server will continue running for WebSockets & clients.");
    console.warn("------------------------------------------------------------------");
  }
};