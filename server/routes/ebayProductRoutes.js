
const express = require("express");

const {
  getEbayProducts
} = require("../controllers/ebayController");
const {
  saveEbayProduct
} = require("../controllers/ebayProductController");


const router = express.Router();
router.post("/save-ebay-product", saveEbayProduct);
router.get("/search", getEbayProducts);

module.exports = router;
