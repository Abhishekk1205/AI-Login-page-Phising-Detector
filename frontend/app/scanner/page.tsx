"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scan, Shield, AlertTriangle, CheckCircle, XCircle,
  Lock, Globe, Code, Download, ChevronDown, ChevronUp,
  ArrowLeft, Info, ExternalLink
} from "lucide-react";
import { scanUrl, type ScanResult } from "@/lib/api";

const Navbar = dynamic(() => import("@/components/ui/Navbar"), { ssr: false });
const MatrixRain = dynamic(() => import("@/components/animations/MatrixRain"), { ssr: false });

// ── Scan stages shown during analysis ───────────────────────────────────────
const STAGES = [
  { id: "url",  label: "Analyzing URL features",       icon: Globe,  duration: 800  },
  { id: "ssl",  label: "Verifying SSL certificate",    icon: Lock,   duration: 1200 },
  { id: "html", label: "Inspecting HTML & JavaScript", icon: Code,   duration: 1600 },
  { id: "ai",   label: "Running AI prediction model",  icon: Shield, duration: 2200 },
];

type Stage = "idle" | "scanning" | "done" | "error";

function getRiskColor(riskLevel: string) {
  switch (riskLevel) {
    case "Critical": return { text: "text-cyber-red",    border: "border-red-500/30",   bg: "bg-red-500/10",   gauge: "#f87171" };
    case "High":     return { text: "text-cyber-orange", border: "border-orange-500/30",bg: "bg-orange-500/10",gauge: "#fb923c" };
    case "Medium":   return { text: "text-cyber-yellow", border: "border-yellow-500/30",bg: "bg-yellow-500/10",gauge: "#fbbf24" };
    case "Low":      return { text: "text-cyber-green",  border: "border-green-500/30", bg: "bg-green-500/10", gauge: "#4ade80" };
    case "Safe":     return { text: "text-cyber-green",  border: "border-cyber-green/30",bg: "bg-cyber-green/10",gauge: "#00ffcc" };
    default:         return { text: "text-cyber-muted",  border: "border-cyber-border", bg: "bg-cyber-surface",gauge: "#64748b" };
  }
}

