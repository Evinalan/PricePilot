
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true,
      default: ""
    },

    category: {
      type: String,
      required: true,
      default: "General"
    },

    brand: {
      type: String,
      required: true,
      default: "Unknown"
    },

    image: {
      type: String,
      default: ""
    },

    source: {
      type: String,
      enum: ["Manual", "eBay"],
      default: "Manual"
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

productSchema.index(
  { source: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      source: "eBay",
      externalId: { $type: "string" }
    }
  }
);

module.exports = mongoose.model("Product", productSchema);
