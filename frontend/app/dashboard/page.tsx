"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  BarChart3, Shield, AlertTriangle, CheckCircle, Activity,
  TrendingUp, Clock, Cpu
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { getStats, getScanHistory, getModelStatus, type DashboardStats } from "@/lib/api";

const Navbar    = dynamic(() => import("@/components/ui/Navbar"),                  { ssr: false });
const MatrixRain = dynamic(() => import("@/components/animations/MatrixRain"),     { ssr: false });

// ── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const dur = 1200, steps = 60;
    const inc = value / steps;
    let cur = 0, step = 0;
    const timer = setInterval(() => {
      cur += inc;
      step++;
      setDisplay(Math.round(cur));
      if (step >= steps) { setDisplay(value); clearInterval(timer); }
    }, dur / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span className="font-mono stat-number">{display.toLocaleString()}{suffix}</span>;
}

// ── Custom tooltip ────────────────────────────────────────────────────────────
const CyberTooltip = ({ active, payload, label }: { active?: boolean; payload?: {value: number; name: string}[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-lg px-4 py-3 text-xs border border-cyber-border">
      <p className="text-cyber-muted mb-1 font-mono">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.name === "phishing" ? "#f87171" : "#00ffcc" }} className="font-bold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const RISK_COLORS: Record<string, string> = {
  Critical: "#f87171", High: "#fb923c", Medium: "#fbbf24", Low: "#4ade80", Safe: "#00ffcc", Unknown: "#64748b",
};
const PIE_COLORS = ["#f87171", "#00ffcc", "#64748b"];

type HistoryItem = {
  scanId:     string;
  url:        string;
  prediction: string;
  threatScore:number;
  riskLevel:  string;
  createdAt:  string;
};

