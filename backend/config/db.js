import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log("Connecting to database...");
    const connection = await mongoose.connect(process.env.DB_URL);

    console.log("Successfully connected to database:", connection.connection.name);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};