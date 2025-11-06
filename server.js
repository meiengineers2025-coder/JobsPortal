// ──────────────────────────────────────────────
// ✅ JOB PORTAL — SERVER ENTRY FILE (server.js)
// ──────────────────────────────────────────────

const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

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
// ✅ ROUTES (changed to lowercase to match GitHub file names)
// ──────────────────────────────────────────────
app.use("/", require("./routes/auth"));
app.use("/candidate", require("./routes/candidates")); // <-- lowercase fixed
app.use("/employer", require("./routes/employers"));   // <-- lowercase fixed

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