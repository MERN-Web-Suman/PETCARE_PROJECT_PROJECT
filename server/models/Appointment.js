import mongoose from "mongoose";

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  vet: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clinic: { type: mongoose.Schema.Types.ObjectId, ref: "Clinic" },
  petName: String,
  vetName: String,
  date: Date,
  time: String,
  reason: String,
  status: { type: String, default: "pending" },
  doctorReply: { type: String, default: "" },      // text instructions
  roomNumber: { type: String, default: "" },       // e.g. "Room 3B"
  replyLocation: { type: String, default: "" },    // e.g. "2nd Floor, Block A"
}, { timestamps: true });

export default mongoose.model("Appointment", schema);
