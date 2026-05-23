/**
 * controllers/historyController.js
 * Returns paginated scan history and aggregate stats.
 */

const ScanResult = require("../models/ScanResult");
const { inMemoryStore } = require("./scanController");

/**
 * GET /api/scan-history?page=1&limit=20
 */
async function getScanHistory(req, res, next) {
  const page  = parseInt(req.query.page  || "1", 10);
  const limit = parseInt(req.query.limit || "20", 10);
  const skip  = (page - 1) * limit;

  try {
    let results, total;
    try {
      [results, total] = await Promise.all([
        ScanResult.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select("scanId url prediction threatScore riskLevel confidence createdAt urlMeta.hostname"),
        ScanResult.countDocuments(),
      ]);
    } catch {
      // Fallback to in-memory
      const sliced = inMemoryStore.slice(skip, skip + limit);
      results      = sliced.map((r) => ({\n        scanId:      r.scanId,\n        url:         r.url,\n        prediction:  r.prediction,\n        threatScore: r.threatScore,\n        riskLevel:   r.riskLevel,\n        confidence:  r.confidence,\n        createdAt:   r.createdAt,\n        "urlMeta.hostname": r.urlMeta?.hostname,\n      }));
      total = inMemoryStore.length;
    }

    res.json({
      success: true,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      results,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/stats
 * Returns aggregate dashboard statistics.
 */
async function getStats(req, res, next) {
  try {
    let stats;
    try {
      const [total, phishing, safe] = await Promise.all([
        ScanResult.countDocuments(),
        ScanResult.countDocuments({ prediction: "Phishing" }),
        ScanResult.countDocuments({ prediction: "Legitimate" }),
      ]);

      // Scans per day for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const dailyScans   = await ScanResult.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Risk level distribution
      const riskDist = await ScanResult.aggregate([
        { $group: { _id: "$riskLevel", count: { $sum: 1 } } },
      ]);

      stats = { total, phishing, safe, dailyScans, riskDistribution: riskDist };
    } catch {
      // In-memory fallback
      const total    = inMemoryStore.length;
      const phishing = inMemoryStore.filter((r) => r.prediction === "Phishing").length;
      const safe     = inMemoryStore.filter((r) => r.prediction === "Legitimate").length;
      stats          = { total, phishing, safe, dailyScans: [], riskDistribution: [] };
    }

    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getScanHistory, getStats };
