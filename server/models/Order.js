import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true } // Price at the time of purchase
  }],
  shippingDetails: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
    zip: { type: String }
  },
  paymentIntentId: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ["Cash on Delivery", "Online Payment"],
    required: true 
  },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
    default: "Pending" 
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
