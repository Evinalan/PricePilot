
const Watchlist = require("../models/Watchlist");
const PriceAlert = require("../models/PriceAlert");
const Product = require("../models/Product");
const RetailerOffer = require("../models/RetailerOffer");
const PriceHistory = require("../models/PriceHistory");

const {
  getRetailerOffersForProduct
} = require("./retailerPriceService");

const {
  getEbayItemDetails
} = require("./ebayService");

const {
  checkPriceAlerts
} = require("./priceAlertService");


// Save a history record only when the price is new or changed
const savePriceHistoryIfChanged = async ({
  productId,
  retailer,
  externalId,
  price,
  currency
}) => {

  const previousRecord = await PriceHistory.findOne({
    product: productId,
    retailer,
    externalId: externalId || null
  }).sort({ recordedAt: -1 });

  const priceChanged =
    !previousRecord ||
    Number(previousRecord.price) !== Number(price) ||
    previousRecord.currency !== currency;

  if (!priceChanged) {
    return false;
  }

  await PriceHistory.create({
    product: productId,
    retailer,
    externalId: externalId || null,
    price: Number(price),
    currency,
    recordedAt: new Date()
  });

  return true;
};


// Track existing eBay listings individually
const trackEbayListings = async (product) => {

  const ebayOffers = await RetailerOffer.find({
    product: product._id,
    retailer: "eBay",
    externalId: {
      $exists: true,
      $nin: [null, ""]
    }
  });

  for (const offer of ebayOffers) {

    try {

      console.log(
        "Checking eBay listing:",
        offer.externalId
      );

      // Fetch the latest price of THIS exact eBay listing
      const latestItem = await getEbayItemDetails(
        offer.externalId
      );

      const latestPrice = Number(latestItem.price);

      if (!Number.isFinite(latestPrice) || latestPrice <=0) {
        throw new Error("Invalid price returned by eBay");
      }

      const currency = latestItem.currency || offer.currency || "USD";

      // Update the existing listing, not another eBay listing
      const availabilityStatus =
        latestItem.availability === "OUT_OF_STOCK"
          ? "Out of Stock"
          : latestItem.availability === "IN_STOCK"
            ? "In Stock"
            : offer.availability;

      offer.price = latestPrice;
      offer.currency = currency;
      offer.lastChecked = new Date();
      offer.availability = availabilityStatus;

      await offer.save();

      // Save first price immediately, then only changed prices
      const saved = await savePriceHistoryIfChanged({
        productId: product._id,
        retailer: "eBay",
        externalId: offer.externalId,
        price: latestPrice,
        currency
      });

      if (saved) {
        console.log(
          "eBay price history saved:",
          product.name,
          offer.externalId,
          latestPrice,
          currency
        );
      }

      // Check price alerts
      await checkPriceAlerts(
        product._id,
        "eBay",
        offer.externalId,
        latestPrice
      );

    } catch (error) {

      console.error(
        "eBay listing tracking failed:",
        offer.externalId,
        error.response?.data || error.message
      );

    }
  }
};


// Main background tracking function
const trackPrices = async () => {

  console.log("Starting automatic price tracking...");

  // Get products added to watchlists
  const watchlistProducts = await Watchlist.distinct("product");

  // Get products with active price alerts
  const alertProducts = await PriceAlert.distinct(
    "product",
    { status: "active" }
  );
  const ebayProducts = await RetailerOffer.distinct(
  "product",
  {
    retailer: "eBay",
    externalId: {
      $exists: true,
      $nin: [null, ""]
    }
  }
 );
  // Combine products and remove duplicates
  const productIds = [
  ...new Set([
    ...watchlistProducts,
    ...alertProducts,
    ...ebayProducts
  ]
    .filter(Boolean)
    .map(id => id.toString()))
];

  console.log("Products to track:", productIds.length);
  console.log("Products from watchlists:", watchlistProducts.length);
  console.log("Products from price alerts:", alertProducts.length);
  console.log("Products with eBay listings:", ebayProducts.length); 
  for (const productId of productIds) {

    try {

      const product = await Product.findById(productId);

      if (!product) {
        continue;
      }

      // Track existing eBay listings individually
      await trackEbayListings(product);

      // Fetch offers from your existing retailer service
      const offers = await getRetailerOffersForProduct(product);

      for (const offer of offers) {
        if (offer.retailer === "eBay") {
           continue;
        }

        // eBay is handled separately above using its exact listing ID
        

        const externalId = offer.externalId || null;

        

        // Update only the matching retailer offer
        await RetailerOffer.findOneAndUpdate(
          {
            product: product._id,
            retailer: offer.retailer,
            externalId
          },
          {
           $set: {
              price: Number(offer.price),
              currency: offer.currency || "USD",
              productUrl: offer.url || "",
              image: offer.image || "",
              title: offer.title || "",
              externalId,
              lastChecked: new Date()
          }
          },
          {
            upsert: true,
            returnDocument: "after",
            runValidators: true
          }
        );

        // Save history with the correct listing ID
        const saved = await savePriceHistoryIfChanged({
          productId: product._id,
          retailer: offer.retailer,
          externalId,
          price: offer.price,
          currency: offer.currency || "INR"
        });

        if (saved) {
          console.log(
            "Price updated:",
            product.name,
            offer.retailer,
            offer.price
          );
        }

        // Check alerts
        await checkPriceAlerts(
          product._id,
          offer.retailer,
          externalId,
          Number(offer.price)
        );
      }

    } catch (error) {

      console.error(
        `Failed to track product ${productId}:`,
        error.response?.data || error.message
      );

    }
  }

  console.log("Automatic price tracking finished!");
};


module.exports = trackPrices;
