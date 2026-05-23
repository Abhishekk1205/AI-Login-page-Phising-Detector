"""
AI Engine — Flask API
Serves phishing predictions and model status via REST endpoints.
Auto-trains the model on first startup if no saved model is found.
"""

import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# Ensure prediction module can be imported
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

from prediction.predictor import predict, get_model_status

# ─── App Setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ─── Pre-warm model on startup ────────────────────────────────────────────────
logger.info("🔄 Pre-loading AI model...")
try:
    _status = get_model_status()
    logger.info(f"✅ Model ready — Accuracy: {_status['metrics'].get('accuracy', '?')}%")
except Exception as e:
    logger.error(f"❌ Model load failed: {e}")


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok", "service": "PhishDetect AI Engine"})


@app.route("/predict", methods=["POST"])
def predict_endpoint():
    """
    POST /predict
    Body: { features: { url_length, has_https, dot_count, ... } }
    Returns: { prediction, confidence, threat_score, risk_level, reasons, feature_scores }
    """
    try:
        data = request.get_json(force=True)
        if not data or "features" not in data:
            return jsonify({"error": "Missing 'features' in request body"}), 400

        features = data["features"]

        # Validate feature types
        for key, val in features.items():
            if not isinstance(val, (int, float)):
                return jsonify({"error": f"Feature '{key}' must be numeric"}), 400

        result = predict(features)
        logger.info(f"Prediction: {result['prediction']} (score={result['threat_score']})")
        return jsonify(result)

    except Exception as e:
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({"error": "Internal prediction error", "details": str(e)}), 500


@app.route("/model-status", methods=["GET"])
def model_status():
    """
    GET /model-status
    Returns current model metrics and feature info.
    """
    try:
        status = get_model_status()
        return jsonify(status)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Entry Point ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 AI Engine → http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
