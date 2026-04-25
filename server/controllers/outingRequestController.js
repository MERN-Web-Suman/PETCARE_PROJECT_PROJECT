import OutingRequest from "../models/OutingRequest.js";
import { getIO } from "../utils/socket.js";

export const createOutingRequest = async (req, res) => {
  try {
    const data = { ...req.body };
    data.requester = req.user.id;
    
    const request = await OutingRequest.create(data);
    
    const io = getIO();
    if (io) {
      io.to(data.owner).emit("outing-request-created", request);
    }
    
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to create outing request", error: error.message });
  }
};

export const getOwnerOutingRequests = async (req, res) => {
  try {
    const requests = await OutingRequest.find({ owner: req.user.id })
      .populate("pet")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch outing requests", error: error.message });
  }
};

export const getRequesterOutingRequests = async (req, res) => {
  try {
    const requests = await OutingRequest.find({ requester: req.user.id })
      .populate("pet")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your requests", error: error.message });
  }
};

export const updateOutingRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const request = await OutingRequest.findByIdAndUpdate(id, { status }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    
    const io = getIO();
    if (io) {
      io.to(request.requester).emit("outing-request-updated", request);
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};
