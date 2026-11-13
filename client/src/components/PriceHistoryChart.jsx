import api from "../api";
import { useEffect, useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function PriceHistoryChart({
  productId,
  retailer = "All",
  externalId = null
}) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  
useEffect(() => {
  if (!productId) {
    setHistory([]);
    return;
  }

  
const fetchHistory = async () => {
  try {
    setLoading(true);
    setError("");

    const params = {
      retailer
    };

    if (externalId) {
      params.externalId = externalId;
    }

    const response = await api.get(
      `/price-history/${productId}`,
      { params }
    );

    const data = response.data;

    const chartData = (data.history || []).map(item => ({
      date: new Date(item.recordedAt).toLocaleString(),
      price: Number(item.price),
      currency: item.currency || "INR",
      retailer: item.retailer,
      externalId: item.externalId
    }));

    setHistory(chartData);

  } catch (err) {
    console.error("Fetch price history error:", err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Failed to fetch price history"
    );

    setHistory([]);

  } finally {
    setLoading(false);
  }
};


  // Fetch history immediately
  fetchHistory();

  // Refresh chart every 60 seconds
  const interval = setInterval(() => {
    fetchHistory();
  }, 60 * 1000);

  // Clean up interval
  return () => {
    clearInterval(interval);
  };

}, [productId, retailer, externalId]);


  if (!productId) {
    return <p>Please select a product.</p>;
  }

  const currency = history.length > 0
    ? history[0].currency
    : "INR";

  const formatPrice = (value, currencyCode = currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode
    }).format(value);
  };

  const chartTitle = externalId
    ? `${retailer} Listing ${externalId} Price History`
    : `${retailer} Price History`;

  return (
    <div style={{ marginTop: "25px" }}>

      <h3>
        {chartTitle}
      </h3>

      {loading && <p>Loading price history...</p>}

      {error && (
        <p style={{ color: "red" }}>
          Error: {error}
        </p>
      )}

      {!loading && !error && history.length === 0 && (
        <p>No price history recorded yet.</p>
      )}

      {!loading && !error && history.length > 0 && (
        <div style={{ width: "100%", height: 350 }}>

          <ResponsiveContainer width="100%" height="100%">

            <LineChart data={history}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
              />

              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={value => formatPrice(value)}
              />

              <Tooltip
                formatter={(value, name, props) => [
                  formatPrice(value, props.payload.currency),
                  props.payload.retailer
                ]}
                labelFormatter={label => label}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Price"
              />

            </LineChart>

          </ResponsiveContainer>

        </div>
      )}

    </div>
  );
}

export default PriceHistoryChart;
