const {
  searchEbayProducts
} = require("../services/ebayService");

const getEbayProducts = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();

    // Check whether search keyword is provided
    if (!search) {
      return res.status(400).json({
        success: false,
        message: "Please provide a search keyword"
      });
    }

    const products = await searchEbayProducts(search);

    return res.status(200).json({
      success: true,
      retailer: "eBay",
      count: products.length,
      products
    });

  } catch (error) {
    console.error("eBay search error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to search eBay products"
    });
  }
};

module.exports = {
  getEbayProducts
};