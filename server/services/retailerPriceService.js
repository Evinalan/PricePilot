
const { searchEbayProducts } = require("./ebayService");

// Fetch retailer offers for a particular product
const getRetailerOffersForProduct = async (product) => {

    try {

        console.log(
            "Fetching eBay prices for:",
            product.name
        );

        // Fetch products from eBay
        const ebayProducts = await searchEbayProducts(
            product.name
        );

        // Convert eBay products into standard retailer offers
        const offers = ebayProducts.map((item) => {

            return {
                retailer: "eBay",

                externalId: item.itemId,

                title: item.title,

                // Price is already a number
                price: Number(item.price),

                // Currency is already a string
                currency: item.currency || "USD",

                // Use the actual product URL
                url: item.productUrl || "",

                // Image is already a URL string
                image: item.image || ""
            };

        });

        // Validate offers
        const validOffers = offers.filter((offer) => {

            return (
                Number.isFinite(offer.price) &&
                offer.price > 0 &&
                Boolean(offer.url) &&
                Boolean(offer.externalId)
            );

        });

        console.log(
            `Found ${validOffers.length} valid eBay offers`
        );

        return validOffers;

    } catch (error) {

        console.error(
            "Error fetching retailer prices:",
            error.response?.data || error.message
        );

        throw error;

    }

};

module.exports = {
    getRetailerOffersForProduct
};
