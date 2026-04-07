// fix-user-passwords.js
// Run: node fix-user-passwords.js
// This script will re-hash any user passwords that are not valid bcrypt hashes (i.e., not 60 chars or not starting with $2)

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/LaConslaNet";

function isBcryptHash(str) {
  return typeof str === "string" && str.length === 60 && str.startsWith("$2");
}

async function fixUserPasswords() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const users = await User.find({});
  let fixed = 0;

  for (const user of users) {
    if (!isBcryptHash(user.password)) {
      console.log(`Fixing password for user: ${user.email}`);
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      fixed++;
    }
  }

  console.log(`Done. Fixed ${fixed} user(s).`);
  await mongoose.disconnect();
}

fixUserPasswords().catch((err) => {
  console.error(err);
  process.exit(1);
});
