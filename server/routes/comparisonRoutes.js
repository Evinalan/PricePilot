
const express = require("express");

const {
  comparePrices
} = require("../controllers/comparisonController");

const router = express.Router();

// Compare prices for a product
router.get("/:productId", comparePrices);

module.exports = router;
