
const express = require("express");

const {
  createProduct,
  addManualOffer,
  getProducts,
  getProductById
} = require("../controllers/productController");

const {
  saveEbayProduct,
  syncManualProductsWithEbay
} = require("../controllers/ebayProductController");

const router = express.Router();
router.post(
  "/sync-ebay",
  syncManualProductsWithEbay
);
// Save eBay product
router.post("/save-ebay-product", saveEbayProduct);

// Create manual product
router.post("/", createProduct);

// Add manual offer to an existing product
router.post("/:id/manual-offer", addManualOffer);

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProductById);

module.exports = router;
