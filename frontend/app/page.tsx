"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Scan, BarChart3, ArrowRight, AlertTriangle,
  Lock, Globe, Code, Zap, Eye, Brain, CheckCircle
} from "lucide-react";
import Typewriter from "@/components/animations/Typewriter";
import Navbar from "@/components/ui/Navbar";

// Lazy-load Three.js shield (SSR-safe)
const CyberShield = dynamic(() => import("@/components/animations/CyberShield"), { ssr: false });
const MatrixRain  = dynamic(() => import("@/components/animations/MatrixRain"),  { ssr: false });

// ── Animation variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
  }),
};

// ── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3.4B",  label: "Phishing emails daily",  color: "text-cyber-red"    },
  { value: "97%",   label: "Detection accuracy",      color: "neon-green"        },
  { value: "< 3s",  label: "Average scan time",       color: "neon-blue"         },
  { value: "12K+",  label: "URLs analyzed",           color: "text-cyber-purple" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: Globe,         title: "Submit URL",        desc: "Paste any suspicious login page URL into the scanner." },
  { step: "02", icon: Shield,        title: "Multi-Layer Scan",  desc: "URL features, SSL cert, HTML content, and JavaScript are analyzed simultaneously." },
  { step: "03", icon: Brain,         title: "AI Prediction",     desc: "A trained Random Forest model scores the threat from 0–100 with explainable reasoning." },
  { step: "04", icon: AlertTriangle, title: "Instant Report",    desc: "Get a detailed breakdown of every risk factor and a downloadable PDF report." },
];

const FEATURES = [
  { icon: Lock,          title: "SSL Verification",      desc: "Check HTTPS and certificate validity in real time."              },
  { icon: Brain,         title: "AI/ML Detection",       desc: "Random Forest classifier trained on 12,000+ phishing samples."   },
  { icon: Globe,         title: "URL Intelligence",      desc: "IP detection, typosquatting, brand impersonation analysis."       },
  { icon: Code,          title: "HTML/JS Inspector",     desc: "Detects credential-stealing scripts, hidden iframes, eval calls." },
  { icon: Eye,           title: "Visual Analysis",       desc: "Identify fake pages mimicking Google, PayPal, Microsoft, etc."   },
  { icon: Zap,           title: "Explainable AI",        desc: "Every flag explained — no black box, full feature importance."   },
];

const PHISHING_TIPS = [
  "Always check the domain name carefully — one letter off is a red flag.",
  "Legitimate sites never ask for passwords via email links.",
  "Look for HTTPS — but remember: phishers can also use SSL certificates.",
  "Hover over links before clicking to see the real destination URL.",
  "Enable two-factor authentication on all important accounts.",
  "Use a password manager — it won't auto-fill on fake domains.",
];

