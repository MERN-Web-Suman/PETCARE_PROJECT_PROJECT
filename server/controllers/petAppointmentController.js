import PetAppointment from "../models/PetAppointment.js";
import Pet from "../models/Pet.js";
import { getIO } from "../utils/socket.js";

export const createPetAppointment = async (req, res) => {
  try {
    const data = { ...req.body };
    data.requester = req.user.id;
    
    const appointment = await PetAppointment.create(data);
    
    // Update pet to show that it has an appointment
    await Pet.findByIdAndUpdate(data.pet, { hasAppointment: true });

    // Notify the owner via socket
    const io = getIO();
    if (io) {
      io.to(data.owner).emit("pet-appointment-created", appointment);
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to create adoption request", error: error.message });
  }
};

export const getOwnerPetAppointments = async (req, res) => {
  try {
    const appointments = await PetAppointment.find({ owner: req.user.id })
      .populate("pet")
      .populate("requester", "name email")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch adoption requests", error: error.message });
  }
};

export const getRequesterPetAppointments = async (req, res) => {
  try {
    const appointments = await PetAppointment.find({ requester: req.user.id })
      .populate("pet")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your requests", error: error.message });
  }
};

export const updatePetAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await PetAppointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: "Request not found" });
    
    // Notify the requester
    const io = getIO();
    if (io) {
      io.to(appointment.requester).emit("pet-appointment-updated", appointment);
    }
    
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Failed to update request", error: error.message });
  }
};
