/**
 * Vercel Serverless Function Entry Point
 * This wraps the backend Express app for Vercel's serverless environment
 */

require("dotenv").config({ path: "../backend/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");

const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");

// Environment configuration
const frontendUrl =
  process.env.FRONTEND_URL || process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://127.0.0.1:5501";

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

app.set("io", io);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../backend/uploads")));

// CORS middleware
app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Import routes
const authRoutes = require("../backend/routes/authRoutes");
const profileRoutes = require("../backend/routes/profileRoutes");
const notificationRoutes = require("../backend/routes/notificationRoutes");
const newsRoutes = require("../backend/routes/schoolNewsRoutes");
const homePostRoutes = require("../backend/routes/homePostRoutes");
const birthdayRoutes = require("../backend/routes/birthdayRoutes");
const announcementRoutes = require("../backend/routes/announcementRoutes");
const lostFoundRoutes = require("../backend/routes/lostFoundRoutes");
const likeRoutes = require("../backend/routes/likeRoutes");
const commentRoutes = require("../backend/routes/commentRoutes");
const adminRoutes = require("../backend/routes/adminRoutes");
const activityRoutes = require("../backend/routes/activityRoutes");
const postRoutes = require("../backend/routes/postRoutes");
const userRoutes = require("../backend/routes/userRoutes");
const shareRoutes = require("../backend/routes/shareRoutes");
const messageRoutes = require("../backend/routes/messageRoutes");
const reportRoutes = require("../backend/routes/reportRoutes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/homeposts", homePostRoutes);
app.use("/api/birthdays", birthdayRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);

// MongoDB connection
const mongoUri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LaConslaNet";

// Connect to MongoDB (connection pooling for serverless)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export for Vercel
module.exports = app;
