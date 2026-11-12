
const RetailerOffer = require("../models/RetailerOffer");
const Product = require("../models/Product");
const checkPriceAlerts = require("../services/priceAlertService");

// Generate mock retailer offers for a product
const generateMockOffers = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check whether the product exists
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    // Remove existing mock offers for this product
    await RetailerOffer.deleteMany({
      product: productId
    });

    // Generate three mock retailer offers
    const offers = [
      {
        product: productId,
        retailer: "Amazon",
        price: 899,
        availability: "In Stock",
        productUrl: `https://example.com/amazon/${productId}`
      },
      {
        product: productId,
        retailer: "Flipkart",
        price: 849,
        availability: "In Stock",
        productUrl: `https://example.com/flipkart/${productId}`
      },
      {
        product: productId,
        retailer: "Croma",
        price: 999,
        availability: "In Stock",
        productUrl: `https://example.com/croma/${productId}`
      }
    ];

    const savedOffers = await RetailerOffer.insertMany(offers);
    for (const offer of savedOffers) {
       await checkPriceAlerts(productId, offer.price);
    }
    res.status(201).json({
      message: "Mock retailer offers generated successfully",
      offers: savedOffers
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate retailer offers",
      error: error.message
    });
  }
};

// Get all offers for a product
const getProductOffers = async (req, res) => {
  try {
    const { productId } = req.params;

    const offers = await RetailerOffer.find({
      product: productId
    }).sort({ price: 1 });

    res.status(200).json({
      count: offers.length,
      offers
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch retailer offers",
      error: error.message
    });
  }
};

module.exports = {
  generateMockOffers,
  getProductOffers
};
