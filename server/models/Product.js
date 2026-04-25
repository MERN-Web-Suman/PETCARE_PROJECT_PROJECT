import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: String,
  price: Number,
  stock: Number,
  category: String,
  image: String,
  specifications: [{ 
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  status: { type: String, default: 'In Stock' },

  // 💊 Medicine/Product Details
  medicineName: String,
  brandName: String,
  type: String, // Tablet, Syrup, Injection, Powder

  // 🐾 Pet-Specific Details
  suitableFor: [String], // Dog, Cat, Bird, etc.
  breedSize: [String],   // Small, Medium, Large
  ageGroup: [String],    // Puppy, Adult, Senior
  
  // 🏢 Provider Info
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Product", schema);
