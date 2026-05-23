/**
 * services/aiClient.js
 * HTTP client that calls the Python Flask AI microservice.
 */

const axios = require("axios");

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || "http://localhost:8000";
const TIMEOUT       = 15000; // ms

/**
 * Send features to the AI engine and get a prediction.
 * @param {object} features - Feature dict matching FEATURE_NAMES in predictor.py
 * @returns {object} AI prediction result
 */
async function getPrediction(features) {
  try {
    const response = await axios.post(
      `${AI_ENGINE_URL}/predict`,
      { features },
      { timeout: TIMEOUT, headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: response.data };
  } catch (err) {
    const msg = err.response?.data?.error || err.message;
    // Fallback: simple rule-based score if AI engine is unavailable
    const fallbackScore = computeFallbackScore(features);
    return {
      success:  false,
      fallback: true,
      error:    msg,
      data: {
        prediction:   fallbackScore >= 50 ? "Phishing" : "Legitimate",
        confidence:   fallbackScore,
        threat_score: fallbackScore,
        risk_level:   fallbackScore >= 80 ? "Critical"
                      : fallbackScore >= 60 ? "High"
                      : fallbackScore >= 40 ? "Medium"
                      : fallbackScore >= 20 ? "Low" : "Safe",\n        reasons:      ["AI engine unavailable — rule-based fallback used"],\n        feature_scores: {},\n        ai_engine_offline: true,\n      },\n    };\n  }\n}\n\n/**\n * Rule-based fallback scoring (0–100) if the AI microservice is offline.\n */\nfunction computeFallbackScore(f) {\n  let score = 0;\n  if (f.has_ip_address)          score += 25;\n  if (!f.has_https)              score += 15;\n  if (f.at_symbol)               score += 20;\n  if (f.suspicious_keywords >= 3) score += 15;\n  if (f.url_length > 100)        score += 10;\n  if (f.subdomain_count >= 3)    score += 10;\n  if (f.iframe_count >= 2)       score += 10;\n  if (f.has_form && f.external_script_count > 5) score += 10;\n  if (f.dash_in_domain)          score += 5;\n  if (f.double_slash_redirect)   score += 5;\n  return Math.min(100, score);\n}\n\n/**\n * Fetch model status from the AI engine.\n */\nasync function getModelStatus() {\n  try {\n    const response = await axios.get(`${AI_ENGINE_URL}/model-status`, { timeout: 5000 });\n    return { online: true, data: response.data };\n  } catch {\n    return { online: false, data: null };\n  }\n}\n\nmodule.exports = { getPrediction, getModelStatus };\n"
