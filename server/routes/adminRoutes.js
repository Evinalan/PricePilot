const express = require("express");

const router = express.Router();

const adminMiddleware = require("../middleware/adminMiddleware");

const {
    getDashboardStats,
    getAllUsers,
    deleteUser,
    updateUserRole,
    getAllProducts,
    deleteProduct,
    getAllOffers,
    getAllAlerts
} = require("../controllers/adminController");


// Dashboard statistics
router.get("/stats", adminMiddleware, getDashboardStats);


// User management
router.get("/users", adminMiddleware, getAllUsers);

router.delete("/users/:id", adminMiddleware, deleteUser);

router.put("/users/:id/role", adminMiddleware, updateUserRole);


// Product management
router.get("/products", adminMiddleware, getAllProducts);

router.delete("/products/:id", adminMiddleware, deleteProduct);


// Retailer management
router.get("/offers", adminMiddleware, getAllOffers);


// Price alerts
router.get("/alerts", adminMiddleware, getAllAlerts);


module.exports = router;