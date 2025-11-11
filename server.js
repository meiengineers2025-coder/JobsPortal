// server.js
// MAIN BACKEND ENTRY POINT for "Best Job Portal in the World"

require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- MIDDLEWARE -------------------- */

// EJS template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use(express.static(path.join(__dirname, "public")));

// Forms (POST) body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session store (SQLite)
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.db",
      dir: "./" // Render allows writing to project root at runtime
    }),
    secret: process.env.SESSION_SECRET || "superSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
  })
);

/* -------------------- ROUTES -------------------- */

app.use("/", require("./routes/public"));            // homepage, login, signup views
app.use("/auth", require("./routes/auth"));          // POST login/signup
app.use("/employer", require("./routes/employers")); // employer dashboard + post jobs
app.use("/candidate", require("./routes/candidates")); // candidate dashboard + profile edit
app.use("/payments", require("./routes/payments"));  // PayPal/Razorpay + invoice email
app.use("/uploads", require("./routes/uploads"));    // Resume/video uploads
app.use("/apps", require("./routes/applications"));  // job applications
app.use("/referrals", require("./routes/referrals")); // referral rewards
app.use("/whatsapp", require("./routes/whatsapp")); // WhatsApp job alerts
app.use("/radar", require("./routes/radar"));       // live hiring radar SSE
app.use("/ai", require("./routes/ai"));             // AI JD/Cover letter generator
app.use("/ats", require("./routes/ats"));           // ATS kanban pipeline
app.use("/leaderboard", require("./routes/leaderboard")); // leaderboard
app.use("/plans", require("./routes/plans"));       // pricing / monetization

// 404 fallback
app.use((req, res) => res.status(404).render("404"));

/* -------------------- SERVER START -------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Job Portal running on: http://localhost:${PORT}`);
});