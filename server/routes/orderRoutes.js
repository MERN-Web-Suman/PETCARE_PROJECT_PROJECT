import express from "express";
import {
  createOrder,
  getUserOrders,
  getProviderOrders,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";
import { protect, isProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/user", protect, getUserOrders);
router.get("/provider", protect, isProvider, getProviderOrders);
router.patch("/status/:id", protect, isProvider, updateOrderStatus);
router.patch("/:id/cancel", protect, cancelOrder);

export default router;
