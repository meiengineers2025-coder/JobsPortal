// src/utils/access.js

export function ensureLoggedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

export function ensureEmployer(req, res, next) {
  if (!req.session.user || req.session.user.role !== "employer") {
    return res.redirect("/");
  }
  next();
}

export function ensureCandidate(req, res, next) {
  if (!req.session.user || req.session.user.role !== "candidate") {
    return res.redirect("/");
  }
  next();
}

// Prevent logged-in users from seeing login/signup screens
export function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    if (req.session.user.role === "employer") return res.redirect("/employer/dashboard");
    if (req.session.user.role === "candidate") return res.redirect("/candidate/dashboard");
  }
  next();

}
