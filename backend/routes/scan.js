/**
 * routes/scan.js
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { scanUrl, getReport, modelStatus } = require("../controllers/scanController");

const router = express.Router();

// Validate URL input
const validateUrl = [
  body("url")
    .trim()
    .notEmpty().withMessage("URL is required")
    .isLength({ max: 2048 }).withMessage("URL too long")
    .custom((val) => {
      try {
        const u = new URL(val.startsWith("http") ? val : `http://${val}`);
        return !!u.hostname;
      } catch {
        throw new Error("Invalid URL format");
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
];

router.post("/scan-url",           validateUrl, scanUrl);
router.get("/threat-report/:id",   getReport);
router.get("/model-status",        modelStatus);

module.exports = router;
