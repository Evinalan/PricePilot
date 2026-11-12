
import { useState } from "react";

function PriceAlertForm({
  productId,
  retailer,
  externalId,
  currentPrice
}) {
  const [targetPrice, setTargetPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const createAlert = async () => {
    try {
      if (!productId || !retailer || !externalId) {
        alert("Please select a valid retailer listing.");
        return;
      }

      if (
        !targetPrice ||
        !Number.isFinite(Number(targetPrice)) ||
        Number(targetPrice) <= 0
      ) {
        alert("Enter a valid target price.");
        return;
      }

      if (
        currentPrice != null &&
        Number(targetPrice) >= Number(currentPrice)
      ) {
        alert("Target price should be lower than the current price.");
        return;
      }

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please log in to create a price alert.");
        return;
      }

      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/price-alerts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            productId,
            retailer,
            externalId: String(externalId),
            targetPrice: Number(targetPrice)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create alert."
        );
      }

      alert("Price alert created successfully!");

      setTargetPrice("");

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pp-price-alert-form">

      <h3>Set Price Alert 🔔</h3>

      <p>
        Selected retailer: {retailer || "Not selected"}
      </p>

      <p>
        Listing ID: {externalId || "Not selected"}
      </p>

      {currentPrice != null && (
        <p>
          Current Price: ₹{Number(currentPrice).toLocaleString("en-IN")}
        </p>
      )}

      <input
        type="number"
        min="1"
        placeholder="Enter target price"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        disabled={!retailer || !externalId || loading}
      />

      <button
        type="button"
        onClick={createAlert}
        disabled={
          loading ||
          !retailer ||
          !externalId
        }
      >
        {loading ? "Creating..." : "Create Alert"}
      </button>

    </div>
  );
}

export default PriceAlertForm;

