
const mongoose = require("mongoose");

const priceHistorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true
    },

    retailer: {
      type: String,
      required: true,
      enum: [
        "Amazon",
        "Flipkart",
        "Croma",
        "eBay",
        "Manual"
      ]
    },

    // Unique ID of an individual retailer listing
    // For eBay, this is the eBay itemId
    externalId: {
      type: String,
      default: null,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    recordedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Index for retrieving an individual listing's history
priceHistorySchema.index({
  product: 1,
  retailer: 1,
  externalId: 1,
  recordedAt: -1
});

module.exports = mongoose.model(
  "PriceHistory",
  priceHistorySchema
);
