
import { useEffect, useState } from "react";
import api from "../api";

import {
  Search,
  RefreshCw,
  ExternalLink,
  TrendingDown,
  History,
  ShoppingBag,
  PackageSearch,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X
} from "lucide-react";

import PriceAlertForm from "../components/PriceAlertForm";
import PriceHistoryChart from "../components/PriceHistoryChart";
import WatchlistButton from "../components/WatchlistButton";

function ProductPage() {

  // ==========================================
  // STATES
  // ==========================================

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [ebayProducts, setEbayProducts] = useState([]);

  const [selectedOffer, setSelectedOffer] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const [savingEbayId, setSavingEbayId] = useState(null);
  const [savedEbayIds, setSavedEbayIds] = useState([]);

  // ==========================================
  // FORMAT PRICE
  // ==========================================

  const formatPrice = (price, currency = "INR") => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency
      }).format(Number(price));
    } catch {
      return `${price} ${currency}`;
    }
  };

  // ==========================================
  // FETCH SAVED PRODUCTS
  // ==========================================

  const fetchProducts = async (searchText = "") => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/products", {
        params: searchText.trim()
          ? { search: searchText.trim() }
          : {}
      });

      const data = response.data;

      setProducts(data.products || []);

    } catch (error) {
      console.error(
        "Fetch products error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch products"
      );

      setProducts([]);

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // SYNCHRONIZE EBAY PRODUCTS
  // ==========================================

  const syncAllProducts = async () => {
    try {
      setSyncing(true);
      setSyncResult(null);

      const response = await api.post("/products/sync-ebay");

      const data = response.data;

      setSyncResult(data);

      await fetchProducts(search);

      alert(
        data.message ||
        "Product synchronization completed!"
      );

    } catch (error) {
      console.error(
        "Sync error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Synchronization failed"
      );

    } finally {
      setSyncing(false);
    }
  };

  // ==========================================
  // FETCH EBAY SEARCH RESULTS
  // ==========================================

  const fetchEbayProducts = async (searchText) => {
    try {
      const response = await api.get(
        "/retailers/ebay/search",
        {
          params: {
            search: searchText
          }
        }
      );

      const data = response.data;

      if (data.success) {
        setEbayProducts(data.products || []);
      } else {
        setEbayProducts([]);
      }

    } catch (error) {
      console.error(
        "eBay search error:",
        error.response?.data || error.message
      );

      setEbayProducts([]);
    }
  };

  // ==========================================
  // ADD EBAY LISTING TO PRICEPILOT
  // ==========================================

  const addEbayProduct = async (item) => {
    try {
      if (!item.itemId) {
        throw new Error(
          "This eBay listing does not have a valid listing ID."
        );
      }

      setSavingEbayId(item.itemId);

      const response = await api.post(
        "/retailers/ebay/save-ebay-product",
        {
          itemId: item.itemId,
          title: item.title,
          price: item.price,
          currency: item.currency,
          productUrl: item.productUrl,
          image: item.image
        }
      );

      const data = response.data;

      // Mark listing as saved
      setSavedEbayIds((previousIds) =>
        previousIds.includes(item.itemId)
          ? previousIds
          : [...previousIds, item.itemId]
      );

      // Refresh saved products
      await fetchProducts(search);

      alert(
        data.message ||
        "Product added to PricePilot successfully!"
      );

    } catch (error) {
      console.error(
        "Add eBay product error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to add product to PricePilot"
      );

    } finally {
      setSavingEbayId(null);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = async (event) => {
    event.preventDefault();

    const searchText = search.trim();

    await fetchProducts(searchText);

    if (searchText) {
      await fetchEbayProducts(searchText);
    } else {
      setEbayProducts([]);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchProducts();
  }, []);

  // ==========================================
  // DISPLAY
  // ==========================================

  return (
    <div className="pp-page">

      {/* HERO SECTION */}

      <section className="pp-hero">

        <div className="pp-hero-content">

          <div className="pp-hero-badge">
            <Sparkles size={15} />
            SMART SHOPPING STARTS HERE
          </div>

          <h1>
            Find the best price.
            <br />
            <span>Shop smarter with PricePilot.</span>
          </h1>

          <p>
            Compare retailer prices, track price history
            and discover the best deals in one place.
          </p>

          <form
            onSubmit={handleSearch}
            className="pp-search"
          >

            <Search size={21} className="pp-search-icon" />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search for laptops, phones, headphones..."
            />

            <button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search"}
              <Search size={17} />
            </button>

          </form>

          <div className="pp-hero-features">

            <span>
              <CheckCircle size={15} />
              Compare prices
            </span>

            <span>
              <CheckCircle size={15} />
              Track price history
            </span>

            <span>
              <CheckCircle size={15} />
              Save your favourites
            </span>

          </div>

        </div>

        <div className="pp-hero-decoration">

          <div className="pp-hero-circle">
            <ShoppingBag size={95} strokeWidth={1.2} />
          </div>

          <div className="pp-floating-tag">
            <TrendingDown size={20} />
            Best prices, one place
          </div>

        </div>

      </section>

      {/* MAIN CONTENT */}

      <main className="pp-content">

        {/* SECTION HEADER */}

        <div className="pp-section-heading">

          <div>

            <span className="pp-eyebrow">
              PRICE COMPARISON
            </span>

            <h2>Explore Products</h2>

            <p>
              Compare offers from different retailers
              and find your best deal.
            </p>

          </div>

          <button
            type="button"
            className="pp-sync-button"
            onClick={syncAllProducts}
            disabled={syncing}
          >

            <RefreshCw
              size={17}
              className={syncing ? "pp-spinning" : ""}
            />

            {syncing
              ? "Synchronizing..."
              : "Sync eBay Products"}

          </button>

        </div>

        {/* NOTIFICATIONS */}

        {syncResult && (

          <div className="pp-success-message">
            <CheckCircle size={18} />
            Product synchronization completed successfully.
          </div>

        )}

        {error && (

          <div className="pp-error-message">
            <AlertCircle size={18} />
            {error}
          </div>

        )}

        {/* LOADING */}

        {loading && (

          <div className="pp-loading">
            <RefreshCw size={25} className="pp-spinning" />
            <p>Finding the best products for you...</p>
          </div>

        )}

        {/* EMPTY PRODUCT STATE */}

        {!loading && products.length === 0 && !error && (

          <div className="pp-empty-state">

            <PackageSearch size={55} />

            <h3>No products found</h3>

            <p>
              Try searching for another product or
              synchronize your eBay products.
            </p>

          </div>

        )}

        {/* PRODUCT COMPARISONS */}

        <div className="pp-product-grid">

          {products.map((product) => {

            const offers = product.offers || [];

            const availableOffers = offers.filter(
              (offer) =>
                offer.availability !== "Out of Stock" &&
                Number.isFinite(Number(offer.price))
            );

            const cheapestOffer = availableOffers.length > 0
              ? availableOffers.reduce((cheapest, offer) =>
                  Number(offer.price) < Number(cheapest.price)
                    ? offer
                    : cheapest
                )
              : null;

            const fallbackImage = offers.find(
              (offer) => offer.image
            )?.image;

            const productImage = product.image || fallbackImage;

            return (

              <article
                key={product._id}
                className="pp-product-card"
              >

                {/* PRODUCT IMAGE */}

                <div className="pp-product-image">

                  {productImage ? (

                    <img
                      src={productImage}
                      alt={product.name}
                      onError={(event) => {

                        if (
                          fallbackImage &&
                          event.currentTarget.dataset.fallbackApplied !== "true"
                        ) {

                          event.currentTarget.dataset.fallbackApplied = "true";
                          event.currentTarget.src = fallbackImage;

                        } else {

                          event.currentTarget.style.display = "none";

                        }

                      }}
                    />

                  ) : (

                    <ShoppingBag size={65} />

                  )}

                  {cheapestOffer && (

                    <span className="pp-best-deal">
                      BEST DEAL
                    </span>

                  )}

                </div>

                {/* PRODUCT INFORMATION */}

                <div className="pp-product-info">

                  <h3>{product.name}</h3>

                  {product.brand && (
                    <span className="pp-brand">
                      {product.brand}
                    </span>
                  )}

                  {product.description && (
                    <p className="pp-description">
                      {product.description}
                    </p>
                  )}

                  {/* CHEAPEST PRICE */}

                  {cheapestOffer ? (

                    <div className="pp-price-highlight">

                      <span>Lowest available price</span>

                      <strong>
                        {formatPrice(
                          cheapestOffer.price,
                          cheapestOffer.currency
                        )}
                      </strong>

                      <small>
                        At {cheapestOffer.retailer}
                      </small>

                    </div>

                  ) : (

                    <p className="pp-no-price">
                      No available prices currently.
                    </p>

                  )}

                  {/* RETAILER COMPARISON */}

                  <div className="pp-offers-section">

                    <div className="pp-offers-heading">

                      <h4>Retailer Offers</h4>

                      <span>
                        {offers.length} offers
                      </span>

                    </div>

                    {offers.length === 0 ? (

                      <p className="pp-muted">
                        No retailer offers available yet.
                      </p>

                    ) : (

                      offers.map((offer) => {

                        const isCheapest =
                          cheapestOffer &&
                          String(cheapestOffer._id) === String(offer._id);

                        const isOutOfStock =
                          offer.availability === "Out of Stock";

                        const isListingSelected =
                          selectedListing &&
                          String(selectedListing.productId) === String(product._id) &&
                          String(selectedListing._id) === String(offer._id);

                        const isSelected =
                          selectedOffer &&
                          String(selectedOffer._id) === String(offer._id) &&
                          String(selectedOffer.productId) === String(product._id);

                        return (

                          <div
                            key={offer._id}
                            className={`pp-offer-row ${
                              isCheapest && !isOutOfStock
                                ? "pp-cheapest-offer"
                                : ""
                            } ${
                              isSelected ? "pp-selected-offer" : ""
                            }`}
                          >

                            {/* OFFER IMAGE */}

                            <div className="pp-offer-image">

                              {offer.image ? (

                                <img
                                  src={offer.image}
                                  alt={offer.title || product.name}
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />

                              ) : (

                                <ShoppingBag size={23} />

                              )}

                            </div>

                            {/* OFFER DETAILS */}

                            <div className="pp-offer-details">

                              <h5>
                                {offer.title || offer.retailer}
                              </h5>

                              <span>
                                {offer.retailer}
                              </span>

                              <strong>
                                {formatPrice(
                                  offer.price,
                                  offer.currency
                                )}
                              </strong>

                              {isCheapest && !isOutOfStock && (

                                <span className="pp-cheapest-label">
                                  <CheckCircle size={13} />
                                  Cheapest
                                </span>

                              )}

                              {isOutOfStock && (

                                <span className="pp-stock-label">
                                  Out of Stock
                                </span>

                              )}

                            </div>

                            {/* OFFER ACTIONS */}

                            <div className="pp-offer-actions">

                              {offer.productUrl && (

                                <a
                                  href={offer.productUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="pp-view-link"
                                  aria-label="View retailer product"
                                >
                                  <ExternalLink size={17} />
                                </a>

                              )}

                              <button
                                type="button"
                                className="pp-history-button"
                                disabled={
                                  isOutOfStock ||
                                  !offer.externalId
                                }
                                onClick={() => {

                                  setSelectedListing({
                                    ...offer,
                                    productId: product._id
                                  });

                                }}
                              >
                                {isListingSelected
                                  ? "✓ Selected"
                                  : "Select Listing"}
                              </button>

                              <button
                                type="button"
                                className="pp-history-button"
                                onClick={() =>

                                  setSelectedOffer({
                                    ...offer,
                                    productId: product._id
                                  })

                                }
                              >

                                <History size={15} />

                                {isSelected ? "Viewing" : "History"}

                              </button>

                            </div>

                          </div>

                        );

                      })

                    )}

                  </div>

                  {/* PRICE HISTORY */}

                  {selectedOffer &&
                    String(selectedOffer.productId) === String(product._id) && (

                      <div className="pp-history-card">

                        <div className="pp-history-header">

                          <h4>
                            <History size={18} />
                            {selectedOffer.retailer} Price History
                          </h4>

                          <button
                            type="button"
                            onClick={() => setSelectedOffer(null)}
                            aria-label="Close price history"
                          >
                            <X size={18} />
                          </button>

                        </div>

                        <p>
                          Current listing price:{" "}
                          <strong>
                            {formatPrice(
                              selectedOffer.price,
                              selectedOffer.currency
                            )}
                          </strong>
                        </p>

                        <PriceHistoryChart
                          key={`${selectedOffer.productId}-${selectedOffer.retailer}-${selectedOffer.externalId || selectedOffer._id}`}
                          productId={selectedOffer.productId}
                          retailer={selectedOffer.retailer}
                          externalId={selectedOffer.externalId || null}
                        />

                      </div>

                    )}

                  {/* WATCHLIST AND ALERTS */}

                  <div className="pp-product-actions">

                    {selectedListing &&
                    String(selectedListing.productId) === String(product._id) ? (

                      <>

                        <div className="pp-selected-listing">

                          <p>
                            Selected retailer:{" "}
                            <strong>
                              {selectedListing.retailer}
                            </strong>
                          </p>

                          <p>
                            Listing ID:{" "}
                            <strong>
                              {selectedListing.externalId}
                            </strong>
                          </p>

                          <button
                            type="button"
                            onClick={() => setSelectedListing(null)}
                          >
                            Change Selection
                          </button>

                        </div>

                        <div className="pp-watchlist">

                          <WatchlistButton
                            productId={product._id}
                            retailer={selectedListing.retailer}
                            externalId={selectedListing.externalId}
                          />

                        </div>

                        <div className="pp-alert">

                          <PriceAlertForm
                            productId={product._id}
                            retailer={selectedListing.retailer}
                            externalId={selectedListing.externalId}
                            currentPrice={selectedListing.price}
                          />

                        </div>

                      </>

                    ) : (

                      <p className="pp-muted">
                        Select a retailer listing above to add it to your
                        watchlist or create a price alert.
                      </p>

                    )}

                  </div>

                </div>

              </article>

            );

          })}

        </div>

        {/* EBAY SEARCH RESULTS */}

        <section className="pp-ebay-section">

          <div className="pp-section-heading">

            <div>

              <span className="pp-eyebrow">
                MORE SHOPPING OPTIONS
              </span>

              <h2>eBay Search Results</h2>

              <p>
                Discover additional listings from eBay.
              </p>

            </div>

            <div className="pp-ebay-badge">
              <ShoppingBag size={17} />
              eBay Marketplace
            </div>

          </div>

          {ebayProducts.length === 0 ? (

            <div className="pp-ebay-empty">

              <PackageSearch size={40} />

              <h3>Discover more deals</h3>

              <p>
                Search for a product above to see
                available eBay listings here.
              </p>

            </div>

          ) : (

            <div className="pp-ebay-grid">

              {ebayProducts.map((item) => {

                const isSaving = savingEbayId === item.itemId;
                const isSaved = savedEbayIds.includes(item.itemId);

                return (

                  <article
                    key={item.itemId}
                    className="pp-ebay-card"
                  >

                    {/* EBAY PRODUCT IMAGE */}

                    <div className="pp-ebay-image">

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.title}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />

                      ) : (

                        <ShoppingBag size={45} />

                      )}

                    </div>

                    {/* EBAY PRODUCT INFORMATION */}

                    <div className="pp-ebay-info">

                      <span className="pp-ebay-retailer">
                        eBay Listing
                      </span>

                      <h3>{item.title}</h3>

                      <strong>
                        {formatPrice(
                          item.price,
                          item.currency
                        )}
                      </strong>

                      {item.productUrl && (

                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pp-ebay-link"
                        >
                          View on eBay
                          <ExternalLink size={14} />
                        </a>

                      )}

                      {/* ADD TO PRICEPILOT BUTTON */}

                      <button
                        type="button"
                        className="pp-add-pricepilot-button"
                        disabled={
                          isSaving ||
                          isSaved ||
                          !item.itemId
                        }
                        onClick={() => addEbayProduct(item)}
                      >

                        {isSaved ? (

                          <>
                            <CheckCircle size={16} />
                            Added to PricePilot
                          </>

                        ) : isSaving ? (

                          <>
                            <RefreshCw
                              size={16}
                              className="pp-spinning"
                            />
                            Adding...
                          </>

                        ) : (

                          <>
                            <ShoppingBag size={16} />
                            Add to PricePilot
                          </>

                        )}

                      </button>

                    </div>

                  </article>

                );

              })}

            </div>

          )}

        </section>

      </main>

      {/* FOOTER */}

      <footer className="pp-footer">

        <div className="pp-footer-logo">
          PricePilot.
        </div>

        <p>
          Compare prices. Discover deals. Shop smarter.
        </p>

        <span>
          © {new Date().getFullYear()} PricePilot. All rights reserved.
        </span>

      </footer>

    </div>
  );
}

export default ProductPage;
