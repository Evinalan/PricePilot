
const express = require("express");

const {
  generateMockOffers,
  getProductOffers
} = require("../controllers/retailerController");

const router = express.Router();

// Generate mock offers for a product
router.post(
  "/:productId/mock",
  generateMockOffers
);

// Get all offers for a product
router.get(
  "/:productId",
  getProductOffers
);

module.exports = router;
