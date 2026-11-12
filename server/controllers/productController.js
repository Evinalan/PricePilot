
const mongoose = require("mongoose");

const Product = require("../models/Product");
const RetailerOffer = require("../models/RetailerOffer");
const PriceHistory = require("../models/PriceHistory");

// ==========================================
// CREATE MANUAL PRODUCT
// ==========================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      image,
      price,
      currency,
      productUrl
    } = req.body;

    if (!name || !description || !category || !brand) {
      return res.status(400).json({
        success: false,
        message: "Missing required product information"
      });
    }

    const hasPrice =
      price !== undefined &&
      price !== null &&
      price !== "";

    if (
      hasPrice &&
      (!Number.isFinite(Number(price)) ||
        Number(price) < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product price"
      });
    }

    // Create main product
    const product = await Product.create({
      name,
      description,
      category,
      brand,
      image: image || "",
      source: "Manual"
    });

    let offer = null;

    // Create manual offer if price exists
    if (hasPrice) {

      offer = await RetailerOffer.create({
        product: product._id,
        retailer: "Manual",
        price: Number(price),
        currency: currency || "INR",
        productUrl: productUrl || "",
        availability: "In Stock",
        lastChecked: new Date()
      });

      // Record initial price history
      await PriceHistory.create({
        product: product._id,
        retailer: "Manual",
        price: Number(price),
        currency: currency || "INR",
        recordedAt: new Date()
      });

    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
      offer
    });

  } catch (error) {

    console.error("Create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });

  }
};


// ==========================================
// ADD MANUAL PRICE TO EXISTING PRODUCT
// ==========================================

const addManualOffer = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      price,
      currency,
      productUrl,
      availability
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid price"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let offer = await RetailerOffer.findOne({
      product: id,
      retailer: "Manual"
    });

    const newPrice = Number(price);

    const priceChanged =
      !offer || Number(offer.price) !== newPrice;

    if (offer) {

      offer.price = newPrice;
      offer.currency = currency || "INR";
      offer.availability = availability || "In Stock";
      offer.lastChecked = new Date();

      if (productUrl !== undefined) {
        offer.productUrl = productUrl;
      }

      await offer.save();

    } else {

      offer = await RetailerOffer.create({
        product: id,
        retailer: "Manual",
        price: newPrice,
        currency: currency || "INR",
        productUrl: productUrl || "",
        availability: availability || "In Stock",
        lastChecked: new Date()
      });

    }

    // Record history when a new offer is added
    // or its price changes.
    if (priceChanged) {

      await PriceHistory.create({
        product: id,
        retailer: "Manual",
        price: newPrice,
        currency: currency || "INR",
        recordedAt: new Date()
      });

    }

    return res.status(200).json({
      success: true,
      message: "Manual price saved successfully",
      productId: id,
      offer
    });

  } catch (error) {

    console.error("Add manual offer error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save manual offer",
      error: error.message
    });

  }
};


// ==========================================
// GET ALL PRODUCTS WITH RETAILER OFFERS
// ==========================================

const getProducts = async (req, res) => {
  try {

    const { search } = req.query;

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { brand: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    const productsWithOffers = await Promise.all(
      products.map(async (product) => {

        const offers = await RetailerOffer.find({
          product: product._id
        }).sort({ price: 1 });

        return {
          ...product.toObject(),
          offers
        };

      })
    );

    return res.status(200).json({
      success: true,
      products: productsWithOffers
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });

  }
};


// ==========================================
// GET SINGLE PRODUCT WITH OFFERS
// ==========================================

const getProductById = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const offers = await RetailerOffer.find({
      product: id
    }).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        offers
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });

  }
};


module.exports = {
  createProduct,
  addManualOffer,
  getProducts,
  getProductById
};
