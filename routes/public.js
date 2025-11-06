// routes/public.js

import express from "express";
import { redirectIfLoggedIn } from "../src/utils/access.js";

const router = express.Router();

// Landing Page (index.ejs)
router.get("/", (req, res) => {
  res.render("index", {
    user: req.session.user || null,
  });
});

// Show login/signup selection
router.get("/start", redirectIfLoggedIn, (req, res) => {
  res.render("login");
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

export default router;