
import { useEffect, useState } from "react";
import api from "../api";

function WatchlistPage() {
  const [items, setItems] = useState([]);

  const fetchWatchlist = async () => {
    try {
      const response = await api.get("/watchlist");

      setItems(response.data.watchlist || []);

    } catch (error) {
      console.error(
        "Fetch watchlist error:",
        error.response?.data || error.message
      );
    }
  };

  const removeProduct = async (id) => {
    try {
      await api.delete(`/watchlist/${id}`);

      fetchWatchlist();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Unable to remove product"
      );
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  return (
    <div>
      <h1>My Watchlist ❤️</h1>

      {items.length === 0 ? (
        <p>Your watchlist is empty.</p>
      ) : (
        items.map((item) => (
          <div key={item._id}>
            <h3>
              {item.product?.name || item.product?.title}
            </h3>

            <button
              onClick={() => removeProduct(item._id)}
            >
              Remove
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default WatchlistPage;
