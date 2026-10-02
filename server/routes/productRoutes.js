const express = require("express");

const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {

    try {

        const products =
            await Product.find();

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});
router.post("/", async (req, res) => {

    try {

        const product = await Product.create({
            name: req.body.name,
            brand: req.body.brand,
            category: req.body.category
        });

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

});

module.exports = router;