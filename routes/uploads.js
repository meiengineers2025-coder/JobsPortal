// routes/uploads.js

import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../src/config/db.js";
import { ensureCandidate } from "../src/utils/access.js";

const router = express.Router();

// ---------------------------------------
// Ensure uploads directory exists on Render
// ---------------------------------------
const uploadDir = "/data/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created upload directory:", uploadDir);
}

// ---------------------------------------
// Multer storage config
// ---------------------------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const safeName = `${req.session.user.id}_${Date.now()}${ext}`;
    cb(null, safeName);
  },
});

const upload = multer({ storage });

/**
 * UPLOAD RESUME (PDF/DOC)
 */
router.post("/upload/resume", ensureCandidate, upload.single("resume"), (req, res) => {
  if (!req.file) return res.status(400).send("No resume uploaded.");

  db.prepare(
    `UPDATE candidate_profiles SET resume_file = ? WHERE user_id = ?`
  ).run(req.file.filename, req.session.user.id);

  res.redirect("/candidate/dashboard");
});

/**
 * UPLOAD VIDEO RESUME (MP4)
 */
router.post("/upload/video", ensureCandidate, upload.single("video"), (req, res) => {
  if (!req.file) return res.status(400).send("No video uploaded.");

  db.prepare(
    `UPDATE candidate_profiles SET video_file = ? WHERE user_id = ?`
  ).run(req.file.filename, req.session.user.id);

  res.redirect("/candidate/dashboard");
});

export default router;