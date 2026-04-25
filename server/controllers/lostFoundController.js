import LostFound from "../models/LostFound.js";
import cloudinary from "../config/cloudinary.js";

export const createLostFound = async (req, res) => {
  try {
    const data = { ...req.body };
    // Automatically set the user (owner) from the token
    data.user = req.user.id;

    if (req.file) {
      data.image = req.file.path.replace(/\\/g, "/"); 
    }
    const report = await LostFound.create(data);
    res.json(report);
  } catch (e) {
    res.status(500).json({ message: "Failed to create report", error: e.message });
  }
};

export const getLostFounds = async (req, res) => {
  try {
    const reports = await LostFound.find().sort({ createdAt: -1 }).populate("user", "name email");
    res.json(reports);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateLostFound = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Authorization: Check if the user is the owner
    if (report.user && report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Action restricted to the owner." });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    const updatedReport = await LostFound.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedReport);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteLostFound = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    // Authorization: Check if the user is the owner
    if (report.user && report.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied. Action restricted to the owner." });
    }

    await LostFound.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
