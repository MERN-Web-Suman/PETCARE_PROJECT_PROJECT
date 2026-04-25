import Razorpay from "Razorpay";
import crypto from "crypto";

// Initialize Razorpay
const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "secret_placeholder",
  });
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const instance = getRazorpayInstance();

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder"
    });
  } catch (err) {
    console.error("Razorpay order creation error:", err);
    res.status(500).json({ message: "Payment order creation failed", error: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const secret = process.env.RAZORPAY_KEY_SECRET || "secret_placeholder";

    // Create HMAC using SHA256
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const expectedSignature = hmac.digest("hex");

    if (expectedSignature === razorpay_signature) {
      res.status(200).json({
        success: true,
        message: "Payment successfully verified",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid signature, payment verification failed",
      });
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    res.status(500).json({ message: "Error verifying payment", error: err.message });
  }
};

export const getPaymentHistory = async (req, res) => {
  try {
    const instance = getRazorpayInstance();
    const payments = await instance.payments.all({
      count: 10
    });

    res.status(200).json({
      payments: payments.items.map(payment => ({
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        created: new Date(payment.created_at * 1000)
      }))
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching payments", error: err.message });
  }
};

export const refundPayment = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    const instance = getRazorpayInstance();
    const refundData = {
      payment_id: paymentId
    };
    
    if (amount) {
      refundData.amount = Math.round(amount * 100);
    }

    const refund = await instance.payments.refund(paymentId, refundData);

    res.status(200).json({
      success: true,
      message: "Refund processed",
      refundId: refund.id
    });
  } catch (err) {
    res.status(500).json({ message: "Refund error", error: err.message });
  }
};
