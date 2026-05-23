/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg:       "#0f172a",
          surface:  "#1e293b",
          border:   "#334155",
          green:    "#00ffcc",
          blue:     "#38bdf8",
          purple:   "#a78bfa",
          red:      "#f87171",
          orange:   "#fb923c",
          yellow:   "#fbbf24",
          muted:    "#64748b",
          text:     "#e2e8f0",
        },
      },
      fontFamily: {
        sans:  ["Space Grotesk", "system-ui", "sans-serif"],
        mono:  ["JetBrains Mono", "Consolas", "monospace"],
      },
      backgroundImage: {
        "cyber-grid": `
          linear-gradient(rgba(0,255,204,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,204,0.04) 1px, transparent 1px)
        `,
        "glow-green":  "radial-gradient(ellipse at center, rgba(0,255,204,0.15) 0%, transparent 70%)",
        "glow-blue":   "radial-gradient(ellipse at center, rgba(56,189,248,0.15) 0%, transparent 70%)",
      },
      backgroundSize: {
        "grid": "40px 40px",
      },
      animation: {
        "pulse-slow":   "pulse 3s ease-in-out infinite",
        "float":        "float 6s ease-in-out infinite",
        "scan-beam":    "scanBeam 2s linear infinite",
        "matrix-fall":  "matrixFall 20s linear infinite",
        "glow-pulse":   "glowPulse 2s ease-in-out infinite alternate",
        "spin-slow":    "spin 8s linear infinite",
        "fade-in-up":   "fadeInUp 0.6s ease-out forwards",
        "slide-in":     "slideIn 0.4s ease-out forwards",
        "counter-up":   "counterUp 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":       { transform: "translateY(-20px)" },
        },
        scanBeam: {
          "0%":   { transform: "translateY(-100%)", opacity: "0" },
          "50%":  { opacity: "1" },
          "100%": { transform: "translateY(400%)", opacity: "0" },
        },
        glowPulse: {
          "0%":   { boxShadow: "0 0 5px rgba(0,255,204,0.3), 0 0 10px rgba(0,255,204,0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(0,255,204,0.6), 0 0 40px rgba(0,255,204,0.2)" },
        },
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
      },
      boxShadow: {
        "cyber":        "0 0 20px rgba(0,255,204,0.2), 0 0 40px rgba(0,255,204,0.05)",
        "cyber-blue":   "0 0 20px rgba(56,189,248,0.2), 0 0 40px rgba(56,189,248,0.05)",
        "cyber-red":    "0 0 20px rgba(248,113,113,0.3), 0 0 40px rgba(248,113,113,0.1)",
        "glass":        "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
    },
  },
  plugins: [],
};
