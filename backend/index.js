import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import guardianRoutes from "./routes/guardians.js";
import alertRoutes from "./routes/alerts.js";
import locationRoutes from "./routes/location.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/guardians", guardianRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/admin", adminRoutes);

// Simple health check route
app.get("/", (req, res) => {
  res.send("Shield API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});