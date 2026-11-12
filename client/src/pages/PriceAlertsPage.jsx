
import { useEffect, useState } from "react";

function PriceAlertsPage() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/price-alerts",
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

      setAlerts(data.alerts);

    } catch (error) {
      console.error(error);
    }
  };

  const deleteAlert = async (id) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/price-alerts/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Unable to delete alert");
      }

      fetchAlerts();

    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div>
      <h1>My Price Alerts 🔔</h1>

      {alerts.length === 0 ? (
        <p>No price alerts created yet.</p>
      ) : (
        alerts.map((alert) => (
          <div key={alert._id}>
            <h3>
              {alert.product?.name || alert.product?.title}
            </h3>

            <p>
              Target Price: ₹{alert.targetPrice}
            </p>

            <p>Status: {alert.status}</p>

            <button
              onClick={() => deleteAlert(alert._id)}
            >
              Delete Alert
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default PriceAlertsPage;
