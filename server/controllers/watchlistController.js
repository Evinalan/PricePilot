
const mongoose = require("mongoose");

const Watchlist = require("../models/Watchlist");
const RetailerOffer = require("../models/RetailerOffer");

// ADD SELECTED LISTING TO WATCHLIST
exports.addToWatchlist = async (req, res) => {
  try {
    const { productId, retailer, externalId } = req.body;

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId) ||
      !retailer ||
      !String(externalId || "").trim()
    ) {
      return res.status(400).json({
        message: "Product and retailer listing details are required"
      });
    }

    const listingId = String(externalId).trim();

    // Verify the exact retailer listing
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

    // Check whether this listing is already saved
    const existing = await Watchlist.findOne({
      user: req.user.userId,
      product: productId,
      retailer,
      externalId: listingId
    });

    if (existing) {
      return res.status(409).json({
        message: "This listing is already in your watchlist"
      });
    }

    const item = await Watchlist.create({
      user: req.user.userId,
      product: productId,
      retailer,
      externalId: listingId
    });

    return res.status(201).json({
      message: "Listing added to watchlist successfully",
      item
    });

  } catch (error) {
    console.error("Add to watchlist error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This listing is already in your watchlist"
      });
    }

    return res.status(500).json({
      message: error.message
    });
  }
};


// GET USER WATCHLIST
exports.getWatchlist = async (req, res) => {
  try {
    const items = await Watchlist.find({
      user: req.user.userId
    }).populate("product");

    const watchlist = await Promise.all(
      items.map(async (item) => {
        const offer = await RetailerOffer.findOne({
          product: item.product?._id,
          retailer: item.retailer,
          externalId: item.externalId
        });

        return {
          ...item.toObject(),
          offer
        };
      })
    );

    return res.status(200).json({
      watchlist
    });

  } catch (error) {
    console.error("Get watchlist error:", error);

    return res.status(500).json({
      message: error.message
    });
  }
};


// REMOVE LISTING FROM WATCHLIST
exports.removeFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!item) {
      return res.status(404).json({
        message: "Watchlist item not found"
      });
    }

    return res.status(200).json({
      message: "Listing removed from watchlist"
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};
