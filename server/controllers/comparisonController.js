
const mongoose = require("mongoose");

const RetailerOffer = require("../models/RetailerOffer");

// Compare prices for a product
const comparePrices = async (req, res) => {
  try {
    const { productId } = req.params;

    // Step 1: Validate the product ID format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        message: "Invalid product ID"
      });
    }

    // Step 2: Retrieve offers and sort by price
    const offers = await RetailerOffer.find({
      product: productId
    }).sort({ price: 1 });

    // Step 3: Handle products with no offers
    if (offers.length === 0) {
      return res.status(404).json({
        message: "No retailer offers found for this product"
      });
    }

    // Step 4: Keep only offers that are in stock
    const availableOffers = offers.filter(
      (offer) => offer.availability === "In Stock"
    );

    // Step 5: Handle products with no available offers
    if (availableOffers.length === 0) {
      return res.status(200).json({
        message: "No offers are currently in stock",
        productId,
        totalOffers: offers.length,
        offers,
        cheapestOffer: null,
        potentialSavings: 0
      });
    }

    // Step 6: Find the cheapest and most expensive
    // available offers
    const cheapestOffer = availableOffers[0];

    const mostExpensiveOffer =
      availableOffers[availableOffers.length - 1];

    // Step 7: Calculate potential savings
    const potentialSavings =
      mostExpensiveOffer.price - cheapestOffer.price;

    // Step 8: Send the comparison result
    return res.status(200).json({
      message: "Price comparison successful",
      productId,
      totalOffers: offers.length,
      availableOffers: availableOffers.length,
      cheapestOffer,
      potentialSavings,
      offers
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to compare prices",
      error: error.message
    });
  }
};

module.exports = {
  comparePrices
};
