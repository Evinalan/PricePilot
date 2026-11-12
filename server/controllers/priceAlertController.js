
const mongoose = require("mongoose");

const PriceAlert = require("../models/PriceAlert");
const RetailerOffer = require("../models/RetailerOffer");

// CREATE PRICE ALERT
exports.createPriceAlert = async (req, res) => {
  try {
    const {
      productId,
      retailer,
      externalId,
      targetPrice
    } = req.body;

    // Validate input
    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !retailer ||
      !String(externalId || "").trim() ||
      targetPrice === undefined ||
      !Number.isFinite(Number(targetPrice)) ||
      Number(targetPrice) <= 0
    ) {
      return res.status(400).json({
        message: "Valid product, listing and target price are required"
      });
    }

    const listingId = String(externalId).trim();
    const numericTargetPrice = Number(targetPrice);

    // Find the exact retailer listing
    const offer = await RetailerOffer.findOne({
      product: productId,
      retailer,
      externalId: listingId
    });

    if (!offer) {
      return res.status(404).json({
        message: "Selected retailer listing not found"
      });
    }

    // Create a new alert or update the existing alert
    let alert = await PriceAlert.findOneAndUpdate(
      {
        user: req.user.userId,
        product: productId,
        retailer,
        externalId: listingId
      },
      {
        $set: {
          targetPrice: numericTargetPrice,
          status: "active",
          triggeredAt: null
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    // Check whether the target price has already been reached
    const currentPrice = Number(offer.price);

    if (
      Number.isFinite(currentPrice) &&
      currentPrice >= 0 &&
      currentPrice <= numericTargetPrice
    ) {
      alert.status = "triggered";
      alert.triggeredAt = new Date();

      await alert.save();

      console.log("PRICE ALERT TRIGGERED IMMEDIATELY:", {
        user: alert.user,
        product: alert.product,
        retailer: alert.retailer,
        externalId: alert.externalId,
        targetPrice: numericTargetPrice,
        currentPrice
      });
    }

    return res.status(201).json({
      message:
        alert.status === "triggered"
          ? "Target price already reached! Your alert has been triggered."
          : "Price alert created successfully",
      alert
    });

  } catch (error) {
    console.error("Create price alert error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// GET USER PRICE ALERTS
exports.getPriceAlerts = async (req, res) => {
  try {
    const alerts = await PriceAlert.find({
      user: req.user.userId
    }).populate("product");

    return res.status(200).json({
      alerts
    });

  } catch (error) {
    console.error("Get price alerts error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// DELETE PRICE ALERT
exports.deletePriceAlert = async (req, res) => {
  try {
    const alert = await PriceAlert.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!alert) {
      return res.status(404).json({
        message: "Price alert not found"
      });
    }

    return res.status(200).json({
      message: "Price alert deleted successfully"
    });

  } catch (error) {
    console.error("Delete price alert error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};
