import SOS from "../models/SOS.js";
import { getIO } from "../utils/socket.js";

export const sendSOS = async (req, res) => {
  try {
    const sos = await SOS.create(req.body);
    
    // Broadcast SOS to all online providers
    const io = getIO();
    if (io) {
      io.emit("receive-sos", sos);
    }
    
    res.status(201).json({ msg: "Emergency alert sent", data: sos });
  } catch (error) {
    res.status(500).json({ message: "Failed to send SOS", error: error.message });
  }
};

export const getSOSAlerts = async (req, res) => {
  try {
    const alerts = await SOS.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch SOS alerts", error: error.message });
  }
};

export const getSOSById = async (req, res) => {
  try {
    const sos = await SOS.findById(req.params.id).populate("author", "name email");
    if (!sos) return res.status(404).json({ message: "SOS not found" });
    res.json(sos);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch SOS details", error: error.message });
  }
};

export const deleteSOS = async (req, res) => {
  try {
    await SOS.findByIdAndDelete(req.params.id);
    res.json({ message: "SOS alert removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete SOS", error: error.message });
  }
};
