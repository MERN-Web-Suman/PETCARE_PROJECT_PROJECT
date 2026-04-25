import mongoose from "mongoose";

const schema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emergencyType: { type: String, required: true },
  petName: { type: String, required: true },
  petContactNumber: { type: String, required: true },
  location: { type: String, required: true },
  description: String,
  status: { type: String, enum: ["Active", "Resolved", "In-Progress"], default: "Active" }
}, { timestamps: true });

export default mongoose.model("SOS", schema);
