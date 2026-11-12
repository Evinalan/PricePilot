const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));

// Add your other existing routes here
// Example:
// app.use("/api/watchlist", require("./routes/watchlistRoutes"));
// app.use("/api/alerts", require("./routes/alertRoutes"));
// app.use("/api/admin", require("./routes/adminRoutes"));

module.exports = app;