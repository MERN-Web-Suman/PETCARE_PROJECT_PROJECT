import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: String,
  age: Number,
  color: String,
  weight: String,
  microchipId: String,
  dateOfBirth: Date,
  description: String,
  ownerName: String,
  medicalHistory: String,
  vaccinations: String,
  nextAppointment: Date,
  image: String,
  status: { type: String, enum: ["Available", "Sold"], default: "Available" },
  hasAppointment: { type: Boolean, default: false },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Pet", schema);
