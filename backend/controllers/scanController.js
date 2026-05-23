/**
 * controllers/scanController.js
 * Orchestrates the full scan pipeline: URL analysis → HTML scan → SSL check → AI prediction.
 */

const { v4: uuidv4 } = require("uuid");
const { analyzeUrl } = require("../services/urlAnalyzer");
const { scanHtml }   = require("../services/htmlScanner");
const { checkSsl }   = require("../services/sslChecker");
const { getPrediction, getModelStatus } = require("../services/aiClient");
const ScanResult     = require("../models/ScanResult");

// In-memory fallback (when MongoDB is unavailable)
const inMemoryStore = [];
const MAX_IN_MEMORY = 200;

/**
 * POST /api/scan-url
 * Full phishing detection pipeline.
 */
async function scanUrl(req, res, next) {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  const scanId    = uuidv4();
  const startTime = Date.now();

  try {
    // ── Step 1: URL Feature Analysis (synchronous, fast) ──────────────────
    const urlResult = analyzeUrl(url);
    if (urlResult.error) {
      return res.status(400).json({ error: `Invalid URL: ${urlResult.error}` });
    }

    // ── Step 2: HTML + SSL in Parallel ────────────────────────────────────
    const [htmlResult, sslResult] = await Promise.allSettled([
      scanHtml(url),
      checkSsl(urlResult.meta.hostname),
    ]);

    const html = htmlResult.status === "fulfilled"
      ? htmlResult.value
      : { fetchable: false, features: {}, findings: [], details: {} };

    const ssl  = sslResult.status === "fulfilled"
      ? sslResult.value
      : { valid: false, warnings: ["SSL check failed"], error: "check failed" };

    // ── Step 3: Merge HTML features into URL features ──────────────────────
    const mergedFeatures = {
      ...urlResult.features,
      has_form:              html.features?.has_form              ?? 0,
      external_script_count: html.features?.external_script_count ?? 0,
      iframe_count:          html.features?.iframe_count          ?? 0,
    };

    // ── Step 4: AI Prediction ──────────────────────────────────────────────
    const aiResponse  = await getPrediction(mergedFeatures);
    const aiData      = aiResponse.data;

    // ── Step 5: Aggregate all warnings ────────────────────────────────────
    const allWarnings = [
      ...(urlResult.meta.warnings || []),
      ...(html.findings           || []),
      ...(ssl.warnings            || []),
      ...(aiData.reasons          || []),
    ];

    const scanDuration = Date.now() - startTime;

    // ── Step 6: Build response payload ────────────────────────────────────
    const scanData = {
      scanId,
      url,
      prediction:       aiData.prediction,
      threatScore:      aiData.threat_score,
      riskLevel:        aiData.risk_level,
      confidence:       aiData.confidence,
      urlFeatures:      mergedFeatures,
      urlMeta:          urlResult.meta,
      htmlDetails:      html.details    || {},
      htmlFindings:     html.findings   || [],
      sslInfo:          ssl,
      reasons:          [...new Set(allWarnings)],
      featureScores:    aiData.feature_scores || {},
      aiEngineFallback: aiResponse.fallback || false,
      aiResult:         aiData,
      scanDuration,
    };

    // ── Step 7: Persist ───────────────────────────────────────────────────
    try {
      await ScanResult.create(scanData);
    } catch {
      // MongoDB unavailable — store in memory
      inMemoryStore.unshift({ ...scanData, createdAt: new Date() });
      if (inMemoryStore.length > MAX_IN_MEMORY) inMemoryStore.pop();
    }

    return res.json({
      success: true,
      ...scanData,
    });

  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/threat-report/:id
 * Fetch a specific scan by scanId.
 */
async function getReport(req, res, next) {
  const { id } = req.params;
  try {
    let report = null;
    try {
      report = await ScanResult.findOne({ scanId: id });\n    } catch {}\n    if (!report) {\n      report = inMemoryStore.find((r) => r.scanId === id);\n    }\n    if (!report) {\n      return res.status(404).json({ error: "Report not found" });\n    }\n    res.json({ success: true, report });\n  } catch (err) {\n    next(err);\n  }\n}\n\n/**\n * GET /api/model-status\n */\nasync function modelStatus(req, res, next) {\n  try {\n    const status = await getModelStatus();\n    res.json(status);\n  } catch (err) {\n    next(err);\n  }\n}\n\nmodule.exports = { scanUrl, getReport, modelStatus, inMemoryStore };\n"
