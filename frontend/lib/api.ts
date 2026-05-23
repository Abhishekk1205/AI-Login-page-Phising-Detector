/**
 * lib/api.ts
 * Typed API client for the PhishDetect backend.
 */

import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScanResult {
  scanId:           string;
  url:              string;
  prediction:       "Phishing" | "Legitimate" | "Unknown";
  threatScore:      number;
  riskLevel:        "Critical" | "High" | "Medium" | "Low" | "Safe" | "Unknown";
  confidence:       number;
  urlFeatures:      Record<string, number>;
  urlMeta:          {
    hostname:             string;
    domain:               string | null;
    tld:                  string | null;
    subdomain:            string;
    hasHttps:             boolean;
    isShortener:          boolean;
    impersonatedBrand:    string | null;
    typosquatTarget:      string | null;
    hasSuspiciousTld:     boolean;
    hasBrandImpersonation:boolean;
    warnings:             string[];
  };
  htmlDetails:      Record<string, unknown>;
  htmlFindings:     string[];
  sslInfo:          {
    valid:          boolean;
    daysRemaining:  number;
    validFrom:      string | null;
    validTo:        string | null;
    issuer:         string | null;
    warnings:       string[];
    error:          string | null;
  };
  reasons:          string[];
  featureScores:    Record<string, number>;
  aiEngineFallback: boolean;
  scanDuration:     number;
  createdAt?:       string;
}

export interface ScanHistory {
  success:    boolean;
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  results:    Partial<ScanResult>[];
}

export interface DashboardStats {
  total:            number;
  phishing:         number;
  safe:             number;
  dailyScans:       { _id: string; count: number }[];
  riskDistribution: { _id: string; count: number }[];
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Submit a URL for phishing analysis.
 */
export async function scanUrl(url: string): Promise<ScanResult> {
  const res = await api.post<ScanResult & { success: boolean }>("/scan-url", { url });
  return res.data;
};

/**
 * Fetch a specific scan report by ID.
 */
export async function getReport(scanId: string): Promise<ScanResult> {
  const res = await api.get<{ success: boolean; report: ScanResult }>(`/threat-report/${scanId}`);
  return res.data.report;
}

/**
 * Fetch paginated scan history.
 */
export async function getScanHistory(page = 1, limit = 20): Promise<ScanHistory> {
  const res = await api.get<ScanHistory>("/scan-history", { params: { page, limit } });
  return res.data;
}

/**
 * Fetch dashboard statistics.
 */
export async function getStats(): Promise<DashboardStats> {
  const res = await api.get<{ success: boolean; stats: DashboardStats }>("/stats");
  return res.data.stats;
}

/**
 * Fetch AI model status.
 */
export async function getModelStatus() {
  const res = await api.get("/model-status");
  return res.data;
}

export default api;
