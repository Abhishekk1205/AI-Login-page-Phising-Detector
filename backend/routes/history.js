/**
 * routes/history.js
 */

const express = require("express");
const { getScanHistory, getStats } = require("../controllers/historyController");

const router = express.Router();

router.get("/scan-history", getScanHistory);
router.get("/stats",        getStats);

module.exports = router;
