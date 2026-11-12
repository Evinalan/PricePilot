
const crypto = require("crypto");

// GET: eBay endpoint verification
const verifyEbayEndpoint = (req, res) => {
  try {
    const challengeCode = req.query.challenge_code;

    const verificationToken = process.env.EBAY_VERIFICATION_TOKEN;

    const endpoint = process.env.EBAY_NOTIFICATION_ENDPOINT;

    if (!challengeCode || !verificationToken || !endpoint) {
      return res.status(400).json({
        message: "Missing challenge code or configuration"
      });
    }

    // Create SHA-256 hash
    const hash = crypto.createHash("sha256");

    hash.update(challengeCode);
    hash.update(verificationToken);
    hash.update(endpoint);

    const challengeResponse = hash.digest("hex");

    return res.status(200).json({
      challengeResponse
    });

  } catch (error) {
    console.error("eBay verification error:", error.message);

    return res.status(500).json({
      message: "Verification failed"
    });
  }
};

// POST: Receive account deletion notifications
const handleEbayDeletionNotification = (req, res) => {
  try {
    console.log("eBay account deletion notification received");

    // Inspect the notification payload during development.
    console.log(JSON.stringify(req.body, null, 2));

    // Acknowledge receipt to eBay.
    return res.sendStatus(200);

  } catch (error) {
    console.error("eBay notification error:", error.message);

    return res.sendStatus(500);
  }
};

module.exports = {
  verifyEbayEndpoint,
  handleEbayDeletionNotification
};
