# 🛡️ PhishDetect — AI Fake Login Page Detector

<div align="center">

![PhishDetect Banner](https://img.shields.io/badge/AI--Powered-Phishing%20Detection-00ffcc?style=for-the-badge&logo=shield&logoColor=0f172a)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs)
![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)

**Real-time AI-powered detection of phishing websites and fake login pages.**

[Live Scanner](#-quick-start) · [Dashboard](#-features) · [Documentation](#-api-documentation)

</div>

---

## 🔍 What is PhishDetect?

PhishDetect is a full-stack cybersecurity platform that uses **machine learning**, **URL analysis**, **HTML inspection**, and **SSL verification** to detect phishing websites and fake login pages in real time.

- 🤖 **AI/ML model** — Random Forest trained on 12,000 samples
- 🌐 **URL Intelligence** — IP, typosquatting, brand impersonation
- 🔒 **SSL Verification** — Certificate validity and expiry
- 🧪 **HTML/JS Analysis** — Hidden iframes, credential-stealing scripts
- 📊 **Threat Dashboard** — Live analytics with Recharts
- ⚡ **< 3 second** scan time

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Required for |
|------|---------|-------------|
| Node.js | 18+ | Frontend + Backend |
| Python | 3.9+ | AI Engine |
| MongoDB | 7.0 | Database (optional — has in-memory fallback) |
| npm | 9+ | Package management |

### Option A — Run All Services (Recommended)

#### 1️⃣ AI Engine (Flask + ML)

```bash
cd ai-engine
pip install -r requirements.txt
python app.py
# Starts on http://localhost:8000
# Auto-trains model on first run (~30 seconds)
```

#### 2️⃣ Backend (Node.js + Express)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if you have API keys (optional)
npm run dev
# Starts on http://localhost:5000
```

#### 3️⃣ Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
# Open http://localhost:3000
```

### Option B — Docker (All services at once)

```bash
docker-compose up --build
# Frontend → http://localhost:3000
# Backend  → http://localhost:5000
# AI       → http://localhost:8000
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 URL Scanner | Analyzes any URL for 15+ phishing indicators |
| 🤖 AI Prediction | Random Forest with confidence score 0–100% |
| 🛡️ Threat Score | Visual gauge from 0–100 with risk levels |
| 🔒 SSL Check | Real-time certificate validation |
| 🕵️ HTML Inspector | Detects password fields, hidden iframes, eval() |
| 📊 Dashboard | Live charts: pie, line, bar with Recharts |
| 💡 Explainable AI | Feature importance with human-readable reasons |
| 📄 PDF Report | Download full scan report |
| 🌐 3D Animation | Three.js rotating shield on landing page |
| 🎬 Matrix Rain | Canvas-based Matrix background effect |

---

## 🤖 Machine Learning

### Model
- **Algorithm**: Random Forest (200 estimators)
- **Dataset**: 12,000 synthetic samples (6,000 phishing, 6,000 legitimate)
- **Split**: 80% train / 20% test
- **Target Accuracy**: > 93%
- **Fallback**: Rule-based scoring when AI engine is offline

### Features (15)

| # | Feature | Description |
|---|---------|-------------|
| 1 | `url_length` | Total URL character length |
| 2 | `has_https` | 1 if HTTPS, 0 if HTTP |
| 3 | `dot_count` | Number of dots in domain |
| 4 | `suspicious_keywords` | Count of phishing keywords (login, verify, secure…) |
| 5 | `has_ip_address` | 1 if IP used as hostname |
| 6 | `subdomain_count` | Number of subdomain levels |
| 7 | `special_char_count` | @, -, _, ~, % count |
| 8 | `has_form` | 1 if `<form>` element exists |
| 9 | `external_script_count` | External JS file count |
| 10 | `iframe_count` | Number of iframes |
| 11 | `at_symbol` | 1 if @ in URL |
| 12 | `double_slash_redirect` | // after protocol |
| 13 | `dash_in_domain` | Hyphen in domain name |
| 14 | `url_depth` | Path directory depth |
| 15 | `redirect_count` | Query-based redirect indicators |

---

## 🗂️ Project Structure

```
Cyber security/
├── frontend/                 # Next.js 14 + Tailwind + Three.js
│   ├── app/
│   │   ├── page.tsx          # Landing page (Matrix rain, 3D shield)
│   │   ├── scanner/          # URL scanner with animated stages
│   │   ├── dashboard/        # Analytics charts + scan history
│   │   └── about/            # Documentation page
│   ├── components/
│   │   ├── ui/Navbar.tsx
│   │   └── animations/       # MatrixRain, CyberShield, Typewriter
│   └── lib/api.ts            # Typed API client
│
├── backend/                  # Node.js + Express
│   ├── services/
│   │   ├── urlAnalyzer.js    # URL feature extraction
│   │   ├── htmlScanner.js    # Cheerio HTML/JS analysis
│   │   ├── sslChecker.js     # Certificate validation
│   │   └── aiClient.js       # Flask microservice client
│   ├── controllers/
│   ├── routes/
│   └── models/ScanResult.js  # Mongoose schema
│
├── ai-engine/                # Python Flask + scikit-learn
│   ├── app.py                # Flask API (/predict, /model-status)
│   ├── training/
│   │   └── train_model.py    # Dataset generation + RF training
│   ├── prediction/
│   │   └── predictor.py      # Prediction + explanations
│   └── models/               # Saved .joblib model files
│
└── docker-compose.yml        # All 4 services
```

---

## 📡 API Documentation

### POST `/api/scan-url`
```json
// Request
{ "url": "https://paypal-secure-login.tk/verify" }

// Response
{
  "scanId": "uuid",
  "url": "https://...",
  "prediction": "Phishing",
  "threatScore": 87,
  "riskLevel": "Critical",
  "confidence": 87.3,
  "reasons": ["IP address used as hostname", "@ symbol found in URL"],
  "sslInfo": { "valid": false, "daysRemaining": 0 },
  "htmlFindings": ["1 password input field detected"],
  "featureScores": { "has_ip_address": 14.2, "url_length": 10.1, "..." }
}
```

### GET `/api/scan-history?page=1&limit=20`
### GET `/api/stats`
### GET `/api/threat-report/:id`
### GET `/api/health`
### GET `/api/model-status`

---

## 🧪 Testing

```bash
# Backend API (Postman or curl)
curl -X POST http://localhost:5000/api/scan-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'

# AI Engine directly
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"features": {"url_length": 120, "has_https": 0, "has_ip_address": 1, ...}}'
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/phishdetect
AI_ENGINE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

# Optional external APIs
GOOGLE_SAFE_BROWSING_API_KEY=
VIRUSTOTAL_API_KEY=
```

---

## 📈 Future Scope

- [ ] Chrome Extension for real-time browser protection
- [ ] Dark web breach lookup integration
- [ ] Email phishing header analysis
- [ ] Mobile application (React Native)
- [ ] Real-time phishing feed integration (OpenPhish, PhishTank)
- [ ] CNN-based screenshot visual similarity detection
- [ ] AI chatbot for cybersecurity awareness

---

## ⚠️ Disclaimer

This project is built for **educational and research purposes only**. Do not use it to scan URLs without proper authorization. The phishing detection system is not 100% accurate — always exercise caution when handling suspicious URLs.

---

## 🏫 About

Built as a B.Tech final year cybersecurity project demonstrating the integration of:
- Machine learning for threat detection
- Full-stack web development
- Microservice architecture
- Real-world cybersecurity analysis techniques

**Tech Stack**: Next.js · Node.js · Python Flask · MongoDB · scikit-learn · Three.js · Docker
