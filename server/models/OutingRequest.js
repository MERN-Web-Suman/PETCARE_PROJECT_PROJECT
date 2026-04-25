import mongoose from "mongoose";

const schema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  petName: { type: String, required: true },
  applicantName: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  message: { type: String },
  status: { type: String, enum: ["pending", "confirmed", "rejected"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("OutingRequest", schema);
