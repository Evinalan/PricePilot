
import { useEffect, useState } from "react";

function WatchlistPage() {
  const [items, setItems] = useState([]);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/watchlist",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setItems(data.watchlist);

    } catch (error) {
      console.error(error);
    }
  };

  const removeProduct = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/watchlist/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to remove product");
      }

      fetchWatchlist();

    } catch (error) {
      alert(error.message);
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
            <h3>{item.product?.name || item.product?.title}</h3>

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
