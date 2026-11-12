
const dotenv = require("dotenv");
dotenv.config();

const app = require("./app");
const connectDB = require("./config/db");
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./docs/swagger");



const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const retailerRoutes = require("./routes/retailerRoutes");
const comparisonRoutes = require("./routes/comparisonRoutes");
const priceHistoryRoutes = require("./routes/priceHistoryRoutes");
const ebayNotificationRoutes = require("./routes/ebayNotificationRoutes");
const watchlistRoutes = require("./routes/watchlistRoutes");
const priceAlertRoutes = require("./routes/priceAlertRoutes");
const ebayProductRoutes = require("./routes/ebayProductRoutes");
const adminRoutes = require("./routes/adminRoutes");


app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "PricePilot API is running"
  });
});

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/retailers", retailerRoutes);
app.use("/api/compare", comparisonRoutes);
app.use("/api/price-history", priceHistoryRoutes);
app.use("/api/ebay", ebayNotificationRoutes);
app.use("/api/retailers/ebay", ebayProductRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/price-alerts", priceAlertRoutes);
app.use("/api/products", ebayProductRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/retailers/ebay", ebayProductRoutes);
const PORT = process.env.PORT || 5000;

// Start the server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    console.log("Database connection ready!");

    // Start automatic price tracking after database connection
    require("./cron/priceTrackingJob");

    app.listen(PORT,"0.0.0.0", () => {
      console.log(`PricePilot server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
