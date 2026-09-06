
import mongoose from "mongoose";

export const connectDB = async () => {
  const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/shield";

  try {
    console.log(`Connecting to MongoDB at: ${dbUrl}...`);
    const connection = await mongoose.connect(dbUrl, {
      serverSelectionTimeoutMS: 5000, 
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