// ── Threat Score Gauge (SVG) ─────────────────────────────────────────────────
function ThreatGauge({ score, riskLevel }: { score: number; riskLevel: string }) {
  const { gauge } = getRiskColor(riskLevel);
  const radius     = 70;
  const circ       = 2 * Math.PI * radius;
  const half       = circ / 2;                      // only top half shown
  const dashOffset = half - (score / 100) * half;

  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Track */}
        <path
          d={`M 20 100 A 80 80 0 0 1 180 100`}
          fill="none"
          stroke="rgba(51,65,85,0.8)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={`M 20 100 A 80 80 0 0 1 180 100`}
          fill="none"
          stroke={gauge}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${((score / 100) * 251.2).toFixed(1)} 251.2`}
          style={{ filter: `drop-shadow(0 0 6px ${gauge})`, transition: "stroke-dasharray 1.5s cubic-bezier(0.4,0,0.2,1)" }}
        />
        {/* Score text */}
        <text x="100" y="90" textAnchor="middle" className="font-mono" style={{ fill: gauge, fontSize: 36, fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>
          {score}
        </text>
        <text x="100" y="110" textAnchor="middle" style={{ fill: "#64748b", fontSize: 11, fontFamily: "Space Grotesk, sans-serif" }}>
          THREAT SCORE
        </text>
      </svg>
    </div>
  );
}

// ── Feature Bar ──────────────────────────────────────────────────────────────
function FeatureBar({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const col  = pct > 70 ? "#f87171" : pct > 40 ? "#fbbf24" : "#00ffcc";
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-cyber-muted font-mono">{label}</span>
        <span style={{ color: col }} className="font-mono font-bold">{value.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 bg-cyber-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: col, boxShadow: `0 0 6px ${col}60` }}
        />
      </div>
    </div>
  );
}

export default function ScannerPage() {
  const [url,          setUrl]          = useState("");
  const [stage,        setStage]        = useState<Stage>("idle");
  const [activeStep,   setActiveStep]   = useState(-1);
  const [result,       setResult]       = useState<ScanResult | null>(null);
  const [error,        setError]        = useState("");
  const [expandHtml,   setExpandHtml]   = useState(false);
  const [expandFeatures, setExpandFeatures] = useState(false);

  const handleScan = useCallback(async () => {
    if (!url.trim()) return;
    setStage("scanning");
    setResult(null);
    setError("");

    // Animate through stages
    for (let i = 0; i < STAGES.length; i++) {
      setActiveStep(i);
      await new Promise((r) => setTimeout(r, STAGES[i].duration));
    }

    try {
      const data = await scanUrl(url.trim());
      setResult(data);
      setStage("done");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Scan failed";
      setError(msg.includes("429") ? "Rate limit reached — please wait a moment." : msg);
      setStage("error");
    }
    setActiveStep(-1);
  }, [url]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleScan();
  };

  const colors = result ? getRiskColor(result.riskLevel) : null;

  return (
    <main className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-green text-cyber-green text-sm font-mono mb-6">
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
              Live URL Scanner
            </div>
            <h1 className="text-5xl font-bold mb-4">
              Scan Any <span className="gradient-text">Login Page</span>
            </h1>
            <p className="text-cyber-muted text-lg max-w-xl mx-auto">
              Paste a suspicious URL and get an instant AI-powered threat analysis.
            </p>
          </motion.div>

          {/* Input Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-6 mb-8 relative overflow-hidden"
          >
            {stage === "scanning" && (
              <div className="scan-beam" />
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Globe size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-muted" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://suspicious-login-page.com/verify"
                  disabled={stage === "scanning"}
                  className="w-full bg-cyber-surface border border-cyber-border rounded-xl pl-11 pr-4 py-3.5
                             text-cyber-text font-mono text-sm placeholder:text-cyber-muted/50
                             focus:outline-none focus:border-cyber-green/50 focus:ring-1 focus:ring-cyber-green/20
                             disabled:opacity-50 transition-all"
                  aria-label="URL to scan"
                />
              </div>
              <button
                onClick={handleScan}
                disabled={stage === "scanning" || !url.trim()}
                id="scan-button"
                className="btn-cyber btn-cyber-filled px-8 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {stage === "scanning" ? (
                  <>
                    <div className="cyber-spinner w-4 h-4" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan size={16} />
                    Analyze URL
                  </>
                )}
              </button>
            </div>

            {/* Quick test URLs */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-cyber-muted font-mono">Try:</span>
              {["https://google.com", "https://paypal-secure-login.tk/verify"].map((u) => (
                <button
                  key={u}
                  onClick={() => setUrl(u)}
                  className="text-xs text-cyber-blue hover:text-cyber-green font-mono underline underline-offset-2 transition-colors"
                >
                  {u.length > 40 ? u.slice(0, 40) + "…" : u}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Scanning Progress */}
          <AnimatePresence>
            {stage === "scanning" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass rounded-2xl p-6 mb-8"
              >
                <h2 className="font-mono text-cyber-green text-sm mb-6 flex items-center gap-2">
                  <div className="cyber-spinner w-4 h-4" />
                  Analysis in progress...
                </h2>
                <div className="space-y-4">
                  {STAGES.map(({ id, label, icon: Icon }, i) => {
                    const state = i < activeStep ? "done" : i === activeStep ? "active" : "pending";
                    return (
                      <div key={id} className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${state === "done"   ? "bg-cyber-green/20 border border-cyber-green/40" :
                            state === "active" ? "bg-cyber-blue/20 border border-cyber-blue/40 animate-pulse" :
                                                 "bg-cyber-surface border border-cyber-border"}`}
                        >
                          {state === "done" ? (
                            <CheckCircle size={16} className="text-cyber-green" />
                          ) : (
                            <Icon size={16} className={state === "active" ? "text-cyber-blue" : "text-cyber-muted"} />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-mono ${
                            state === "done" ? "text-cyber-green" :
                            state === "active" ? "text-cyber-blue" : "text-cyber-muted"
                          }`}>
                            {label}
                            {state === "active" && <span className="ml-1 typewriter-cursor" />}
                            {state === "done"   && <span className="ml-1 text-cyber-green"> ✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {stage === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 mb-8 border border-red-500/30 bg-red-500/5 flex items-start gap-3"
              >
                <XCircle size={20} className="text-cyber-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-cyber-red mb-1">Scan Failed</p>
                  <p className="text-cyber-muted text-sm">{error}</p>
                  <Link href="http://localhost:5000/api/health" target="_blank" className="text-xs text-cyber-blue mt-2 inline-flex items-center gap-1 hover:underline">
                    Check backend status <ExternalLink size={12} />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {stage === "done" && result && colors && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main result card */}
                <div className={`glass rounded-2xl p-8 border ${colors.border} ${colors.bg} relative overflow-hidden`}>
                  <div className="absolute inset-0 cyber-grid-bg opacity-20" />
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      {/* Gauge */}
                      <div className="flex-shrink-0">
                        <ThreatGauge score={result.threatScore} riskLevel={result.riskLevel} />
                        <div className={`text-center mt-2 text-xs font-mono px-4 py-1.5 rounded-full border ${colors.border} ${colors.text}`}>
                          {result.riskLevel.toUpperCase()} RISK
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                          {result.prediction === "Phishing" ? (
                            <AlertTriangle size={32} className="text-cyber-red" />
                          ) : (
                            <CheckCircle size={32} className="text-cyber-green" />
                          )}
                          <h2 className={`text-4xl font-bold ${colors.text}`}>
                            {result.prediction === "Phishing" ? "PHISHING DETECTED" : "LIKELY SAFE"}
                          </h2>
                        </div>

                        <p className="text-cyber-muted text-sm font-mono mb-4 break-all">{result.url}</p>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {[
                            { label: "Confidence",    value: `${result.confidence.toFixed(1)}%` },
                            { label: "Scan Time",     value: `${(result.scanDuration / 1000).toFixed(1)}s` },
                            { label: "SSL",           value: result.sslInfo?.valid ? "Valid ✓" : "Invalid ✗" },
                          ].map(({ label, value }) => (
                            <div key={label} className="glass rounded-lg p-3 text-center">
                              <div className="text-xs text-cyber-muted font-mono mb-1">{label}</div>
                              <div className="font-bold text-sm font-mono">{value}</div>
                            </div>
                          ))}
                        </div>

                        {result.aiEngineFallback && (
                          <div className="flex items-center gap-2 text-xs text-cyber-yellow glass rounded-lg px-3 py-2 mb-4">
                            <Info size={14} />
                            AI engine offline — rule-based fallback used
                          </div>
                        )}

                        <button
                          onClick={() => window.print()}
                          className="btn-cyber text-sm px-6 py-2.5"
                        >
                          <Download size={15} />
                          Download Report
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reasons / Findings */}
                {result.reasons.length > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-cyber-orange" />
                      Detection Reasons
                      <span className="ml-auto text-xs text-cyber-muted font-mono">{result.reasons.length} flags</span>
                    </h3>
                    <div className="space-y-2">
                      {result.reasons.map((r, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-start gap-3 py-2 px-3 rounded-lg bg-cyber-surface/50"
                        >
                          <span className="text-cyber-orange text-xs font-mono mt-0.5">⚠</span>
                          <span className="text-sm text-cyber-text">{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature Importance */}
                {Object.keys(result.featureScores).length > 0 && (
                  <div className="glass rounded-2xl p-6">
                    <button
                      onClick={() => setExpandFeatures(!expandFeatures)}
                      className="w-full flex items-center justify-between font-bold mb-2 hover:text-cyber-green transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Shield size={18} className="text-cyber-green" />
                        AI Feature Importance
                      </span>
                      {expandFeatures ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    <p className="text-xs text-cyber-muted mb-4">
                      How much each feature contributed to the AI model&apos;s decision:
                    </p>
                    <AnimatePresence>
                      {expandFeatures && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          {Object.entries(result.featureScores)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 12)
                            .map(([feat, score]) => (
                              <FeatureBar
                                key={feat}
                                label={feat.replace(/_/g, " ")}
                                value={score}
                              />
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* HTML Details */}
                <div className="glass rounded-2xl p-6">
                  <button
                    onClick={() => setExpandHtml(!expandHtml)}
                    className="w-full flex items-center justify-between font-bold hover:text-cyber-green transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Code size={18} className="text-cyber-blue" />
                      HTML & JavaScript Analysis
                    </span>
                    {expandHtml ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <AnimatePresence>
                    {expandHtml && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4"
                      >
                        {result.htmlDetails && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                            {[
                              { label: "Forms",            value: result.htmlDetails.formCount          },
                              { label: "Password Fields",  value: result.htmlDetails.passwordFields     },
                              { label: "External Scripts", value: result.htmlDetails.externalScriptCount},
                              { label: "iFrames",          value: result.htmlDetails.iframeCount        },
                              { label: "Hidden iFrames",   value: result.htmlDetails.hiddenIframes      },
                              { label: "Hidden Inputs",    value: result.htmlDetails.hiddenInputs       },
                            ].map(({ label, value }) => (
                              <div key={label} className="bg-cyber-surface rounded-lg p-3">
                                <div className="text-xs text-cyber-muted font-mono">{label}</div>
                                <div className="text-lg font-bold font-mono mt-1">
                                  {value != null ? String(value) : "—"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {result.htmlFindings.length > 0 && (
                          <div className="space-y-1">
                            {result.htmlFindings.map((f, i) => (
                              <div key={i} className="text-xs font-mono text-cyber-orange py-1 px-3 bg-cyber-surface rounded">
                                {f}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Back link */}
                <div className="text-center pt-4">
                  <button
                    onClick={() => { setStage("idle"); setResult(null); setUrl(""); }}
                    className="text-cyber-muted hover:text-cyber-green text-sm font-mono inline-flex items-center gap-2 transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Scan another URL
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
