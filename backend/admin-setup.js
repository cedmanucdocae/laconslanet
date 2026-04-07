// admin-setup.js
// Run: node admin-setup.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/yourdbname"; // Update if needed

async function createOrUpdateAdmin() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const email = "admin@admin.com";
  const password = "admin12345";
  const adminRole = "admin";

  let user = await User.findOne({ email });
  if (!user) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      role: adminRole,
      name: "Admin",
    });
    await user.save();
    console.log("Admin user created:", email);
  } else {
    user.role = adminRole;
    await user.save();
    console.log("Existing user updated to admin:", email);
  }

  await mongoose.disconnect();
}

createOrUpdateAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
