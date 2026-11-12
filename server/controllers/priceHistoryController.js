
const mongoose = require("mongoose");

const RetailerOffer = require("../models/RetailerOffer");
const PriceHistory = require("../models/PriceHistory");

// Allowed retailer names
const allowedRetailers = [
  "Amazon",
  "Flipkart",
  "Croma",
  "eBay",
  "Manual"
];

// Save current retailer prices as historical records

const recordPriceSnapshot = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const offers = await RetailerOffer.find({
      product: productId
    
    });

    if (offers.length === 0) {
      return res.status(404).json({
        message: "No retailer offers found"
      });
    }

    const availableOffers = offers.filter(
      offer => offer.availability === "In Stock"
    );

    if (availableOffers.length === 0) {
      return res.status(404).json({
        message: "No in-stock offers available"
      });
    }

    const historyRecords = availableOffers.map(offer => ({
      product: offer.product,
      retailer: offer.retailer,

      // Store individual eBay listing ID
      externalId: offer.externalId || null,

      price: Number(offer.price),
      currency: offer.currency || "INR",
      recordedAt: new Date()
    }));

    const savedRecords = await PriceHistory.insertMany(
      historyRecords
    );

    return res.status(201).json({
      message: "Price snapshots recorded successfully",
      count: savedRecords.length,
      records: savedRecords
    });

  } catch (error) {
    console.error("Record Price Snapshot Error:", error);

    return res.status(500).json({
      message: "Failed to record price snapshot",
      error: error.message
    });
  }
};



// Retrieve price history for a product


const getPriceHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { retailer, externalId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    const query = {
      product: productId
    };

    if (retailer && retailer !== "All") {
      const matchedRetailer = allowedRetailers.find(
        name =>
          name.toLowerCase() === retailer.trim().toLowerCase()
      );

      if (!matchedRetailer) {
        return res.status(400).json({
          message: "Invalid retailer",
          allowedRetailers
        });
      }

      query.retailer = matchedRetailer;
    }

    // Filter individual retailer listing
    if (externalId) {
      query.externalId = externalId;
    }

    const history = await PriceHistory.find(query)
      .sort({ recordedAt: 1 });

    return res.status(200).json({
      productId,
      retailer: retailer || "All",
      externalId: externalId || null,
      count: history.length,
      history
    });

  } catch (error) {
    console.error("Get Price History Error:", error);

    return res.status(500).json({
      message: "Failed to retrieve price history",
      error: error.message
    });
  }
};



module.exports = {
  recordPriceSnapshot,
  getPriceHistory
};
