import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProviderProducts,
} from "../controllers/productController.js";
import { protect, isProvider } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.get("/", getProducts);
router.get("/provider", protect, isProvider, getProviderProducts);
router.get("/:id", getProductById);
router.post("/", protect, isProvider, upload.single("image"), createProduct);
router.put("/:id", protect, isProvider, upload.single("image"), updateProduct);
router.delete("/:id", protect, isProvider, deleteProduct);

export default router;
