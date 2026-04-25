import mongoose from "mongoose";

const schema = new mongoose.Schema({
  provider: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorAbout: { type: String },
  experience: { type: String, required: true },
  specialization: { type: String, required: true },
  workingHours: { type: String, default: "9:00 AM - 6:00 PM" },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Clinic", schema);
