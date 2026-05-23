import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:       "PhishDetect — AI Fake Login Page Detector",
  description: "AI-powered cybersecurity tool that detects phishing websites and fake login pages in real time using machine learning and URL intelligence.",
  keywords:    ["phishing detection", "cybersecurity", "AI", "URL scanner", "fake login page"],
  openGraph: {
    title:       "PhishDetect — AI Fake Login Page Detector",
    description: "Detect phishing websites before entering your credentials.",
    type:        "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-cyber-bg text-cyber-text antialiased">
        {children}
      </body>
    </html>
  );
}
