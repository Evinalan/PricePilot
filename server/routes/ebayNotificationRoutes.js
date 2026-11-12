
const express = require("express");

const {
  verifyEbayEndpoint,
  handleEbayDeletionNotification
} = require("../controllers/ebayNotificationController");

const router = express.Router();

// eBay uses GET for endpoint verification
router.get(
  "/marketplace-account-deletion",
  verifyEbayEndpoint
);

// eBay uses POST for deletion notifications
router.post(
  "/marketplace-account-deletion",
  handleEbayDeletionNotification
);

module.exports = router;
