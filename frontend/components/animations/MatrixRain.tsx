"use client";

import { useEffect, useRef } from "react";

/**
 * MatrixRain — Canvas-based Matrix-style falling characters.
 * Uses green katakana + latin characters for cybersecurity aesthetic.
 */
export default function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const CHARS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ01アBCDEFGHIJKLMNOPQRSTUVWXYZ";
    const FONT_SIZE = 14;

    let cols: number[] = [];
    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const numCols = Math.floor(canvas.width / FONT_SIZE);
      cols = Array(numCols).fill(1);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(15,23,42,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font      = `${FONT_SIZE}px JetBrains Mono, monospace`;
      ctx.fillStyle = "rgba(0,255,204,0.18)";

      cols.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x    = i * FONT_SIZE;
        ctx.fillText(char, x, y * FONT_SIZE);

        if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
          cols[i] = 0;
        }
        cols[i]++;
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
      aria-hidden="true"
    />
  );
}
