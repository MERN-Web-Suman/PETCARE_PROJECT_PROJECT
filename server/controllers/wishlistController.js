import User from "../models/User.js";
import Product from "../models/Product.js";
import { mapProductForMart } from "./productController.js";

// Fetch user wishlist
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Some products might have been deleted, filter out nulls
    const activeWishlist = user.wishlist.filter(p => p !== null);
    
    // Map products to ensure they have the correct image URLs and other formatted fields
    const formattedWishlist = activeWishlist.map(mapProductForMart);
    
    res.json(formattedWishlist);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

// Toggle product in wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const index = user.wishlist.indexOf(productId);
    let action = '';

    if (index === -1) {
      // Add to wishlist
      user.wishlist.push(productId);
      action = 'added';
    } else {
      // Remove from wishlist
      user.wishlist.splice(index, 1);
      action = 'removed';
    }
    
    await user.save();
    res.json({ message: `Product ${action} from wishlist`, action, wishlist: user.wishlist });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle wishlist", error: err.message });
  }
};
