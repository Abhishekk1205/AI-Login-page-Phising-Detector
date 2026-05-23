/**
 * middleware/rateLimiter.js
 */

const rateLimit = require("express-rate-limit");

// Scan endpoint: max 30 requests per 10 minutes per IP
const scanLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max:      30,
  message:  { error: "Too many scan requests — please wait and try again." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max:      100,
  message:  { error: "Rate limit exceeded." },
  standardHeaders: true,
  legacyHeaders:   false,
});

module.exports = { scanLimiter, apiLimiter };
