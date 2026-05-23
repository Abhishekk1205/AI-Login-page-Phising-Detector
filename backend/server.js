/**
 * server.js — PhishDetect Express API
 * Entry point: sets up middleware, routes, and MongoDB connection.
 */

require("dotenv").config();
const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const morgan    = require("morgan");
const mongoose  = require("mongoose");
const path      = require("path");

const scanRoutes    = require("./routes/scan");
const historyRoutes = require("./routes/history");
const errorHandler  = require("./middleware/errorHandler");
const rateLimiter   = require("./middleware/rateLimiter");

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing Middleware ───────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
app.use("/api/scan-url", rateLimiter.scanLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use("/api", scanRoutes);
app.use("/api", historyRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    service:   "PhishDetect Backend",
    timestamp: new Date().toISOString(),
    mongo:     mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── MongoDB Connection ──────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/phishdetect";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB connected → ${MONGO_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 PhishDetect Backend → http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.log("⚠️  Starting without MongoDB (scan history will be in-memory)");
    app.listen(PORT, () => {
      console.log(`🚀 PhishDetect Backend (no DB) → http://localhost:${PORT}`);
    });
  });

module.exports = app;