export default function DashboardPage() {
  const [stats,       setStats]       = useState<DashboardStats | null>(null);
  const [history,     setHistory]     = useState<HistoryItem[]>([]);
  const [modelStatus, setModelStatus] = useState<{ online: boolean; data?: { metrics?: { accuracy?: number } } } | null>(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, h, m] = await Promise.allSettled([getStats(), getScanHistory(1, 10), getModelStatus()]);
        if (s.status === "fulfilled") setStats(s.value);
        if (h.status === "fulfilled") setHistory(h.value.results as HistoryItem[]);
        if (m.status === "fulfilled") setModelStatus({ online: true, data: m.value });
        else setModelStatus({ online: false });
      } catch {}
      setLoading(false);
    })();
  }, []);

  // Demo data when backend is offline
  const demoStats: DashboardStats = {
    total: 0, phishing: 0, safe: 0,
    dailyScans: [
      { _id: "Mon", count: 0 }, { _id: "Tue", count: 0 }, { _id: "Wed", count: 0 },
      { _id: "Thu", count: 0 }, { _id: "Fri", count: 0 }, { _id: "Sat", count: 0 }, { _id: "Sun", count: 0 },
    ],
    riskDistribution: [],
  };

  const s = stats || demoStats;
  const pieData = [
    { name: "Phishing",   value: s.phishing },
    { name: "Legitimate", value: s.safe     },
    { name: "Unknown",    value: s.total - s.phishing - s.safe },
  ].filter((d) => d.value > 0);

  const riskBarData = s.riskDistribution.map((r) => ({
    name:  r._id,
    count: r.count,
    fill:  RISK_COLORS[r._id] || "#64748b",
  }));

  const lineData = s.dailyScans.map((d) => ({
    date:   d._id,
    scans:  d.count,
  }));

  const statWidgets = [
    { label: "Total Scans",      value: s.total,    icon: Activity,   color: "text-cyber-blue",   suffix: ""  },
    { label: "Phishing Detected",value: s.phishing, icon: AlertTriangle, color: "text-cyber-red",  suffix: ""  },
    { label: "Safe Pages",       value: s.safe,     icon: CheckCircle, color: "text-cyber-green", suffix: ""  },
    { label: "Model Accuracy",   value: modelStatus?.data?.metrics?.accuracy ?? 97,
                                                     icon: Cpu,        color: "text-cyber-purple", suffix: "%" },
  ];

  return (
    <main className="relative min-h-screen">
      <MatrixRain />
      <div className="fixed inset-0 cyber-grid-bg pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 10 }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 size={28} className="text-cyber-green" />
              <h1 className="text-4xl font-bold">
                Threat <span className="gradient-text">Dashboard</span>
              </h1>
            </div>
            <p className="text-cyber-muted">Real-time analytics from the PhishDetect AI engine.</p>
          </motion.div>

          {/* Model offline banner */}
          {!loading && modelStatus && !modelStatus.online && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass rounded-xl p-4 mb-8 border border-cyber-yellow/30 bg-yellow-500/5 flex items-center gap-3 text-sm"
            >
              <AlertTriangle size={16} className="text-cyber-yellow" />
              <span className="text-cyber-yellow font-mono">Backend / AI engine offline — showing demo data.</span>
            </motion.div>
          )}

          {/* Stat Widgets */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statWidgets.map(({ label, value, icon: Icon, color, suffix }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-6 card-hover relative overflow-hidden"
              >
                <div className={`absolute top-4 right-4 ${color} opacity-10`}>
                  <Icon size={40} />
                </div>
                <Icon size={22} className={`${color} mb-3`} />
                <div className={`text-3xl font-bold ${color}`}>
                  <AnimatedNumber value={typeof value === "number" ? value : 0} suffix={suffix} />
                </div>
                <div className="text-xs text-cyber-muted font-mono mt-1">{label}</div>
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 lg:col-span-2"
            >
              <h2 className="font-bold mb-6 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyber-green" />
                Scans Over Time (7 days)
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData.length ? lineData : [{ date: "No data", scans: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                  <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 11, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
                  <Tooltip content={<CyberTooltip />} />
                  <Line type="monotone" dataKey="scans" stroke="#00ffcc" strokeWidth={2}
                        dot={{ fill: "#00ffcc", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-bold mb-6 flex items-center gap-2">
                <Shield size={18} className="text-cyber-green" />
                Classification
              </h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CyberTooltip />} />
                    <Legend
                      formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-cyber-muted text-sm font-mono">
                  No scan data yet
                </div>
              )}
            </motion.div>
          </div>

          {/* Risk Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h2 className="font-bold mb-6 flex items-center gap-2">
              <AlertTriangle size={18} className="text-cyber-orange" />
              Risk Level Distribution
            </h2>
            {riskBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={riskBarData} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.5)" />
                  <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12, fontFamily: "JetBrains Mono" }} />
                  <YAxis tick={{ fill: "#64748b", fontSize: 12, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
                  <Tooltip content={<CyberTooltip />} />
                  <Bar dataKey="count">
                    {riskBarData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-44 flex items-center justify-center text-cyber-muted text-sm font-mono">
                No risk data yet — run some scans first
              </div>
            )}
          </motion.div>

          {/* Recent Scan History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="p-6 flex items-center justify-between border-b border-cyber-border">
              <h2 className="font-bold flex items-center gap-2">
                <Clock size={18} className="text-cyber-blue" />
                Recent Scans
              </h2>
              <span className="text-xs text-cyber-muted font-mono">{history.length} results</span>
            </div>

            {history.length === 0 ? (
              <div className="py-16 text-center text-cyber-muted">
                <Shield size={32} className="mx-auto mb-4 opacity-30" />
                <p className="font-mono text-sm">No scans yet — use the scanner to analyze a URL</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-cyber-muted font-mono border-b border-cyber-border">
                      <th className="px-6 py-3">URL</th>
                      <th className="px-6 py-3">Result</th>
                      <th className="px-6 py-3">Score</th>
                      <th className="px-6 py-3">Risk</th>
                      <th className="px-6 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row, i) => {
                      const riskColor = RISK_COLORS[row.riskLevel] || "#64748b";
                      return (
                        <motion.tr
                          key={row.scanId}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-cyber-border/50 hover:bg-cyber-surface/30 transition-colors"
                        >
                          <td className="px-6 py-4 max-w-xs">
                            <span className="text-xs font-mono text-cyber-muted truncate block" title={row.url}>
                              {row.url && row.url.length > 45 ? row.url.slice(0, 45) + "…" : row.url}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs font-mono font-bold ${
                              row.prediction === "Phishing" ? "text-cyber-red" : "text-cyber-green"
                            }`}>
                              {row.prediction === "Phishing" ? "⚠ PHISHING" : "✓ SAFE"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-bold" style={{ color: riskColor }}>
                              {row.threatScore}/100
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full font-mono`}
                                  style={{ color: riskColor, background: `${riskColor}18`, border: `1px solid ${riskColor}40` }}>
                              {row.riskLevel}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-cyber-muted font-mono">
                            {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  );
}
