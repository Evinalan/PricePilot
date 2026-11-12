const Product = require("../models/Product");
const RetailerOffer = require("../models/RetailerOffer");
const PriceHistory = require("../models/PriceHistory");
const { searchEbayProducts } = require("../services/ebayService");

// Words that generally do not identify a product model
const ignoredWords = new Set([
  "new", "original", "genuine", "brand", "unlocked", "sealed",
  "global", "edition", "version", "smartphone", "mobile",
  "with", "for", "the", "and", "inc", "ltd"
]);

// Model variants that must not be silently ignored
const variantWords = new Set([
  "pro", "plus", "max", "ultra", "mini", "lite",
  "fe", "se", "air", "fold", "flip"
]);

// Convert text into searchable words
const getTokens = (value) => {
  return String(value || "")
    .toLowerCase()
    .replace(/(\d+)\s*(gb|tb)\b/gi, "$1$2")
    .match(/[a-z0-9]+/g) || [];
};

// Extract storage capacities, excluding RAM values
const getStorage = (value) => {
  const text = String(value || "");
  const matches = [...text.matchAll(/\b\d+\s?(?:gb|tb)\b/gi)];

  return [
    ...new Set(
      matches
        .filter((match) => {
          const followingText = text.slice(match.index + match[0].length);
          return !/^\s*ram\b/i.test(followingText);
        })
        .map((match) => match[0].replace(/\s/g, "").toLowerCase())
    )
  ].sort();
};

// Check whether two products are likely identical
const isSameProduct = (product, ebayTitle) => {
  const ebayTokens = new Set(getTokens(ebayTitle));

  const brandTokens = getTokens(product.brand)
    .filter((word) => !ignoredWords.has(word));

  // Require brand match unless the brand is Unknown
  if (
    product.brand &&
    product.brand.toLowerCase() !== "unknown" &&
    !brandTokens.every((word) => ebayTokens.has(word))
  ) {
    return false;
  }

  const productNameTokens = getTokens(product.name);

  const modelTokens = productNameTokens.filter(
    (word) => !brandTokens.includes(word) && !ignoredWords.has(word)
  );

  // Avoid matching products using only generic words
  if (modelTokens.length < 1) {
    return false;
  }

  // All important model words must exist in eBay title
  if (!modelTokens.every((word) => ebayTokens.has(word))) {
    return false;
  }

  // Do not match different model variants
  for (const variant of variantWords) {
    if (ebayTokens.has(variant) && !productNameTokens.includes(variant)) {
      return false;
    }
  }

  // Check storage capacity
  const manualStorage = getStorage(
    `${product.name || ""} ${product.description || ""}`
  );
  const ebayStorage = getStorage(ebayTitle);

  // If capacity is specified on either side, the specs must agree
  if (manualStorage.length > 0 || ebayStorage.length > 0) {
    if (JSON.stringify(manualStorage) !== JSON.stringify(ebayStorage)) {
      return false;
    }
  }

  return true;
};

// ==========================================
// SYNC ALL MANUAL PRODUCTS WITH EBAY
// ==========================================

const syncManualProductsWithEbay = async (req, res) => {
  try {
    // 1. Fetch every manually added product
    const manualProducts = await Product.find({
      $or: [
        { source: "Manual" },
        { source: { $exists: false } },
        { source: null }
      ]
    });

    let matchedProducts = 0;
    let addedOffers = 0;
    let skippedProducts = 0;

    const results = [];

    // 2. Check every manual product
    for (const product of manualProducts) {
      try {
        const searchQuery = `${product.brand} ${product.name}`;

        // 3. Search eBay
        const ebayProducts = await searchEbayProducts(searchQuery);

        // 4. Find matching listings
        const matches = ebayProducts.filter((item) =>
          isSameProduct(product, item.title)
        );

        if (matches.length === 0) {
          skippedProducts++;
          results.push({
            product: product.name,
            status: "No matching eBay listing found"
          });
          continue;
        }

        let productOfferCount = 0;

        // 5. Save all matching eBay offers
        for (const item of matches) {
          const newPrice = Number(item.price);

          if (
            !item.itemId ||
            !item.productUrl ||
            item.price === null ||
            item.price === undefined ||
            !Number.isFinite(newPrice) ||
            newPrice < 0
          ) {
            continue;
          }

          let offer = await RetailerOffer.findOne({
            product: product._id,
            retailer: "eBay",
            externalId: String(item.itemId)
          });

          const priceChanged = !offer || Number(offer.price) !== newPrice;

          if (offer) {
            offer.price = newPrice;
            offer.currency = item.currency || "INR";
            offer.productUrl = item.productUrl;
            offer.availability = "In Stock";
            offer.lastChecked = new Date();

            await offer.save();
          } else {
            offer = await RetailerOffer.create({
              product: product._id,
              retailer: "eBay",
              externalId: String(item.itemId),
              price: newPrice,
              currency: item.currency || "INR",
              productUrl: item.productUrl,
              availability: "In Stock",
              lastChecked: new Date()
            });

            addedOffers++;
          }

          // 6. Save price history when price changes
          if (priceChanged) {
            await PriceHistory.create({
              product: product._id,
              retailer: "eBay",
              price: newPrice,
              currency: item.currency || "INR",
              externalId: externalId,
              recordedAt: new Date()
            });
          }

          productOfferCount++;
        }

        if (productOfferCount > 0) {
          matchedProducts++;
          results.push({
            product: product.name,
            status: "Matched",
            offersFound: productOfferCount
          });
        } else {
          skippedProducts++;
          results.push({
            product: product.name,
            status: "No valid eBay offers found"
          });
        }
      } catch (productError) {
        console.error(
          `eBay sync failed for ${product.name}:`,
          productError.message
        );

        results.push({
          product: product.name,
          status: "Failed",
          error: productError.message
        });
      }
    }

    // 7. Return synchronization results
    return res.status(200).json({
      success: true,
      message: "Product synchronization completed",
      totalManualProducts: manualProducts.length,
      matchedProducts,
      addedOffers,
      skippedProducts,
      results
    });
  } catch (error) {
    console.error("Sync all products error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to synchronize products",
      error: error.message
    });
  }
};

