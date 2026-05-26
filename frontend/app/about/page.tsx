"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Shield, Brain, Globe, Lock, Code, Zap, BookOpen, Github, ExternalLink, User, GraduationCap } from "lucide-react";

const Navbar     = dynamic(() => import("@/components/ui/Navbar"),             { ssr: false });
const MatrixRain = dynamic(() => import("@/components/animations/MatrixRain"), { ssr: false });

const TECH_STACK = [
  { category: "Frontend",     items: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Three.js", "Recharts"] },
  { category: "Backend",      items: ["Node.js", "Express.js", "Mongoose", "Helmet.js", "express-rate-limit", "Cheerio"] },
  { category: "AI Engine",    items: ["Python 3.11", "Flask", "scikit-learn", "Random Forest", "joblib", "NumPy / Pandas"] },
  { category: "Database",     items: ["MongoDB", "In-memory fallback", "Mongoose ODM"] },
  { category: "Security",     items: ["CORS", "Rate Limiting", "Input Validation", "Helmet", "SSL Checker"] },
];

const FEATURES = [
  { icon: Globe,  title: "URL Intelligence",    desc: "IP detection, subdomain analysis, typosquatting via Levenshtein distance, brand impersonation detection, and suspicious keyword scoring." },
  { icon: Lock,   title: "SSL Verification",    desc: "Real-time certificate validity check via ssl-checker. Reports days remaining, issuer, and expiry date." },
  { icon: Code,   title: "HTML/JS Inspection",  desc: "Axios + Cheerio scrape the page and detect password fields, hidden iframes, eval obfuscation, cookie access, clipboard hijacking, and external form submissions." },
  { icon: Brain,  title: "AI Prediction",       desc: "Random Forest trained on 12,000 synthetic samples with 15 engineered features. Achieves ~95% accuracy. Falls back to rule-based scoring if offline." },
  { icon: Zap,    title: "Explainable AI",      desc: "Feature importance from the trained model is returned for each prediction, mapped to human-readable explanations for every flagged indicator." },
  { icon: Shield, title: "Threat Scoring",      desc: "0–100 threat score maps directly to the model's phishing probability. Risk levels: Safe / Low / Medium / High / Critical." },
];

const ML_FEATURES = [
  "URL Length", "Has HTTPS", "Dot Count", "Suspicious Keywords",
  "IP Address Usage", "Subdomain Count", "Special Characters",
  "Has Form", "External Script Count", "iFrame Count",
  "@ Symbol", "Double Slash Redirect", "Dash in Domain", "URL Depth", "Redirect Count",
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none" style={{ zIndex: 1 }} />
      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-green text-cyber-green text-sm font-mono mb-6">
              <BookOpen size={14} />
              Project Documentation
            </div>
            <h1 className="text-5xl font-bold mb-4">
              About <span className="gradient-text">PhishDetect</span>
            </h1>
            <p className="text-cyber-muted text-lg max-w-2xl mx-auto">
              An AI-powered cybersecurity platform that combines machine learning, URL analysis, HTML inspection,
              and SSL verification to detect phishing websites and fake login pages in real time.
            </p>
          </motion.div>

          {/* Project Developer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-2xl p-8 mb-8 border-l-4 border-cyber-green"
          >
            <h2 className="text-2xl font-bold mb-6 text-cyber-green flex items-center gap-2">
              <User size={22} /> Project Developer
            </h2>
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              {/* Profile Image Section - Commented out for future reference
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border border-cyber-green/30 p-1 bg-cyber-bg flex-shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300&h=300"
                  alt="Muskan Kumari"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cyber-bg/80 via-transparent to-transparent" />
              </div>
              */}
              <div className="flex-1 space-y-4 text-center md:text-left w-full">
                <div>
                  <h3 className="text-3xl font-bold tracking-wide text-cyber-text">Muskan Kumari</h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyber-green/10 text-cyber-green text-xs font-mono border border-cyber-green/20">
                      <GraduationCap size={12} /> B.Tech CSE Student
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyber-blue/10 text-cyber-blue text-xs font-mono border border-cyber-blue/20">
                      Purnea Engineering College
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-cyber-surface/50 border border-cyber-border rounded-xl p-4">
                    <span className="text-xs text-cyber-muted font-mono block mb-1">Registration No</span>
                    <span className="text-base font-mono font-bold text-cyber-green">23105131009</span>
                  </div>
                  <div className="bg-cyber-surface/50 border border-cyber-border rounded-xl p-4">
                    <span className="text-xs text-cyber-muted font-mono block mb-1">Department</span>
                    <span className="text-base font-mono font-bold text-cyber-blue">Computer Science & Engineering</span>
                  </div>
                </div>

                <p className="text-cyber-muted text-sm leading-relaxed max-w-2xl">
                  This project was designed and developed by Muskan Kumari as part of academic work in the Department of Computer Science & Engineering at Purnea Engineering College. It demonstrates the integration of machine learning classifiers (Random Forest) with deep web scraping (HTML/JS scanners) and real-time security verification APIs to defend against phishing threats.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Problem Statement */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-8 mb-8 border-l-4 border-cyber-red">
            <h2 className="text-2xl font-bold mb-4 text-cyber-red flex items-center gap-2">
              <Shield size={22} /> Problem Statement
            </h2>
            <p className="text-cyber-muted leading-relaxed">
              Over 3.4 billion phishing emails are sent daily. Many users unknowingly enter passwords into
              convincing fake login pages designed to steal credentials. Existing solutions are often browser-dependent,
              slow, or require technical expertise. PhishDetect provides an accessible, AI-powered detection system
              with explainable results that anyone can use.
            </p>
          </motion.div>

          {/* ML Features */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Brain size={22} className="text-cyber-purple" />
              Machine Learning Model
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-cyber-green mb-3 font-mono text-sm">Model Details</h3>
                <div className="space-y-2 text-sm">
                  {[
                    { k: "Algorithm",       v: "Random Forest (200 trees)" },
                    { k: "Dataset",         v: "12,000 synthetic samples"  },
                    { k: "Train/Test Split",v: "80% / 20%"                 },
                    { k: "Target Accuracy", v: "> 93%"                     },
                    { k: "Persistence",     v: "joblib .pkl file"          },
                    { k: "Fallback",        v: "Rule-based scoring"        },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between py-2 border-b border-cyber-border/50">
                      <span className="text-cyber-muted font-mono">{k}</span>
                      <span className="text-cyber-text font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-cyber-green mb-3 font-mono text-sm">15 Features Used</h3>
                <div className="flex flex-wrap gap-2">
                  {ML_FEATURES.map((f) => (
                    <span key={f} className="text-xs px-2 py-1 rounded glass-green text-cyber-green font-mono border border-cyber-green/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detection Capabilities */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Detection Capabilities</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {FEATURES.map(({ icon: Icon, title, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-6 card-hover"
                >
                  <Icon size={20} className="text-cyber-green mb-3" />
                  <h3 className="font-bold mb-2">{title}</h3>
                  <p className="text-cyber-muted text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Zap size={22} className="text-cyber-yellow" />
              Technology Stack
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TECH_STACK.map(({ category, items }) => (
                <div key={category}>
                  <h3 className="font-mono text-xs text-cyber-green mb-3">{category.toUpperCase()}</h3>
                  <div className="space-y-1">
                    {items.map((item) => (
                      <div key={item} className="text-sm text-cyber-muted py-1 px-3 rounded-lg bg-cyber-surface border border-cyber-border/50">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Architecture */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">System Architecture</h2>
            <div className="font-mono text-sm text-cyber-green bg-cyber-bg rounded-xl p-6 overflow-x-auto">
              <pre>{`User Browser (Next.js Frontend)
       │
       ▼ POST /api/scan-url
Node.js Express Backend (port 5000)
       │
       ├── urlAnalyzer.js   ── Extracts 15 URL features
       ├── htmlScanner.js   ── Axios + Cheerio HTML analysis
       ├── sslChecker.js    ── Certificate validation
       │
       ├── ▼ POST /predict
       │   Python Flask AI Engine (port 8000)
       │       └── Random Forest Classifier
       │           └── Returns: prediction, score, reasons
       │
       └── MongoDB          ── Persists scan results
              │
              ▼
       Response → Frontend → Display results`}</pre>
            </div>
          </motion.div>

          {/* Setup */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Github size={22} className="text-cyber-blue" />
              Quick Start
            </h2>
            <div className="space-y-4 font-mono text-sm">
              {[
                { label: "1. AI Engine",  cmd: "cd ai-engine && pip install -r requirements.txt && python app.py" },
                { label: "2. Backend",    cmd: "cd backend && npm install && cp .env.example .env && npm run dev" },
                { label: "3. Frontend",   cmd: "cd frontend && npm install && npm run dev" },
                { label: "4. Open",       cmd: "http://localhost:3000" },
              ].map(({ label, cmd }) => (
                <div key={label}>
                  <p className="text-cyber-muted text-xs mb-1">{label}</p>
                  <div className="bg-cyber-bg rounded-lg px-4 py-3 text-cyber-green border border-cyber-border">
                    $ {cmd}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
