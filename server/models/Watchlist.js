
const mongoose = require("mongoose");

const watchlistSchema = new mongoose.Schema(
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

    retailer: {
      type: String,
      required: true
    },

    // Exact retailer listing ID
    externalId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// One user can save different listings
// of the same product.
watchlistSchema.index(
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
  "Watchlist",
  watchlistSchema
);
