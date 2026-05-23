"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, Menu, X, Scan, BarChart3, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/scanner",   label: "Scanner",   icon: Scan      },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/about",     label: "About",     icon: Info      },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open,     setOpen]     = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-cyber-border shadow-glass"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-8 h-8">
            <Shield
              size={32}
              className="text-cyber-green transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]"
            />
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-cyber-bg">AI</span>
          </div>
          <span className="font-bold text-lg tracking-wide">
            <span className="neon-green">Phish</span>
            <span className="text-cyber-text">Detect</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-cyber-muted hover:text-cyber-green hover:bg-cyber-green/5 transition-all duration-200"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/scanner" className="btn-cyber btn-cyber-filled text-sm px-5 py-2">
            <Scan size={15} />
            Scan a URL
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-cyber-muted hover:text-cyber-green transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-cyber-border"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg text-cyber-muted hover:text-cyber-green hover:bg-cyber-green/5 transition-all"
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="pt-2">
                <Link
                  href="/scanner"
                  onClick={() => setOpen(false)}
                  className="btn-cyber btn-cyber-filled w-full justify-center"
                >
                  <Scan size={16} />
                  Scan a URL Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
