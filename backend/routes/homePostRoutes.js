const express = require("express");
const router = express.Router();

const uploadMedia = require("../middleware/uploadMedia"); // ✅ CORRECT IMPORT
const { protect } = require("../middleware/authMiddleware");

const {
  createHomePost,
  getAllHomePosts,
  getHomePostById,
  updateHomePost,
  deleteHomePost,
} = require("../controllers/homePostController");

// ==========================================================
// CREATE HOME POST (supports BOTH image + video)
// ==========================================================
router.post(
  "/",
  uploadMedia.fields([
    { name: "image", maxCount: 10 }, // allow up to 10 images
    { name: "video", maxCount: 5 }, // allow up to 5 videos
  ]),
  protect,
  createHomePost,
);

// ==========================================================
// GET ALL HOME POSTS
// ==========================================================
router.get("/", protect, getAllHomePosts);

// ==========================================================
// GET ONE HOME POST
// ==========================================================
router.get("/:id", protect, getHomePostById);

// ==========================================================
// UPDATE HOME POST
// ==========================================================
router.put("/:id", protect, updateHomePost);

// ==========================================================
// DELETE HOME POST
// ==========================================================
router.delete("/:id", protect, deleteHomePost);

module.exports = router;
