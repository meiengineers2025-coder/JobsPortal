// ──────────────────────────────────────────────
// ✅ JOB PORTAL — SERVER ENTRY FILE (server.js)
// ──────────────────────────────────────────────

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();

// ──────────────────────────────────────────────
// ✅ MIDDLEWARE
// ──────────────────────────────────────────────
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ──────────────────────────────────────────────
// ✅ ROUTES (lowercase to match filenames)
// ──────────────────────────────────────────────
app.use("/", require("./routes/auth"));
app.use("/candidate", require("./routes/candidates"));
app.use("/employer", require("./routes/employers"));

// ✅ Redirect root (/) → /login
app.get("/", (req, res) => {
  res.redirect("/login");
});

// ──────────────────────────────────────────────
// ✅ SERVER LISTENER
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});