/**
 * services/sslChecker.js
 * Verifies SSL certificate validity for a given hostname.
 */

const sslChecker = require("ssl-checker");

/**
 * Check SSL certificate for a hostname.
 * @param {string} hostname - e.g. "google.com"
 * @returns {object} SSL status object
 */
async function checkSsl(hostname) {
  // Strip protocol/path if full URL was passed
  const clean = hostname.replace(/^https?:\/\//, "").split("/")[0].split(":")[0];

  try {
    const data = await sslChecker(clean, { method: "GET", port: 443, timeout: 5000 });

    const daysRemaining = data.daysRemaining || 0;
    const valid         = data.valid === true;

    const warnings = [];
    if (!valid)               warnings.push("SSL certificate is invalid or expired");
    if (daysRemaining < 7)    warnings.push(`SSL expires in ${daysRemaining} day(s)`);
    if (daysRemaining < 30)   warnings.push(`SSL certificate expires soon (${daysRemaining} days)`);

    return {
      valid,
      daysRemaining,
      validFrom:    data.validFrom  || null,
      validTo:      data.validTo    || null,
      issuer:       data.issuer     || "Unknown",\n      subject:      data.subject    || clean,\n      warnings,\n      error:        null,\n    };\n  } catch (err) {\n    return {\n      valid:         false,\n      daysRemaining: 0,\n      validFrom:     null,\n      validTo:       null,\n      issuer:        null,\n      subject:       null,\n      warnings:      ["Could not verify SSL certificate — site may not support HTTPS"],\n      error:         err.message,\n    };\n  }\n}\n\nmodule.exports = { checkSsl };\n"
