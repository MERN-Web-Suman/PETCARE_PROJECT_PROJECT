import mongoose from "mongoose";

const schema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet" },
  notes: String,
  date: Date
});

export default mongoose.model("MedicalRecord", schema);
