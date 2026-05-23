/**
 * services/htmlScanner.js
 * Fetches a URL and inspects its HTML/JS for phishing indicators.
 */

const axios   = require("axios");
const cheerio = require("cheerio");

const REQUEST_TIMEOUT = 8000; // ms

/**
 * Fetch and scan a URL's HTML content.
 * @param {string} targetUrl
 * @returns {object} HTML features + findings
 */
async function scanHtml(targetUrl) {
  let html = "";
  let fetchError = null;
  let statusCode = null;

  try {
    const response = await axios.get(targetUrl, {
      timeout:            REQUEST_TIMEOUT,
      maxRedirects:       5,
      validateStatus:     () => true,           // Don't throw on 4xx/5xx
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    html       = response.data || "";
    statusCode = response.status;
  } catch (err) {
    fetchError = err.message;
    // Return partial results — URL was unreachable
    return {
      fetchable: false,
      fetchError,
      features: {
        has_form:              0,
        external_script_count: 0,
        iframe_count:          0,
      },
      findings: [`Page could not be fetched: ${err.message}`],
      details:  {},
    };
  }

  if (typeof html !== "string") html = String(html);

  const $ = cheerio.load(html);

  // ── Forms ─────────────────────────────────────────────────────────────────
  const forms       = $("form");
  const formCount   = forms.length;
  const hasForm     = formCount > 0 ? 1 : 0;

  // Detect password fields (main phishing indicator)
  const passwordFields = $("input[type='password']").length;

  // Check if form action points to external domain
  const suspiciousFormActions = [];
  forms.each((_, el) => {
    const action = $(el).attr("action") || "";
    if (action && !action.startsWith("/") && !action.startsWith("#")) {
      try {
        const actionUrl = new URL(action);
        const hostUrl   = new URL(targetUrl);
        if (actionUrl.hostname !== hostUrl.hostname) {
          suspiciousFormActions.push(action);
        }
      } catch {}
    }
  });

  // ── Scripts ───────────────────────────────────────────────────────────────
  const allScripts = $("script[src]");
  let externalScriptCount = 0;
  const externalDomains   = [];

  try {
    const hostUrl = new URL(targetUrl);
    allScripts.each((_, el) => {
      const src = $(el).attr("src") || "";
      if (src.startsWith("http")) {
        try {
          const scriptUrl = new URL(src);
          if (scriptUrl.hostname !== hostUrl.hostname) {
            externalScriptCount++;
            externalDomains.push(scriptUrl.hostname);
          }
        } catch {}
      }
    });
  } catch {}

  // ── iFrames ───────────────────────────────────────────────────────────────
  const iframeCount     = $("iframe").length;
  const hiddenIframes   = $("iframe[style*='display:none'], iframe[hidden], iframe[width='0']").length;

  // ── Inline JS Analysis (basic pattern matching) ───────────────────────────
  const inlineScripts   = [];
  $("script:not([src])").each((_, el) => {
    inlineScripts.push($(el).html() || "");
  });
  const inlineCode = inlineScripts.join("\n").toLowerCase();

  const suspiciousPatterns = {
    "document.cookie access":        /document\.cookie/.test(inlineCode),
    "Credential harvesting attempt":  /\.value|\.password|getpassword/i.test(inlineCode),
    "window.location redirect":       /window\.location/.test(inlineCode),
    "Base64 encoded content":         /atob\(|btoa\(/.test(inlineCode),
    "Eval obfuscation":               /eval\(/.test(inlineCode),
    "Keylogger-like listener":        /keypress|keydown|keyup/.test(inlineCode),
    "Clipboard hijacking":            /clipboard/i.test(inlineCode),
  };

  const detectedPatterns = Object.entries(suspiciousPatterns)
    .filter(([, v]) => v)
    .map(([k]) => k);

  // ── Meta / title indicators ───────────────────────────────────────────────
  const pageTitle      = $("title").text().trim();
  const metaDesc       = $('meta[name="description"]').attr("content") || "";
  const canonicalUrl   = $('link[rel="canonical"]').attr("href") || "";

  // ── Hidden inputs ─────────────────────────────────────────────────────────
  const hiddenInputs   = $("input[type='hidden']").length;

  // ── Build findings list ───────────────────────────────────────────────────
  const findings = [];
  if (passwordFields > 0)
    findings.push(`${passwordFields} password input field(s) detected`);
  if (suspiciousFormActions.length > 0)
    findings.push(`Form submits to external domain: ${suspiciousFormActions[0]}`);
  if (hiddenIframes > 0)
    findings.push(`${hiddenIframes} hidden iframe(s) detected`);
  if (externalScriptCount > 8)
    findings.push(`High number of external scripts: ${externalScriptCount}`);
  if (detectedPatterns.length > 0)
    findings.push(...detectedPatterns.map((p) => `⚠ Suspicious JS: ${p}`));
  if (hiddenInputs > 5)
    findings.push(`${hiddenInputs} hidden form inputs (may include tracking tokens)`);

  return {
    fetchable:  true,
    statusCode,
    pageTitle,
    features: {
      has_form:              hasForm,
      external_script_count: externalScriptCount,
      iframe_count:          iframeCount,
    },
    findings,
    details: {
      formCount,
      passwordFields,
      suspiciousFormActions,
      externalScriptCount,
      externalDomains: [...new Set(externalDomains)].slice(0, 10),
      iframeCount,
      hiddenIframes,
      hiddenInputs,
      detectedPatterns,
      pageTitle,
      metaDesc,
      canonicalUrl,
    },
  };
}

module.exports = { scanHtml };
