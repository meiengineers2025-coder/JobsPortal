// ──────────────────────────────────────────────
// ✅ Authentication Routes — Login + Register
// routes/auth.js
// ──────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../utils/db"); // Database connection module (we will send next)

// ✅ Login page
router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

// ✅ Register page
router.get("/register", (req, res) => {
  res.render("register", { error: null });
});

// ✅ Handle registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    if (!email || !password || !name) {
      return res.render("register", { error: "All fields required." });
    }

    const hashed = await bcrypt.hash(password, 10);

    db.prepare(
      "INSERT INTO users (name, email, password, accountType) VALUES (?, ?, ?, ?)"
    ).run(name, email, hashed, accountType);

    res.redirect("/login");

  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.render("register", { error: "Email already exists." });
  }
});

// ✅ Handle login
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);

  if (!user) {
    return res.render("login", { error: "Invalid email or password." });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.render("login", { error: "Invalid email or password." });
  }

  req.session.user = user;

  if (user.accountType === "candidate") return res.redirect("/candidate/dashboard");
  if (user.accountType === "employer") return res.redirect("/employer/dashboard");

  res.redirect("/");
});

// ✅ Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;