"""
AI Engine — Predictor
Loads the trained Random Forest model and exposes a predict() function.
"""

import os
import sys
import numpy as np
import joblib

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
MODEL_PATH = os.path.join(ROOT_DIR, "models", "phishing_rf_model.joblib")
META_PATH  = os.path.join(ROOT_DIR, "models", "model_meta.joblib")

FEATURE_NAMES = [
    "url_length",
    "has_https",
    "dot_count",
    "suspicious_keywords",
    "has_ip_address",
    "subdomain_count",
    "special_char_count",
    "has_form",
    "external_script_count",
    "iframe_count",
    "at_symbol",
    "double_slash_redirect",
    "dash_in_domain",
    "url_depth",
    "redirect_count",
]

# Human-readable explanations for each feature
FEATURE_EXPLANATIONS = {
    "url_length":            "Excessively long URL (phishing pages often use long URLs to obscure the real domain)",
    "has_https":             "Missing HTTPS (legitimate sites almost always use HTTPS)",
    "dot_count":             "High number of dots in domain (used to create fake subdomains)",
    "suspicious_keywords":   "Suspicious keywords detected (e.g. 'login', 'secure', 'verify', 'update')",
    "has_ip_address":        "IP address used as hostname (legitimate sites use domain names)",
    "subdomain_count":       "Multiple subdomains (e.g. secure.login.bank.phisher.com)",
    "special_char_count":    "Unusual special characters in URL (@, -, _, ~, %)",
    "has_form":              "Login form present on the page",
    "external_script_count": "High number of external JavaScript files",
    "iframe_count":          "iFrame elements detected (used to embed fake login forms)",
    "at_symbol":             "@ symbol in URL (used to trick browsers into ignoring the real domain)",
    "double_slash_redirect": "Double slash redirect trick in URL",
    "dash_in_domain":        "Hyphen in domain name (e.g. paypal-secure.com instead of paypal.com)",
    "url_depth":             "Deep URL path (many subdirectories to appear more legitimate)",
    "redirect_count":        "Multiple redirects detected",
}

_model = None
_meta  = None

def _ensure_model():
    """Load model lazily; train if not yet saved."""
    global _model, _meta
    if _model is not None:
        return

    if not os.path.exists(MODEL_PATH):
        print("⚠️  Model not found — training now (first run)...")
        sys.path.insert(0, os.path.join(ROOT_DIR, "training"))
        from train_model import train
        _model, _meta = train()
    else:
        _model = joblib.load(MODEL_PATH)
        _meta  = joblib.load(META_PATH) if os.path.exists(META_PATH) else {}


def predict(features: dict) -> dict:
    """
    Given a feature dict, return prediction result.

    Args:
        features: dict with keys matching FEATURE_NAMES

    Returns:
        {
          prediction:    "Phishing" | "Legitimate",
          confidence:    float (0–100),
          threat_score:  int (0–100),
          risk_level:    "Critical" | "High" | "Medium" | "Low" | "Safe",
          reasons:       [str, …],
          feature_scores: {feature: importance_pct, …},
        }
    """
    _ensure_model()

    # Build feature vector in the correct order
    vector = np.array([[features.get(f, 0) for f in FEATURE_NAMES]], dtype=float)

    proba     = _model.predict_proba(vector)[0]   # [P(legit), P(phishing)]
    phish_prob = float(proba[1])
    label      = "Phishing" if phish_prob >= 0.5 else "Legitimate"

    # Threat score: 0–100 from phishing probability
    threat_score = int(round(phish_prob * 100))

    # Risk level thresholds
    if threat_score >= 80:
        risk_level = "Critical"
    elif threat_score >= 60:
        risk_level = "High"
    elif threat_score >= 40:
        risk_level = "Medium"
    elif threat_score >= 20:
        risk_level = "Low"
    else:
        risk_level = "Safe"

    # Build human-readable reasons for flagged features
    reasons = _build_reasons(features, phish_prob)

    # Feature importance scores (normalised to %)
    importances = _meta.get("feature_importance", {})
    feature_scores = {
        f: round(importances.get(f, 0) * 100, 1)
        for f in FEATURE_NAMES
    }

    return {
        "prediction":    label,
        "confidence":    round(phish_prob * 100, 1),
        "threat_score":  threat_score,
        "risk_level":    risk_level,
        "reasons":       reasons,
        "feature_scores": feature_scores,
        "features_used": features,
    }


def _build_reasons(features: dict, phish_prob: float) -> list:
    """Build list of human-readable explanation strings."""
    reasons = []

    checks = [
        ("has_ip_address",        lambda v: v == 1),
        ("at_symbol",             lambda v: v == 1),
        ("has_https",             lambda v: v == 0),
        ("suspicious_keywords",   lambda v: v >= 3),
        ("url_length",            lambda v: v > 100),
        ("dot_count",             lambda v: v >= 5),
        ("subdomain_count",       lambda v: v >= 3),
        ("special_char_count",    lambda v: v >= 5),
        ("iframe_count",          lambda v: v >= 2),
        ("external_script_count", lambda v: v >= 10),
        ("dash_in_domain",        lambda v: v == 1),
        ("double_slash_redirect", lambda v: v == 1),
        ("url_depth",             lambda v: v >= 6),
        ("redirect_count",        lambda v: v >= 3),
    ]

    for feat, condition in checks:
        val = features.get(feat, 0)
        if condition(val):
            reasons.append(FEATURE_EXPLANATIONS[feat])

    if not reasons and phish_prob >= 0.5:
        reasons.append("Combination of multiple weak phishing signals detected by AI model")

    return reasons


def get_model_status() -> dict:
    """Return current model performance metrics."""
    _ensure_model()
    return {
        "status":   "ready",
        "metrics":  _meta,
        "features": FEATURE_NAMES,
    }
