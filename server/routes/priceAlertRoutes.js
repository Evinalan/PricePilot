
const express = require("express");

const router = express.Router();

const {
  createPriceAlert,
  getPriceAlerts,
  deletePriceAlert
} = require("../controllers/priceAlertController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createPriceAlert);

router.get("/", authMiddleware, getPriceAlerts);

router.delete("/:id", authMiddleware, deletePriceAlert);

module.exports = router;
