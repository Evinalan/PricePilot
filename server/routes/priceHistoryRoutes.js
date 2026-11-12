
const express = require("express");

const {
  recordPriceSnapshot,
  getPriceHistory
} = require("../controllers/priceHistoryController");

const router = express.Router();

// Save current retailer prices to history
router.post("/:productId/snapshot", recordPriceSnapshot);

// Retrieve price history
router.get("/:productId", getPriceHistory);

module.exports = router;
