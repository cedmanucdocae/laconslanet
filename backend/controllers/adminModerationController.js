const Post = require("../models/Post");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");

// ==================== POST MODERATION ====================

// Get all posts with full details
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "firstName lastName email department")
      .select("+reports")
      .sort({ createdAt: -1 });

    const enrichedPosts = posts.map((post) => ({
      _id: post._id,
      userId: post.user?._id,
      firstName: post.user?.firstName,
      lastName: post.user?.lastName,
      email: post.user?.email,
      department: post.user?.department,
      contentType: post.category || "homepost",
      content: post.content || "",
      image: post.image,
      video: post.video,
      createdAt: post.createdAt,
      likes: post.likes || [],
      comments: post.comments || [],
      reports: post.reports || [],
      approved: post.approved,
    }));

    res.json(enrichedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

// Approve flagged post
exports.approvePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { approved: true, reports: [] },
      { new: true },
    );

    // Log activity
    await createActivityLog(req.user._id, "approved", "Post", post._id);

    res.json({ message: "Post approved", post });
  } catch (error) {
    res.status(500).json({ message: "Error approving post", error });
  }
};

// Reject/delete flagged post
exports.rejectPost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    // Log activity
    await createActivityLog(req.user._id, "deleted", "Post", req.params.id);

    res.json({ message: "Post rejected and deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting post", error });
  }
};

// Flag a post as inappropriate
exports.flagPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          reports: { reportedBy: req.user._id, reason, date: new Date() },
        },
      },
      { new: true },
    );

    // Log activity
    await createActivityLog(req.user._id, "flagged", "Post", post._id, reason);

    res.json({ message: "Post flagged", post });
  } catch (error) {
    res.status(500).json({ message: "Error flagging post", error });
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const enrichedUsers = users.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      department: user.department,
      role: user.role,
      warnings: user.warnings || 0,
      violations: user.violations || [],
      isBanned: user.isBanned || false,
      createdAt: user.createdAt,
    }));

    res.json(enrichedUsers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

// Warn a user
exports.warnUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $inc: { warnings: 1 },
        $push: { violations: { type: "warning", reason, date: new Date() } },
      },
      { new: true },
    ).select("-password");

    // Ban after 3 warnings
    if (user.warnings >= 3) {
      user.isBanned = true;
      await user.save();
    }

    // Log activity
    await createActivityLog(req.user._id, "warned", "User", user._id, reason);

    res.json({ message: `User warned (${user.warnings}/3)`, user });
  } catch (error) {
    res.status(500).json({ message: "Error warning user", error });
  }
};

// Ban a user
exports.banUser = async (req, res) => {
  try {
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        isBanned: true,
        $push: { violations: { type: "ban", reason, date: new Date() } },
      },
      { new: true },
    ).select("-password");

    // Log activity
    await createActivityLog(req.user._id, "banned", "User", user._id, reason);

    res.json({ message: "User banned", user });
  } catch (error) {
    res.status(500).json({ message: "Error banning user", error });
  }
};

// Unban a user
exports.unbanUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, warnings: 0 },
      { new: true },
    ).select("-password");

    // Log activity
    await createActivityLog(req.user._id, "unbanned", "User", user._id);

    res.json({ message: "User unbanned", user });
  } catch (error) {
    res.status(500).json({ message: "Error unbanning user", error });
  }
};

// ==================== ACTIVITY LOG ====================

// Get all activity logs
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate("userId", "firstName lastName")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity logs", error });
  }
};

// Helper function to create activity log
async function createActivityLog(
  userId,
  action,
  contentType,
  contentId,
  details = "",
) {
  try {
    const log = new ActivityLog({
      userId,
      action,
      contentType,
      contentId,
      details,
    });
    await log.save();
  } catch (error) {
    console.error("Error creating activity log:", error);
  }
}

// ==================== STATISTICS ====================

// Get content statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const totalUsers = await User.countDocuments();
    const flaggedPosts = await Post.countDocuments({
      reports: { $exists: true, $ne: [] },
    });

    const postsByType = await Post.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const totalLikes = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } },
    ]);

    const totalComments = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$comments" } } } },
    ]);

    const totalReports = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$reports" } } } },
    ]);

    const topPosts = await Post.find()
      .populate("user", "firstName lastName")
      .sort({ likes: -1 })
      .limit(5);

    res.json({
      totalPosts,
      totalUsers,
      flaggedPosts,
      postsByType,
      totalLikes: totalLikes[0]?.total || 0,
      totalComments: totalComments[0]?.total || 0,
      totalReports: totalReports[0]?.total || 0,
      topPosts,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error });
  }
};
