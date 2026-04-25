import mongoose from "mongoose";

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Health Tips", "Emergency", "General Care", "Seasonal Tips"], 
    default: "General Care" 
  },
  content: { type: String, required: true },
  doctorName: { type: String, required: true },
  experience: { type: String, required: true },
  specialization: { type: String },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stars: { type: Number, min: 1, max: 5 }
  }],
  isPinned: { type: Boolean, default: false },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model("Notice", schema);
