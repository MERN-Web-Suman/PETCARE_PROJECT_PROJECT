import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  refundPayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Razorpay order
router.post("/create-order", protect, createPaymentOrder);

// Verify Razorpay payment
router.post("/verify-signature", protect, verifyPayment);

// Get payment history
router.get("/history", protect, getPaymentHistory);

// Refund payment
router.post("/refund", protect, refundPayment);

export default router;
