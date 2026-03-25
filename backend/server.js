require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const frontendUrl = process.env.FRONTEND_URL || "http://127.0.0.1:5501";

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});
// Make io available to routes
app.set("io", io);
// Serve uploads directory as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
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

// Import all route files
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const newsRoutes = require("./routes/schoolNewsRoutes");
const homePostRoutes = require("./routes/homePostRoutes");
const birthdayRoutes = require("./routes/birthdayRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const lostFoundRoutes = require("./routes/lostFoundRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const activityRoutes = require("./routes/activityRoutes");
const postRoutes = require("./routes/postRoutes");
const userRoutes = require("./routes/userRoutes");
const shareRoutes = require("./routes/shareRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reportRoutes = require("./routes/reportRoutes");

// Mount all routes
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

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/instanyaw";
const port = process.env.PORT || 5000;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// app.listen is now inside mongoose.connect
