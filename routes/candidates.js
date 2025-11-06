// ──────────────────────────────────────────────
// ✅ Candidate Routes — Candidate Dashboard, Resume Upload, Jobs List
// routes/Candidates.js
// ──────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

// ✅ Middleware to protect candidate routes
function requireCandidate(req, res, next) {
  if (!req.session.user || req.session.user.accountType !== "candidate") {
    return res.redirect("/login");
  }
  next();
}

// ✅ Candidate Dashboard
router.get("/dashboard", requireCandidate, (req, res) => {
  const jobs = db.prepare("SELECT * FROM jobs ORDER BY createdAt DESC").all();

  res.render("candidate/dashboard", {
    user: req.session.user,
    jobs,
  });
});

// ✅ Apply to a job (simple application record)
router.post("/apply/:jobId", requireCandidate, (req, res) => {
  const jobId = req.params.jobId;
  const userId = req.session.user.id;

  db.prepare(
    "INSERT INTO applications (candidateId, jobId, status) VALUES (?, ?, ?)"
  ).run(userId, jobId, "Applied");

  res.redirect("/candidate/dashboard");
});

// ✅ Upload Resume
router.post("/upload-resume", requireCandidate, (req, res) => {
  const file = req.files?.resume;

  if (!file) return res.send("❌ No resume uploaded");

  const filename = `resume-${Date.now()}-${file.name}`;
  const uploadPath = `public/resumes/${filename}`;

  file.mv(uploadPath, (err) => {
    if (err) return res.send("❌ Resume upload failed.");

    db.prepare(
      "UPDATE users SET resume = ? WHERE id = ?"
    ).run(filename, req.session.user.id);

    res.redirect("/candidate/dashboard");
  });
});

module.exports = router;