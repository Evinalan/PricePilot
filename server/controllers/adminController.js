const User = require("../models/User");
const Product = require("../models/Product");
const RetailerOffer = require("../models/RetailerOffer");
const PriceAlert = require("../models/PriceAlert");

// GET ADMIN DASHBOARD STATISTICS
exports.getDashboardStats = async (req, res) => {
    try {

        const totalUsers = await User.countDocuments();

        const totalProducts = await Product.countDocuments();

        const totalOffers = await RetailerOffer.countDocuments();

        const totalAlerts = await PriceAlert.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOffers,
                totalAlerts
            }
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// GET ALL USERS
exports.getAllUsers = async (req, res) => {
    try {

        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// DELETE USER
exports.deleteUser = async (req, res) => {
    try {

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot delete your own admin account"
            });
        }

        if (user.role === "admin") {
            return res.status(400).json({
                message: "Cannot delete an admin account using this action"
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// CHANGE USER ROLE
exports.updateUserRole = async (req, res) => {
    try {

        const { role } = req.body;

        if (!["user", "admin"].includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({
                message: "You cannot change your own role"
            });
        }

        user.role = role;

        await user.save();

        res.status(200).json({
            success: true,
            message: "User role updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// GET ALL PRODUCTS
exports.getAllProducts = async (req, res) => {
    try {

        const products = await Product.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
    try {

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// GET ALL RETAILER OFFERS
exports.getAllOffers = async (req, res) => {
    try {

        const offers = await RetailerOffer.find()
            .populate("product")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            offers
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};


// GET ALL PRICE ALERTS
exports.getAllAlerts = async (req, res) => {
    try {

        const alerts = await PriceAlert.find()
            .populate("user", "name email")
            .populate("product", "name image")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            alerts
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};