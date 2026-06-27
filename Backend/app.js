import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import mandiRoutes from "./routes/mandiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import disputeRoutes from "./routes/disputeRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import translationRoutes from "./routes/translationRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // allow images to load
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
});

app.use(globalLimiter);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Static Files ──────────────────────────────────────────────────────────────
app.use("/uploads", express.static("uploads"));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor(process.uptime()),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/mandi", mandiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/translate", translationRoutes);
app.use("/api/help", helpRoutes);
app.use("/api/admin", adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
// Express 5 uses '*path' not '*' for wildcard routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// ── Global Error Handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;