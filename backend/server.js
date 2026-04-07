const path = require("path");
const dotenv = require("dotenv");

const rootEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: rootEnvPath });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const JWT_SECRET = process.env.JWT_SECRET || "dev-local-secret";

const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const defaultFrontendOrigins = [
  "http://127.0.0.1:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5500",
  "http://localhost:5501",
];

const envOrigins = (process.env.FRONTEND_URL || process.env.FRONTEND_URLS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins =
  envOrigins.length > 0 ? envOrigins : defaultFrontendOrigins;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  return allowedOrigins.includes(origin);
};

const corsOriginHandler = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
};

const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const authToken = socket.handshake?.auth?.token || "";
    const bearerToken = socket.handshake?.headers?.authorization || "";

    const rawToken = authToken || bearerToken.replace(/^Bearer\s+/i, "");
    if (!rawToken) return next(new Error("Unauthorized"));

    const decoded = jwt.verify(rawToken, JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id username avatar");
    if (!user) return next(new Error("Unauthorized"));

    socket.user = {
      _id: user._id.toString(),
      username: user.username,
      avatar: user.avatar,
    };

    return next();
  } catch (err) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.user?._id;
  if (userId) {
    socket.join(userId);
  }

  socket.on("join-conversation", (conversationId) => {
    if (!conversationId) return;
    socket.join(conversationId);
  });

  socket.on("typing-start", ({ conversationId }) => {
    if (!conversationId || !socket.user) return;
    socket.to(conversationId).emit("typing", {
      conversationId,
      userId: socket.user._id,
      username: socket.user.username,
      isTyping: true,
    });
  });

  socket.on("typing-stop", ({ conversationId }) => {
    if (!conversationId || !socket.user) return;
    socket.to(conversationId).emit("typing", {
      conversationId,
      userId: socket.user._id,
      username: socket.user.username,
      isTyping: false,
    });
  });
});
// Make io available to routes
app.set("io", io);
// Serve uploads directory as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    origin: corsOriginHandler,
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
const adminModerationRoutes = require("./routes/adminModerationRoutes");

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
app.use("/api/admin", adminModerationRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/shares", shareRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);

const mongoUri =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LaConslaNet";
const port = process.env.PORT || 5000;

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("Connected to MongoDB");
    // Autorun admin account creation/update
    (async () => {
      try {
        const email = "admin@admin.com";
        const password = "admin12345";
        const adminRole = "admin";
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            email,
            password, // Let Mongoose pre-save hook hash it
            role: adminRole,
            firstName: "Admin",
            lastName: "Account",
            department: "CITE",
            username: "admin",
          });
          await user.save();
          console.log("Admin user created:", email);
        } else {
          user.role = adminRole;
          await user.save();
          console.log("Existing user updated to admin:", email);
        }
      } catch (err) {
        console.error("Admin setup error:", err);
      }
    })();
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// app.listen is now inside mongoose.connect
