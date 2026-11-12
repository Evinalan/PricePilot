
import { useState } from "react";

function WatchlistButton({
  productId,
  retailer,
  externalId
}) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const addToWatchlist = async () => {
    try {
      if (!productId || !retailer || !externalId) {
        alert("Product or listing information is missing.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in to use the watchlist.");
        return;
      }

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/watchlist",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            retailer,
            externalId: String(externalId)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add listing to watchlist"
        );
      }

      setAdded(true);

      alert("Listing added to watchlist!");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={addToWatchlist}
      disabled={loading || added}
    >
      {loading
        ? "Adding..."
        : added
        ? "❤️ Added"
        : "♡ Add to Watchlist"}
    </button>
  );
}

export default WatchlistButton;