// ==========================================
// SAVE EBAY PRODUCT
// ==========================================

const saveEbayProduct = async (req, res) => {
  try {
    const { itemId, title, price, currency, productUrl, image } = req.body;

    // Validate required fields
    if (
      !itemId ||
      !title ||
      price === undefined ||
      price === null ||
      !productUrl
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required eBay product information"
      });
    }

    if (!Number.isFinite(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid eBay product price"
      });
    }

    const externalId = String(itemId);

    let product = null;
    let matchedExistingProduct = false;

    // 1. Check whether this exact eBay listing was saved before
    product = await Product.findOne({ source: "eBay", externalId });

    // 2. If not saved before, search for an existing product
    if (!product) {
      const existingProducts = await Product.find({ source: "Manual" });

      const matches = existingProducts.filter((existingProduct) =>
        isSameProduct(existingProduct, title)
      );

      // Do not guess if multiple products match
      if (matches.length > 1) {
        return res.status(409).json({
          success: false,
          message:
            "Multiple similar products found. Please review the product specifications before saving."
        });
      }

      if (matches.length === 1) {
        product = matches[0];
        matchedExistingProduct = true;
      }
    }

    // 3. Create a new product only if no match exists
    if (!product) {
      product = await Product.create({
        name: title,
        description: `Product imported from eBay: ${title}`,
        category: "eBay",
        brand: "Unknown",
        image: image || "",
        source: "eBay",
        externalId
      });
    } else if (!product.image && image) {
      product.image = image;
      await product.save();
    }

    // 4. Find an existing offer for this eBay listing
    let offer = await RetailerOffer.findOne({
      product: product._id,
      retailer: "eBay",
      externalId
    });

    const newPrice = Number(price);
    const priceChanged = !offer || Number(offer.price) !== newPrice;

    // 5. Create or update the eBay offer
    if (offer) {
      offer.price = newPrice;
      offer.image = image || offer.image || "",
      offer.currency = currency || "INR";
      offer.productUrl = productUrl;
      offer.availability = "In Stock";
      offer.lastChecked = new Date();

      await offer.save();
    } else {
      offer = await RetailerOffer.create({
        product: product._id,
        retailer: "eBay",
        externalId,
        image: image || "",
        price: newPrice,
        currency: currency || "INR",

        productUrl,
        availability: "In Stock",
        lastChecked: new Date()
      });
    }

    // 6. Record initial or changed price history
    if (priceChanged) {
      await PriceHistory.create({
        product: product._id,
        retailer: "eBay",
        price: newPrice,
        currency: currency || "INR",
        externalId: String(item.itemId),
        recordedAt: new Date()
      });
    }

    return res.status(200).json({
      success: true,
      message: matchedExistingProduct
        ? "eBay offer added to existing product"
        : "eBay product saved successfully",
      productId: product._id,
      productName: product.name,
      matchedExistingProduct,
      offer
    });
  } catch (error) {
    console.error("Save eBay product error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save eBay product",
      error: error.message
    });
  }
};

module.exports = {
  saveEbayProduct,
  syncManualProductsWithEbay
};