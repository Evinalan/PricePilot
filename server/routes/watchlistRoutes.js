
const express = require("express");

const router = express.Router();

const {
  addToWatchlist,
  getWatchlist,
  removeFromWatchlist
} = require("../controllers/watchlistController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addToWatchlist);

router.get("/", authMiddleware, getWatchlist);

router.delete("/:id", authMiddleware, removeFromWatchlist);

module.exports = router;
