
const mongoose = require("mongoose");

const retailerOfferSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
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

    price: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    availability: {
      type: String,
      enum: ["In Stock", "Out of Stock"],
      default: "In Stock"
    },

    productUrl: {
      type: String,
      default: "",
      trim: true
    },

    image: {
      type: String,
      default: "",
      trim: true
    },

    lastChecked: {
      type: Date,
      default: Date.now
    },

    externalId: {
      type: String,
      default: null,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate eBay listings
retailerOfferSchema.index(
  {
    retailer: 1,
    externalId: 1
  },
  {
    unique: true,
    partialFilterExpression: {
      retailer: "eBay",
      externalId: { $type: "string" }
    }
  }
);

module.exports = mongoose.model(
  "RetailerOffer",
  retailerOfferSchema
);
