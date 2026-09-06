import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/auth.js";
import guardianRoutes from "./routes/guardians.js";
import alertRoutes from "./routes/alerts.js";
import locationRoutes from "./routes/location.js";
import adminRoutes from "./routes/admin.js";
import Broadcast from "./models/Broadcast.js";

connectDB();

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

// Attach io to app for use in routes
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/guardians", guardianRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/admin", adminRoutes);

// Public route for all users and mobile devices to read active emergency safety broadcasts
app.get("/api/broadcasts", async (req, res) => {
  try {
    const broadcasts = await Broadcast.find().sort({ createdAt: -1 }).limit(10);
    res.json({ success: true, broadcasts });
  } catch (error) {
    res.json({ success: true, broadcasts: [] });
  }
});

// Simple health check route
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "Shield Safety API Server is running",
    timestamp: new Date().toISOString(),
  });
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("share-location", (locationData) => {
    console.log("Live location received:", locationData);

    const { userId, lat, lng, accuracy } = locationData;

    if (!userId || lat === undefined || lng === undefined) {
      return;
    }

    // Broadcast location to admin dashboard / tracking clients
    io.emit("location-update", {
      userId,
      lat,
      lng,
      accuracy,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Shield API Server running on port ${PORT}`);
});