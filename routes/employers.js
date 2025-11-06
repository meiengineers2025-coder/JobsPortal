// ──────────────────────────────────────────────
// ✅ Employer Routes — Post Jobs, View Applicants
// routes/employers.js
// ──────────────────────────────────────────────

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

// ✅ Middleware to protect employer routes
function requireEmployer(req, res, next) {
  if (!req.session.user || req.session.user.accountType !== "employer") {
    return res.redirect("/login");
  }
  next();
}

// ✅ Employer Dashboard
router.get("/dashboard", requireEmployer, (req, res) => {
  const jobs = db
    .prepare("SELECT * FROM jobs WHERE employerId = ? ORDER BY createdAt DESC")
    .all(req.session.user.id);

  res.render("employer/dashboard", {
    user: req.session.user,
    jobs,
  });
});

// ✅ Post new job (form page)
router.get("/post-job", requireEmployer, (req, res) => {
  res.render("employer/post-job", { user: req.session.user });
});

// ✅ Create Job (POST)
router.post("/post-job", requireEmployer, (req, res) => {
  const { title, location, salary, description } = req.body;

  db.prepare(
    "INSERT INTO jobs (employerId, title, location, salary, description, createdAt) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).run(req.session.user.id, title, location, salary, description);

  res.redirect("/employer/dashboard");
});

// ✅ View applicants for a job
router.get("/applicants/:jobId", requireEmployer, (req, res) => {
  const jobId = req.params.jobId;

  const applicants = db
    .prepare(
      `SELECT users.name, users.email, users.resume, applications.status
       FROM applications
       INNER JOIN users ON users.id = applications.candidateId
       WHERE applications.jobId = ?`
    )
    .all(jobId);

  res.render("employer/applicants", {
    user: req.session.user,
    applicants,
  });
});

module.exports = router;