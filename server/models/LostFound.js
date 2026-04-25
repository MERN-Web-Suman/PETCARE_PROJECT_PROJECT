import mongoose from "mongoose";

const schema = new mongoose.Schema({
  type: String,
  petName: String,
  breed: String,
  location: String,
  description: String,
  reward: String,
  contact: String,
  image: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("LostFound", schema);