// Pre-computed stable durations — Math.random() inside JSX causes animation resets on every render
const BADGE_FLOAT_DURATIONS = [3.4, 3.8, 3.1, 4.2];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Matrix background */}
      <MatrixRain />

      {/* Cyber grid overlay */}
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none" style={{ zIndex: 1 }} />

      {/* Glow orbs */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
           style={{ zIndex: 1, background: "radial-gradient(circle, rgba(0,255,204,0.06) 0%, transparent 70%)" }} />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
           style={{ zIndex: 1, background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)" }} />

      <div className="relative" style={{ zIndex: 10 }}>
        {/* ── Navbar ──────────────────────────────────────────────────────────────── */}
        <Navbar />

        {/* ── HERO SECTION ─────────────────────────────────────────────── */}
        <section className="min-h-screen flex items-center pt-16" id="hero">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center py-20">

              {/* Left: Text */}
              <div className="space-y-8">
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1,  x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-green text-cyber-green text-sm font-mono"
                >\n                  <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />\n                  AI-Powered Cybersecurity Tool\n                </motion.div>

                {/* Headline */}
                <motion.h1
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
                >\n                  Detect{" "}\n                  <span className="gradient-text">Fake</span>\n                  <br />\n                  Login Pages\n                  <br />\n                  <span className="text-4xl sm:text-5xl text-cyber-muted font-normal">\n                    Before It&apos;s Too Late\n                  </span>\n                </motion.h1>

                {/* Typewriter subtitle */}
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  className="text-lg text-cyber-muted font-mono"
                >\n                  <Typewriter\n                    className="text-cyber-green"\n                    phrases={[\n                      "Analyzing URL features...",\n                      "Checking SSL certificate...",\n                      "Scanning HTML for threats...",\n                      "Running AI prediction...",\n                      "Generating threat report...",\n                    ]}\n                  />\n                </motion.p>

                {/* Description */}
                <motion.p
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={3}
                  className="text-cyber-muted text-lg leading-relaxed max-w-lg"
                >\n                  PhishDetect uses machine learning, URL intelligence, and HTML inspection\n                  to identify phishing websites in real time — before you enter a single credential.\n                </motion.p>

                {/* CTAs */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={4}
                  className="flex flex-wrap gap-4"
                >\n                  <Link href="/scanner" className="btn-cyber btn-cyber-filled text-base px-8 py-3.5">\n                    <Scan size={18} />\n                    Start Scanning\n                  </Link>\n                  <Link href="/dashboard" className="btn-cyber text-base px-8 py-3.5">\n                    <BarChart3 size={18} />\n                    View Dashboard\n                  </Link>\n                  <Link href="#how-it-works" className="btn-cyber text-base px-8 py-3.5 border-cyber-blue text-cyber-blue">\n                    <ArrowRight size={18} />\n                    Learn More\n                  </Link>\n                </motion.div>

                {/* Mini stats */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  className="flex flex-wrap gap-6 pt-4"
                >\n                  {STATS.map(({ value, label, color }) => (\n                    <div key={label} className="text-center">\n                      <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>\n                      <div className="text-xs text-cyber-muted mt-0.5">{label}</div>\n                    </div>\n                  ))}\n                </motion.div>\n              </div>\n\n              {/* Right: 3D Shield */}\n              <motion.div\n                initial={{ opacity: 0, scale: 0.8 }}\n                animate={{ opacity: 1,  scale: 1 }}\n                transition={{ duration: 1.2, ease: "easeOut" }}\n                className="relative h-[420px] lg:h-[520px]"\n              >\n                {/* Glow behind shield */}\n                <div className="absolute inset-0 rounded-full"\n                     style={{ background: "radial-gradient(circle, rgba(0,255,204,0.12) 0%, transparent 65%)" }} />\n                <CyberShield />\n                {/* Floating threat indicators */}\n                {[\n                  { label: "SSL Valid",   color: "cyber-green",  x: "left-0",  y: "top-1/4"    },\n                  { label: "No IP URL",   color: "cyber-blue",   x: "right-0", y: "top-1/3"    },\n                  { label: "0 Iframes",   color: "cyber-green",  x: "left-4",  y: "bottom-1/3" },\n                  { label: "AI: Safe",    color: "cyber-green",  x: "right-4", y: "bottom-1/4" },\n                ].map(({ label, color, x, y }, idx) => (\n                  <motion.div\n                    key={label}\n                    animate={{ y: [0, -8, 0] }}\n                    transition={{ duration: BADGE_FLOAT_DURATIONS[idx], repeat: Infinity, ease: "easeInOut" }}\n                    className={`absolute ${x} ${y} glass px-3 py-1.5 rounded-full text-xs font-mono text-${color} border border-${color}/30`}\n                  >\n                    ✓ {label}\n                  </motion.div>\n                ))}\n              </motion.div>\n            </div>\n          </div>\n        </section>\n\n        {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}\n        <section id="how-it-works" className="py-24 px-4 sm:px-6">\n          <div className="max-w-7xl mx-auto">\n            <div className="cyber-divider mb-16" />\n            <motion.div\n              initial={{ opacity: 0, y: 20 }}\n              whileInView={{ opacity: 1, y: 0 }}\n              viewport={{ once: true }}\n              className="text-center mb-16"\n            >\n              <h2 className="text-4xl font-bold mb-4">\n                How <span className="gradient-text">PhishDetect</span> Works\n              </h2>\n              <p className="text-cyber-muted text-lg max-w-2xl mx-auto">\n                Four intelligent layers of analysis complete in under 3 seconds.\n              </p>\n            </motion.div>\n\n            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">\n              {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc }, i) => (\n                <motion.div\n                  key={step}\n                  variants={fadeUp}\n                  initial="hidden"\n                  whileInView="visible"\n                  viewport={{ once: true }}\n                  custom={i}\n                  className="glass rounded-2xl p-6 card-hover relative overflow-hidden group"\n                >\n                  {/* Step number watermark */}\n                  <div className="absolute top-3 right-4 text-6xl font-bold text-cyber-green/5 font-mono select-none">\n                    {step}\n                  </div>\n                  <div className="relative z-10\">\n                    <div className="w-12 h-12 rounded-xl bg-cyber-green/10 border border-cyber-green/20 flex items-center justify-center mb-4 group-hover:bg-cyber-green/20 transition-colors">\n                      <Icon size={22} className="text-cyber-green" />\n                    </div>\n                    <div className="text-xs font-mono text-cyber-green mb-2">STEP {step}</div>\n                    <h3 className="text-lg font-bold mb-2">{title}</h3>\n                    <p className="text-cyber-muted text-sm leading-relaxed">{desc}</p>\n                  </div>\n                  {/* Bottom accent line */}\n                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyber-green/40 to-transparent\n                                  scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />\n                </motion.div>\n              ))}\n            </div>\n          </div>\n        </section>\n\n        {/* ── FEATURES ─────────────────────────────────────────────────── */}\n        <section id="features" className="py-24 px-4 sm:px-6">\n          <div className="max-w-7xl mx-auto">\n            <div className="cyber-divider mb-16" />\n            <motion.div\n              initial={{ opacity: 0, y: 20 }}\n              whileInView={{ opacity: 1, y: 0 }}\n              viewport={{ once: true }}\n              className="text-center mb-16"\n            >\n              <h2 className="text-4xl font-bold mb-4">\n                Detection <span className="gradient-text">Capabilities</span>\n              </h2>\n              <p className="text-cyber-muted text-lg max-w-2xl mx-auto">\n                Six independent analysis engines working together to protect you.\n              </p>\n            </motion.div>\n\n            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">\n              {FEATURES.map(({ icon: Icon, title, desc }, i) => (\n                <motion.div\n                  key={title}\n                  variants={fadeUp}\n                  initial="hidden"\n                  whileInView="visible"\n                  viewport={{ once: true }}\n                  custom={i * 0.5}\n                  className="glass rounded-2xl p-6 card-hover group border border-transparent hover:border-cyber-green/20 transition-all"\n                >\n                  <div className="flex items-start gap-4">\n                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyber-surface flex items-center justify-center\n                                    group-hover:bg-cyber-green/10 transition-colors border border-cyber-border group-hover:border-cyber-green/30\">\n                      <Icon size={18} className="text-cyber-green" />\n                    </div>\n                    <div>\n                      <h3 className="font-bold text-sm mb-1">{title}</h3>\n                      <p className="text-cyber-muted text-xs leading-relaxed">{desc}</p>\n                    </div>\n                  </div>\n                </motion.div>\n              ))}\n            </div>\n          </div>\n        </section>\n\n        {/* ── PHISHING TIPS ─────────────────────────────────────────────── */}\n        <section id="tips" className="py-24 px-4 sm:px-6">\n          <div className="max-w-4xl mx-auto">\n            <div className="cyber-divider mb-16" />\n            <motion.div\n              initial={{ opacity: 0, y: 20 }}\n              whileInView={{ opacity: 1, y: 0 }}\n              viewport={{ once: true }}\n              className="text-center mb-12"\n            >\n              <h2 className="text-4xl font-bold mb-4\">\n                Phishing <span className="gradient-text">Awareness Tips</span>\n              </h2>\n              <p className="text-cyber-muted">Stay one step ahead of attackers.</p>\n            </motion.div>\n\n            <div className="space-y-4\">\n              {PHISHING_TIPS.map((tip, i) => (\n                <motion.div\n                  key={i}\n                  variants={fadeUp}\n                  initial="hidden"\n                  whileInView="visible"\n                  viewport={{ once: true }}\n                  custom={i * 0.3}\n                  className="glass rounded-xl p-5 flex items-start gap-4 card-hover"\n                >\n                  <CheckCircle size={20} className="text-cyber-green flex-shrink-0 mt-0.5" />\n                  <p className="text-cyber-text text-sm leading-relaxed">{tip}</p>\n                </motion.div>\n              ))}\n            </div>\n          </div>\n        </section>\n\n        {/* ── CTA BANNER ───────────────────────────────────────────────── */}\n        <section className="py-24 px-4 sm:px-6">\n          <div className="max-w-4xl mx-auto">\n            <motion.div\n              initial={{ opacity: 0, scale: 0.95 }}\n              whileInView={{ opacity: 1, scale: 1 }}\n              viewport={{ once: true }}\n              className="glass-green rounded-3xl p-12 text-center relative overflow-hidden"\n            >\n              <div className="absolute inset-0 cyber-grid-bg opacity-30" />\n              <div className="relative z-10\">\n                <Shield size={48} className="text-cyber-green mx-auto mb-6 animate-pulse" />\n                <h2 className="text-4xl font-bold mb-4 neon-green">\n                  Scan Any URL Right Now\n                </h2>\n                <p className="text-cyber-muted text-lg mb-8 max-w-xl mx-auto">\n                  Free, instant phishing analysis. No account required. Just paste a URL and let the AI work.\n                </p>\n                <Link href="/scanner" className="btn-cyber btn-cyber-filled text-lg px-10 py-4 inline-flex">\n                  <Scan size={20} />\n                  Launch Scanner\n                </Link>\n              </div>\n            </motion.div>\n          </div>\n        </section>\n\n        {/* ── Footer ───────────────────────────────────────────────────── */}\n        <footer className="border-t border-cyber-border py-8 px-4 sm:px-6 text-center text-cyber-muted text-sm">\n          <div className="flex items-center justify-center gap-2 mb-2\">\n            <Shield size={16} className="text-cyber-green" />\n            <span className="font-mono text-cyber-green">PhishDetect</span>\n          </div>\n          <p>AI-Powered Phishing Detection System — Built for cybersecurity education &amp; research.</p>\n          <p className="mt-2 text-sm text-cyber-muted">\n            Developed by <span className="text-cyber-green font-semibold">Muskan Kumari</span> (B.Tech CSE, Purnea Engineering College, Reg No: 23105131009).\n          </p>\n          <p className="mt-2 text-xs text-cyber-muted/60">For educational purposes only. Do not use to scan URLs without permission.</p>\n        </footer>\n      </div>\n    </main>\n  );\n}\n