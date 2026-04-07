const express = require("express");
const router = express.Router();
const {
  getAllPosts,
  approvePost,
  rejectPost,
  flagPost,
  getAllUsers,
  warnUser,
  banUser,
  unbanUser,
  getActivityLogs,
  getStatistics,
} = require("../controllers/adminModerationController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// ==================== POST MODERATION ====================
router.get("/posts/all", protect, adminOnly, getAllPosts);
router.patch("/posts/:id/approve", protect, adminOnly, approvePost);
router.delete("/posts/:id/reject", protect, adminOnly, rejectPost);
router.post("/posts/:id/flag", protect, flagPost);

// ==================== USER MANAGEMENT ====================
router.get("/users/all", protect, adminOnly, getAllUsers);
router.patch("/users/:userId/warn", protect, adminOnly, warnUser);
router.patch("/users/:userId/ban", protect, adminOnly, banUser);
router.patch("/users/:userId/unban", protect, adminOnly, unbanUser);

// ==================== ACTIVITY LOG ====================
router.get("/activitylog/all", protect, adminOnly, getActivityLogs);

// ==================== STATISTICS ====================
router.get("/statistics", protect, adminOnly, getStatistics);

module.exports = router;
