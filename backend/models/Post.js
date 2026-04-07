const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: [
      "birthday",
      "announcement",
      "lost_found",
      "school_news",
      "campus_wall",
      "homepost",
    ],
    required: true,
  },
  image: String,
  video: String,
  approved: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  reports: [
    {
      reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
