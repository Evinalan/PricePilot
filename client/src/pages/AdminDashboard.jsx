
import { useEffect, useState } from "react";
import api from "../api";

function AdminDashboard() {

  // ==========================================
  // STATES
  // ==========================================

  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [alerts, setAlerts] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  // ==========================================
  // FETCH DASHBOARD DATA
  // ==========================================

  const fetchData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        statsResponse,
        usersResponse,
        productsResponse,
        offersResponse,
        alertsResponse
      ] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/products"),
        api.get("/admin/offers"),
        api.get("/admin/alerts")
      ]);

      setStats(statsResponse.data.stats || {});
      setUsers(usersResponse.data.users || []);
      setProducts(productsResponse.data.products || []);
      setOffers(offersResponse.data.offers || []);
      setAlerts(alertsResponse.data.alerts || []);

    } catch (error) {

      console.error(
        "Admin dashboard error:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
        error.message ||
        "Unable to load admin dashboard"
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // DELETE USER
  // ==========================================

  const handleDeleteUser = async (id) => {

    if (!window.confirm("Delete this user?")) {
      return;
    }

    try {

      setActionLoading(true);

      await api.delete(`/admin/users/${id}`);

      alert("User deleted successfully");

      await fetchData();

    } catch (error) {

      console.error(
        "Delete user error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to delete user"
      );

    } finally {

      setActionLoading(false);

    }

  };

  // ==========================================
  // CHANGE USER ROLE
  // ==========================================

  const handleRoleChange = async (id, role) => {

    try {

      setActionLoading(true);

      await api.put(`/admin/users/${id}/role`, {
        role
      });

      alert("User role updated successfully");

      await fetchData();

    } catch (error) {

      console.error(
        "Role update error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to update user role"
      );

    } finally {

      setActionLoading(false);

    }

  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const handleDeleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) {
      return;
    }

    try {

      setActionLoading(true);

      await api.delete(`/admin/products/${id}`);

      alert("Product deleted successfully");

      await fetchData();

    } catch (error) {

      console.error(
        "Delete product error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to delete product"
      );

    } finally {

      setActionLoading(false);

    }

  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (
      <div style={{ padding: "30px" }}>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );

  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {

    return (
      <div style={{ padding: "30px" }}>

        <h2>Unable to load Admin Dashboard</h2>

        <p style={{ color: "red" }}>
          {error}
        </p>

        <button onClick={fetchData}>
          Retry
        </button>

      </div>
    );

  }

  // ==========================================
  // DISPLAY
  // ==========================================

  return (

    <div style={{
      display: "flex",
      minHeight: "100vh",
      fontFamily: "Arial"
    }}>

      {/* SIDEBAR */}

      <div style={{
        width: "220px",
        background: "#172033",
        color: "white",
        padding: "25px",
        flexShrink: 0
      }}>

        <h2>PricePilot</h2>

        <h3>Admin Panel</h3>

        {[
          "overview",
          "users",
          "products",
          "offers",
          "alerts"
        ].map(tab => (

          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              display: "block",
              width: "100%",
              padding: "12px",
              margin: "10px 0",
              background:
                activeTab === tab
                  ? "#3b82f6"
                  : "transparent",
              color: "white",
              border: "none",
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "5px"
            }}
          >
            {tab.toUpperCase()}
          </button>

        ))}

      </div>

      {/* MAIN CONTENT */}

      <div style={{
        flex: 1,
        padding: "30px",
        background: "#f4f6fa",
        minWidth: 0,
        overflowX: "auto"
      }}>

        <h1>Admin Dashboard</h1>

        {actionLoading && (
          <p>Processing your request...</p>
        )}

        {/* OVERVIEW */}

        {activeTab === "overview" && (

          <>

            <h2>Application Statistics</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "20px"
            }}>

              {[
                ["Total Users", stats.totalUsers],
                ["Total Products", stats.totalProducts],
                ["Retailer Offers", stats.totalOffers],
                ["Price Alerts", stats.totalAlerts]
              ].map(([label, value]) => (

                <div
                  key={label}
                  style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px #00000010"
                  }}
                >

                  <h3>{label}</h3>

                  <h1>{value ?? 0}</h1>

                </div>

              ))}

            </div>

          </>

        )}

        {/* USERS */}

        {activeTab === "users" && (

          <>

            <h2>User Management</h2>

            <table
              width="100%"
              cellPadding="12"
              style={{
                background: "white",
                borderCollapse: "collapse"
              }}
            >

              <thead>

                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {users.map(user => (

                  <tr key={user._id}>

                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>

                      <select
                        value={user.role || "user"}
                        disabled={actionLoading}
                        onChange={e =>
                          handleRoleChange(
                            user._id,
                            e.target.value
                          )
                        }
                      >

                        <option value="user">
                          User
                        </option>

                        <option value="admin">
                          Admin
                        </option>

                      </select>

                    </td>

                    <td>

                      <button
                        disabled={actionLoading}
                        onClick={() =>
                          handleDeleteUser(user._id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

                {users.length === 0 && (

                  <tr>
                    <td colSpan="4">
                      No users found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </>

        )}

        {/* PRODUCTS */}

        {activeTab === "products" && (

          <>

            <h2>Product Management</h2>

            {products.map(product => (

              <div
                key={product._id}
                style={{
                  background: "white",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "8px"
                }}
              >

                <h3>{product.name}</h3>

                <p>{product.brand}</p>

                <button
                  disabled={actionLoading}
                  onClick={() =>
                    handleDeleteProduct(product._id)
                  }
                >
                  Delete Product
                </button>

              </div>

            ))}

            {products.length === 0 && (
              <p>No products found.</p>
            )}

          </>

        )}

        {/* OFFERS */}

        {activeTab === "offers" && (

          <>

            <h2>Retailer Offers</h2>

            {offers.map(offer => (

              <div
                key={offer._id}
                style={{
                  background: "white",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "8px"
                }}
              >

                <p>
                  Retailer: {offer.retailer}
                </p>

                <p>
                  Price: {offer.price}
                </p>

                <p>
                  External ID: {offer.externalId}
                </p>

              </div>

            ))}

            {offers.length === 0 && (
              <p>No retailer offers found.</p>
            )}

          </>

        )}

        {/* ALERTS */}

        {activeTab === "alerts" && (

          <>

            <h2>Price Alerts</h2>

            {alerts.map(alert => (

              <div
                key={alert._id}
                style={{
                  background: "white",
                  padding: "15px",
                  margin: "10px 0",
                  borderRadius: "8px"
                }}
              >

                <p>
                  User: {alert.user?.name || "Unknown"}
                </p>

                <p>
                  Product: {alert.product?.name || "Unknown"}
                </p>

                <p>
                  Target Price: {alert.targetPrice}
                </p>

              </div>

            ))}

            {alerts.length === 0 && (
              <p>No price alerts found.</p>
            )}

          </>

        )}

      </div>

    </div>

  );

}

export default AdminDashboard;
