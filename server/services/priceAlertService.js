
const PriceAlert = require("../models/PriceAlert");

const checkPriceAlerts = async (
  productId,
  retailer,
  externalId,
  currentPrice
) => {
  try {
    const price = Number(currentPrice);

    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Invalid current price");
    }

    // Find alerts for THIS exact retailer listing
    const alerts = await PriceAlert.find({
      product: productId,
      retailer: retailer,
      externalId: String(externalId),
      status: "active",
      targetPrice: { $gte: price }
    });

    let triggeredCount = 0;

    for (const alert of alerts) {
      alert.status = "triggered";
      alert.triggeredAt = new Date();

      await alert.save();

      triggeredCount++;

      console.log(
        "PRICE ALERT TRIGGERED!",
        {
          user: alert.user,
          product: alert.product,
          retailer: alert.retailer,
          externalId: alert.externalId,
          targetPrice: alert.targetPrice,
          currentPrice: price
        }
      );
    }

    console.log(
      "Price alert checking completed. Triggered alerts:",
      triggeredCount
    );

    return triggeredCount;

  } catch (error) {
    console.error(
      "Price alert checking error:",
      error.message
    );

    throw error;
  }
};

module.exports = {
  checkPriceAlerts
};
