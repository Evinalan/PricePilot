
const axios = require("axios");

// Store the access token temporarily
let ebayAccessToken = null;
let tokenExpiry = 0;

// ==========================================
// STEP 1: GENERATE EBAY OAUTH ACCESS TOKEN
// ==========================================

const getEbayAccessToken = async () => {
  try {
    // Reuse token if it is still valid
    if (ebayAccessToken && Date.now() < tokenExpiry) {
      return ebayAccessToken;
    }

    if (
      !process.env.EBAY_CLIENT_ID ||
      !process.env.EBAY_CLIENT_SECRET
    ) {
      throw new Error("Missing eBay API credentials in .env");
    }

    const credentials = Buffer.from(
      `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://api.ebay.com/identity/v1/oauth2/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope"
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const accessToken = response.data.access_token;
    const expiresIn = Number(response.data.expires_in);

    if (
      !accessToken ||
      !Number.isFinite(expiresIn) ||
      expiresIn <= 0
    ) {
      throw new Error("Invalid eBay access token response");
    }

    ebayAccessToken = accessToken;

    // Refresh token 60 seconds before expiry
    tokenExpiry =
      Date.now() + Math.max(0, expiresIn - 60) * 1000;

    return ebayAccessToken;

  } catch (error) {
    console.error(
      "eBay Token Error:",
      error.response?.data || error.message
    );

    ebayAccessToken = null;
    tokenExpiry = 0;

    throw new Error("Unable to generate eBay access token");
  }
};


// ==========================================
// STEP 2: SEARCH PRODUCTS ON EBAY
// ==========================================

const searchEbayProducts = async (searchQuery) => {
  try {
    if (!searchQuery || !String(searchQuery).trim()) {
      throw new Error("Search query is required");
    }

    const token = await getEbayAccessToken();

    const response = await axios.get(
      "https://api.ebay.com/buy/browse/v1/item_summary/search",
      {
        params: {
          q: String(searchQuery).trim(),
          limit: 10
        },

        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID":
            process.env.EBAY_MARKETPLACE_ID || "EBAY_US"
        }
      }
    );

    const products = (
      response.data.itemSummaries || []
    ).map((item) => {

      const priceValue = item.price?.value;
      const parsedPrice = Number(priceValue);

      return {
        title: item.title || "Untitled eBay Product",

        price:
          priceValue !== undefined &&
          priceValue !== null &&
          Number.isFinite(parsedPrice)
            ? parsedPrice
            : null,

        currency: item.price?.currency || "USD",

        image: item.image?.imageUrl || "",

        productUrl: item.itemWebUrl || "",

        retailer: "eBay",

        itemId: item.itemId || "",

        availability:
          item.estimatedAvailabilityStatus || "In Stock"
      };
    });

    return products;

  } catch (error) {
    console.error(
      "eBay Product Search Error:",
      error.response?.data || error.message
    );

    throw new Error("Unable to fetch products from eBay");
  }
};


// ==========================================
// STEP 3: FETCH DETAILS OF AN EBAY LISTING
// ==========================================

const getEbayItemDetails = async (itemId) => {
  try {
    if (!itemId) {
      throw new Error("eBay item ID is required");
    }

    const token = await getEbayAccessToken();

    const response = await axios.get(
      `https://api.ebay.com/buy/browse/v1/item/${encodeURIComponent(itemId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID":
            process.env.EBAY_MARKETPLACE_ID || "EBAY_US"
        }
      }
    );

    const item = response.data;

    const priceValue = item.price?.value;
    const parsedPrice = Number(priceValue);

    return {
      itemId: item.itemId || itemId,

      title: item.title || "",

      price:
        priceValue !== undefined &&
        priceValue !== null &&
        Number.isFinite(parsedPrice)
          ? parsedPrice
          : null,

      currency: item.price?.currency || "USD",

      image: item.image?.imageUrl || "",

      productUrl: item.itemWebUrl || "",

      retailer: "eBay",

      availability:
        item.estimatedAvailabilityStatus || "In Stock"
    };

  } catch (error) {
    console.error(
      "eBay Item Details Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
  getEbayAccessToken,
  searchEbayProducts,
  getEbayItemDetails
};
