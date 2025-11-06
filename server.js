// ──────────────────────────────────────────────
// ✅ JOB PORTAL — SERVER ENTRY FILE (server.js)
// ──────────────────────────────────────────────

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load .env credentials (DB + PayPal or Razorpay keys)

const app = express();

// ──────────────────────────────────────────────
// ✅ MIDDLEWARE
// ──────────────────────────────────────────────
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

// Session for login system
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ──────────────────────────────────────────────
// ✅ ROUTES
// ──────────────────────────────────────────────
// IMPORTANT: make sure these files exist under /routes/
app.use("/", require("./routes/auth"));          // login/register
app.use("/candidate", require("./routes/candidate"));
app.use("/employer", require("./routes/employer"));

// ──────────────────────────────────────────────
// ✅ DEFAULT TEST ROUTE
// ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.send("✅ Server running successfully on Render.");
});

// ──────────────────────────────────────────────
// ✅ SERVER LISTENER
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});