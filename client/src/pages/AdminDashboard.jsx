import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/admin";

function AdminDashboard() {

    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [alerts, setAlerts] = useState([]);

    const [activeTab, setActiveTab] = useState("overview");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Get admin token
    

    // FETCH DASHBOARD DATA
    const fetchData = async () => {

        try {

            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");

            const headers = {
                  Authorization: `Bearer ${token}`
            };
            const responses = await Promise.all([
                fetch(`${API}/stats`, { headers }),
                fetch(`${API}/users`, { headers }),
                fetch(`${API}/products`, { headers }),
                fetch(`${API}/offers`, { headers }),
                fetch(`${API}/alerts`, { headers })
            ]);

            if (responses.some(response => !response.ok)) {
                throw new Error("Unable to load admin data");
            }

            const [
                statsData,
                usersData,
                productsData,
                offersData,
                alertsData
            ] = await Promise.all(
                responses.map(response => response.json())
            );

            setStats(statsData.stats || {});
            setUsers(usersData.users || []);
            setProducts(productsData.products || []);
            setOffers(offersData.offers || []);
            setAlerts(alertsData.alerts || []);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {
        fetchData();
    }, []);


    // DELETE USER
    
const handleDeleteUser = async (id) => {

    if (!window.confirm("Delete this user?")) return;

    try {

        // Get the latest JWT token
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found. Please login again.");
        }

        const response = await fetch(`${API}/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete user");
        }

        alert("User deleted successfully");

        // Refresh dashboard data
        await fetchData();

    } catch (error) {

        console.error("Delete user error:", error);

        alert(error.message);

    }

};


    // CHANGE USER ROLE
   
const handleRoleChange = async (id, role) => {

    try {

        // Get the latest JWT token
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found. Please login again.");
        }

        const response = await fetch(`${API}/users/${id}/role`, {

            method: "PUT",

            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ role })

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to update user role");
        }

        alert("User role updated successfully");

        // Refresh dashboard data
        await fetchData();

    } catch (error) {

        console.error("Role update error:", error);

        alert(error.message);

    }

};



    // DELETE PRODUCT
    
const handleDeleteProduct = async (id) => {

    if (!window.confirm("Delete this product?")) return;

    try {

        // Get the latest JWT token
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Authentication token not found. Please login again.");
        }

        const response = await fetch(`${API}/products/${id}`, {

            method: "DELETE",

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to delete product");
        }

        alert("Product deleted successfully");

        // Refresh dashboard data
        await fetchData();

    } catch (error) {

        console.error("Delete product error:", error);

        alert(error.message);

    }

};



    if (loading) {
        return <h2>Loading Admin Dashboard...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }


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
                padding: "25px"
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
                background: "#f4f6fa"
            }}>

                <h1>Admin Dashboard</h1>


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
                                        boxShadow:
                                            "0 2px 8px #00000010"
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

                        <table width="100%" cellPadding="12">
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
                                                value={user.role}
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
                                                onClick={() =>
                                                    handleDeleteUser(user._id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </td>

                                    </tr>

                                ))}

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
                                    onClick={() =>
                                        handleDeleteProduct(product._id)
                                    }
                                >
                                    Delete Product
                                </button>

                            </div>

                        ))}

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
                                    margin: "10px 0"
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
                                    margin: "10px 0"
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

                    </>

                )}

            </div>

        </div>

    );

}

export default AdminDashboard;