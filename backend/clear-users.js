// clear-users.js
// Run: node clear-users.js
// This script will delete all users from the database except the admin account (admin@admin.com)

const mongoose = require("mongoose");
const User = require("./models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LaConslaNet";

async function clearUsers() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const result = await User.deleteMany({ email: { $ne: "admin@admin.com" } });
  console.log(
    `Deleted ${result.deletedCount} user(s), only admin@admin.com remains.`,
  );
  await mongoose.disconnect();
}

clearUsers().catch((err) => {
  console.error(err);
  process.exit(1);
});
