import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/wishlist
router.get("/", protect, getWishlist);

// POST /api/wishlist/toggle/:productId
router.post("/toggle/:productId", protect, toggleWishlist);

export default router;
