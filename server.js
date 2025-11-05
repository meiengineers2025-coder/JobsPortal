import express from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// Determine actual file location
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB + tables
import "./sql/init-db-sqlite.js";

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme",
    resave: false,
    saveUninitialized: false,
  })
);

// ROUTES (each will be created shortly)
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import employerRoutes from "./routes/employers.js";
import candidateRoutes from "./routes/candidates.js";
import paymentRoutes from "./routes/payments.js";
import uploadsRoutes from "./routes/uploads.js";
import applicationsRoutes from "./routes/applications.js";
import referralsRoutes from "./routes/referrals.js";
import whatsappRoutes from "./routes/whatsapp.js";
import radarRoutes from "./routes/radar.js";
import aiRoutes from "./routes/ai.js";
import atsRoutes from "./routes/ats.js";
import leaderboardRoutes from "./routes/leaderboard.js";
import plansRoutes from "./routes/plans.js";

// USE ROUTES
app.use("/", publicRoutes);
app.use("/", authRoutes);
app.use("/", employerRoutes);
app.use("/", candidateRoutes);
app.use("/", paymentRoutes);
app.use("/", uploadsRoutes);
app.use("/", applicationsRoutes);
app.use("/", referralsRoutes);
app.use("/", whatsappRoutes);
app.use("/", radarRoutes);
app.use("/", aiRoutes);
app.use("/", atsRoutes);
app.use("/", leaderboardRoutes);
app.use("/", plansRoutes);

// HEALTH CHECK
app.get("/healthz", (req, res) => res.send("ok"));

// 404 PAGE
app.use((req, res) => {
  res.status(404).render("404", { user: req.session.user });
});

// START SERVER
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});