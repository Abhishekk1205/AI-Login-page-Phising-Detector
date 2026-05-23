"""
AI Engine — Training Script
Generates a synthetic phishing dataset and trains a Random Forest classifier.
Run once: python training/train_model.py
The trained model is saved to models/phishing_rf_model.joblib
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, classification_report
)
import joblib

# ─── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR   = os.path.dirname(SCRIPT_DIR)
MODEL_DIR  = os.path.join(ROOT_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, "phishing_rf_model.joblib")
META_PATH  = os.path.join(MODEL_DIR, "model_meta.joblib")

# ─── Feature names (must match predictor.py) ─────────────────────────────────
FEATURE_NAMES = [
    "url_length",           # Length of the full URL
    "has_https",            # 1 if URL starts with https, else 0
    "dot_count",            # Number of dots in domain
    "suspicious_keywords",  # Count of phishing keywords (login, secure, update…)
    "has_ip_address",       # 1 if hostname is an IP address
    "subdomain_count",      # Number of subdomains
    "special_char_count",   # Count of @, -, _, ~, %
    "has_form",             # 1 if page has <form> element
    "external_script_count",# Number of external JS scripts
    "iframe_count",         # Number of iframes
    "at_symbol",            # 1 if URL contains @
    "double_slash_redirect",# 1 if // appears after protocol
    "dash_in_domain",       # 1 if domain has a hyphen
    "url_depth",            # Path depth (number of /)
    "redirect_count",       # Number of redirects (0 for static analysis)
]

# ─── Synthetic Dataset Generation ─────────────────────────────────────────────
def generate_dataset(n_samples: int = 12000, seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic synthetic phishing dataset.
    Phishing pages (label=1) have statistically different feature distributions
    than legitimate pages (label=0).
    """
    rng = np.random.default_rng(seed)

    n_phish = n_samples // 2
    n_legit = n_samples - n_phish

    def phishing_samples():
        return {
            "url_length":            rng.integers(60, 250, n_phish),
            "has_https":             rng.choice([0, 1], n_phish, p=[0.55, 0.45]),
            "dot_count":             rng.integers(3, 9, n_phish),
            "suspicious_keywords":   rng.integers(2, 10, n_phish),
            "has_ip_address":        rng.choice([0, 1], n_phish, p=[0.55, 0.45]),
            "subdomain_count":       rng.integers(2, 6, n_phish),
            "special_char_count":    rng.integers(3, 15, n_phish),
            "has_form":              rng.choice([0, 1], n_phish, p=[0.1, 0.9]),
            "external_script_count": rng.integers(5, 30, n_phish),
            "iframe_count":          rng.integers(1, 8, n_phish),
            "at_symbol":             rng.choice([0, 1], n_phish, p=[0.4, 0.6]),
            "double_slash_redirect": rng.choice([0, 1], n_phish, p=[0.3, 0.7]),
            "dash_in_domain":        rng.choice([0, 1], n_phish, p=[0.2, 0.8]),
            "url_depth":             rng.integers(4, 12, n_phish),
            "redirect_count":        rng.integers(2, 8, n_phish),
            "label":                 np.ones(n_phish, dtype=int),
        }

    def legit_samples():
        return {
            "url_length":            rng.integers(15, 80, n_legit),
            "has_https":             rng.choice([0, 1], n_legit, p=[0.1, 0.9]),
            "dot_count":             rng.integers(1, 4, n_legit),
            "suspicious_keywords":   rng.integers(0, 2, n_legit),
            "has_ip_address":        rng.choice([0, 1], n_legit, p=[0.97, 0.03]),
            "subdomain_count":       rng.integers(0, 2, n_legit),
            "special_char_count":    rng.integers(0, 4, n_legit),
            "has_form":              rng.choice([0, 1], n_legit, p=[0.4, 0.6]),
            "external_script_count": rng.integers(0, 10, n_legit),
            "iframe_count":          rng.integers(0, 2, n_legit),
            "at_symbol":             rng.choice([0, 1], n_legit, p=[0.95, 0.05]),
            "double_slash_redirect": rng.choice([0, 1], n_legit, p=[0.85, 0.15]),
            "dash_in_domain":        rng.choice([0, 1], n_legit, p=[0.7, 0.3]),
            "url_depth":             rng.integers(1, 5, n_legit),
            "redirect_count":        rng.integers(0, 2, n_legit),
            "label":                 np.zeros(n_legit, dtype=int),
        }

    df = pd.concat([
        pd.DataFrame(phishing_samples()),
        pd.DataFrame(legit_samples()),
    ], ignore_index=True).sample(frac=1, random_state=seed).reset_index(drop=True)

    return df

# ─── Train ────────────────────────────────────────────────────────────────────
def train():
    print("🔄 Generating synthetic dataset (12,000 samples)...")
    df = generate_dataset(12000)

    X = df[FEATURE_NAMES]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print("🤖 Training Random Forest Classifier...")
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=42,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)

    metrics = {
        "accuracy":  round(accuracy_score(y_test, y_pred) * 100, 2),
        "precision": round(precision_score(y_test, y_pred) * 100, 2),
        "recall":    round(recall_score(y_test, y_pred) * 100, 2),
        "f1_score":  round(f1_score(y_test, y_pred) * 100, 2),
        "training_samples": len(X_train),
        "test_samples":     len(X_test),
        "feature_names":    FEATURE_NAMES,
        "feature_importance": dict(zip(FEATURE_NAMES,
            [round(float(i), 4) for i in clf.feature_importances_])),
    }

    print("\n✅ Model Training Complete!")
    print(f"   Accuracy  : {metrics['accuracy']}%")
    print(f"   Precision : {metrics['precision']}%")
    print(f"   Recall    : {metrics['recall']}%")
    print(f"   F1 Score  : {metrics['f1_score']}%")
    print("\n" + classification_report(y_test, y_pred, target_names=["Legitimate", "Phishing"]))

    joblib.dump(clf,     MODEL_PATH)
    joblib.dump(metrics, META_PATH)
    print(f"💾 Model saved → {MODEL_PATH}")
    print(f"💾 Metrics saved → {META_PATH}")
    return clf, metrics

if __name__ == "__main__":
    train()
