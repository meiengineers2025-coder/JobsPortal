const express = require("express");
const path = require("path");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const app = express();

// ----------------------------------------------
// MIDDLEWARE
// ----------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

// Public folder for CSS, JS, images:
app.use(express.static("public"));

// For resumes and profile uploads:
app.use("/uploads", express.static("uploads"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ----------------------------------------------
// DATABASE CONNECTION (SESSION STORE)
// ----------------------------------------------
const dbOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
};

const sessionStore = new MySQLStore(dbOptions);

app.use(
  session({
    key: "session_cookie",
    secret: process.env.SESSION_SECRET || "supersecret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ----------------------------------------------
// ROUTES
// ----------------------------------------------
app.use("/", require("./routes/auth"));
app.use("/candidate", require("./routes/candidate"));
app.use("/employer", require("./routes/employer"));

app.get("/", (req, res) => {
  res.render("index");
});

// ----------------------------------------------
// START SERVER
// ----------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));