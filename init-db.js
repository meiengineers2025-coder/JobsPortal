// Run this file ONCE to initialize DB tables

const db = require("./config/db");
const User = require("./models/User");
const Job = require("./models/Job");
const Application = require("./models/Application");

db.query(User, (err) => {
  if (err) throw err;
  console.log("✅ users table created");
});

db.query(Job, (err) => {
  if (err) throw err;
  console.log("✅ jobs table created");
});

db.query(Application, (err) => {
  if (err) throw err;
  console.log("✅ applications table created");
});

console.log("🎉 Database setup completed.");
process.exit();