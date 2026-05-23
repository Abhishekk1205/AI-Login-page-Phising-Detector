/**
 * services/urlAnalyzer.js
 * Extracts phishing-relevant features from a URL string (no HTTP requests needed).
 */

const { parse } = require("tldts");

// Known URL shortener domains
const URL_SHORTENERS = new Set([
  "bit.ly","tinyurl.com","goo.gl","ow.ly","t.co","buff.ly","adf.ly",
  "is.gd","cli.gs","pic.gd","short.ie","su.pr","twurl.nl","snipurl.com",
  "tr.im","rb.gy","cutt.ly","rebrand.ly","tiny.cc","lnkd.in",
]);

// Phishing-associated keywords
const SUSPICIOUS_KEYWORDS = [
  "login","signin","sign-in","verify","update","secure","account","banking",
  "confirm","password","credential","authenticate","validation","security",
  "alert","warning","suspended","unusual","activity","paypal","appleid",
  "microsoft","google","facebook","amazon","netflix","instagram","support",
  "helpdesk","service","official","portal","webmail","webscr",
];

// Known legitimate TLDs for brand impersonation check
const COMMON_BRANDS = [
  "paypal","google","facebook","apple","microsoft","amazon","netflix",
  "instagram","twitter","linkedin","dropbox","adobe","chase","bankofamerica",
  "wellsfargo","citibank","hsbc","barclays","netflix","spotify","ebay","steam",
];

/**
 * Analyse URL features for phishing indicators.
 * @param {string} rawUrl - The full URL string
 * @returns {object} Feature object + analysis flags
 */
function analyzeUrl(rawUrl) {
  let url;
  try {
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`);
  } catch {
    return { error: "Invalid URL" };
  }

  const parsed    = parse(url.hostname);
  const hostname  = url.hostname.toLowerCase();
  const fullUrl   = url.toString().toLowerCase();
  const pathname  = url.pathname;

  // ── URL Length ────────────────────────────────────────────────────────────
  const urlLength = fullUrl.length;

  // ── HTTPS ─────────────────────────────────────────────────────────────────
  const hasHttps = url.protocol === "https:" ? 1 : 0;

  // ── IP Address ────────────────────────────────────────────────────────────
  const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const hasIpAddress = ipPattern.test(hostname) ? 1 : 0;

  // ── Dot Count (in hostname) ───────────────────────────────────────────────
  const dotCount = (hostname.match(/\./g) || []).length;

  // ── Subdomains ────────────────────────────────────────────────────────────
  const subdomain      = parsed.subdomain || "";
  const subdomainCount = subdomain ? subdomain.split(".").length : 0;

  // ── Suspicious Keywords ───────────────────────────────────────────────────
  const suspiciousKeywords = SUSPICIOUS_KEYWORDS.filter(
    (kw) => fullUrl.includes(kw)
  ).length;

  // ── Special Characters ────────────────────────────────────────────────────
  const specialChars      = (fullUrl.match(/[@\-_~%]/g) || []).length;
  const atSymbol          = fullUrl.includes("@") ? 1 : 0;
  const dashInDomain      = hostname.includes("-") ? 1 : 0;

  // ── Double Slash Redirect ─────────────────────────────────────────────────
  // //redirect after the protocol https://
  const doubleSlashRedirect = (fullUrl.indexOf("//") > 7) ? 1 : 0;

  // ── URL Depth (path slashes) ──────────────────────────────────────────────
  const urlDepth = (pathname.match(/\//g) || []).length - 1;

  // ── URL Shortener ─────────────────────────────────────────────────────────
  const isShortener = URL_SHORTENERS.has(parsed.domain || "") ? 1 : 0;

  // ── Brand Impersonation ───────────────────────────────────────────────────
  const impersonatedBrand = COMMON_BRANDS.find(
    (brand) => fullUrl.includes(brand) && !(parsed.domain || "").startsWith(brand)
  ) || null;
  const hasBrandImpersonation = impersonatedBrand ? 1 : 0;

  // ── Typosquatting Detection (simple edit-distance heuristic) ─────────────
  const domainName   = (parsed.domainWithoutSuffix || "").toLowerCase();
  const typosquatTarget = COMMON_BRANDS.find(
    (brand) => brand !== domainName && levenshtein(domainName, brand) <= 2
  ) || null;

  // ── Suspicious TLD ────────────────────────────────────────────────────────
  const suspiciousTLDs = [".tk",".ml",".ga",".cf",".gq",".xyz",".top",".win",
                          ".loan",".online",".site",".download",".club"];
  const hasSuspiciousTld = suspiciousTLDs.some(
    (tld) => hostname.endsWith(tld)
  ) ? 1 : 0;

  // ── Redirect Count (approximate via query params) ─────────────────────────
  const redirectCount = (url.search.match(/redirect|url|next|return|goto/gi) || []).length;

  // ── Assembled warnings ────────────────────────────────────────────────────
  const warnings = [];
  if (hasIpAddress)          warnings.push("IP address used as hostname");
  if (atSymbol)              warnings.push("@ symbol found in URL");
  if (!hasHttps)             warnings.push("No HTTPS — connection is not encrypted");
  if (isShortener)           warnings.push("URL shortener detected — hides true destination");
  if (subdomainCount >= 3)   warnings.push(`${subdomainCount} subdomains (e.g. evil.login.bank.com)`);
  if (suspiciousKeywords >= 3) warnings.push(`${suspiciousKeywords} suspicious phishing keywords in URL`);
  if (urlLength > 100)       warnings.push(`Unusually long URL (${urlLength} characters)`);
  if (hasBrandImpersonation) warnings.push(`Brand impersonation: "${impersonatedBrand}" in URL`);
  if (typosquatTarget)       warnings.push(`Possible typosquatting of "${typosquatTarget}"`);
  if (hasSuspiciousTld)      warnings.push(`Suspicious TLD detected`);
  if (doubleSlashRedirect)   warnings.push("Double slash redirect in URL path");
  if (dashInDomain)          warnings.push("Hyphen in domain (common phishing trick)");

  return {
    // Features for ML model
    features: {
      url_length:            urlLength,
      has_https:             hasHttps,
      dot_count:             dotCount,
      suspicious_keywords:   suspiciousKeywords,
      has_ip_address:        hasIpAddress,
      subdomain_count:       subdomainCount,
      special_char_count:    specialChars,
      has_form:              0,          // filled by htmlScanner
      external_script_count: 0,          // filled by htmlScanner
      iframe_count:          0,          // filled by htmlScanner
      at_symbol:             atSymbol,
      double_slash_redirect: doubleSlashRedirect,
      dash_in_domain:        dashInDomain,
      url_depth:             Math.max(0, urlDepth),
      redirect_count:        redirectCount,
    },
    // Human-readable metadata
    meta: {
      hostname,
      domain:              parsed.domain,
      tld:                 parsed.publicSuffix,
      subdomain,
      hasHttps:            hasHttps === 1,
      isShortener:         isShortener === 1,
      impersonatedBrand,
      typosquatTarget,
      hasSuspiciousTld:    hasSuspiciousTld === 1,
      hasBrandImpersonation: hasBrandImpersonation === 1,
      warnings,
    },
  };
}

/** Simple Levenshtein distance (for typosquatting detection) */
function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

module.exports = { analyzeUrl };
