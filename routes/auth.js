// routes/auth.js

import express from "express";
import bcrypt from "bcryptjs";
import db from "../src/config/db.js";
import { redirectIfLoggedIn } from "../src/utils/access.js";

const router = express.Router();

/** ---------------------------
 *  SHOW LOGIN + SIGNUP PAGES
 *  ---------------------------
*/
router.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login", { error: null });
});

router.get("/signup", redirectIfLoggedIn, (req, res) => {
  res.render("signup", { error: null });
});

/** ---------------------------
 *  SIGN UP
 *  ---------------------------
*/
router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.render("signup", { error: "All fields are required" });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const stmt = db.prepare(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`
    );

    stmt.run(name, email, hashed, role);

    return res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);
    return res.render("signup", { error: "Email already exists" });
  }
});

/** ---------------------------
 *  LOGIN
 *  ---------------------------
*/
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email);

  if (!user) {
    return res.render("login", { error: "Invalid credentials" });
  }

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) {
    return res.render("login", { error: "Invalid credentials" });
  }

  // store user in session
  req.session.user = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  if (user.role === "employer") return res.redirect("/employer/dashboard");
  if (user.role === "candidate") return res.redirect("/candidate/dashboard");

  res.redirect("/");
});

export default router;