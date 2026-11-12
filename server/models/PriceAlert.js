
const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    // Identifies the selected retailer
    retailer: {
      type: String,
      required: true
    },

    // Identifies the exact eBay listing
    externalId: {
      type: String,
      required: true
    },

    targetPrice: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["active", "triggered"],
      default: "active"
    },

    triggeredAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate alerts for the same listing
priceAlertSchema.index(
  {
    user: 1,
    product: 1,
    retailer: 1,
    externalId: 1
  },
  {
    unique: true
  }
);

module.exports = mongoose.model(
  "PriceAlert",
  priceAlertSchema
);
