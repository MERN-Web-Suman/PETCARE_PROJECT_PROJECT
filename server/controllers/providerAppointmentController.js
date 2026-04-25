import Appointment from "../models/Appointment.js";
import { getIO } from "../utils/socket.js";

export const getProviderAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const vetId = req.user?.id || req.user?._id;

    const filter = {};
    if (vetId) filter.vet = vetId;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Appointment.countDocuments(filter);
    const data = await Appointment.find(filter)
      .populate("user vet clinic")
      .sort("-date")
      .skip(skip)
      .limit(Number(limit));

    res.json({ total, page: Number(page), limit: Number(limit), data });
  } catch (err) {
    console.error('getProviderAppointments error:', err.message);
    res.status(500).json({ msg: err.message || 'Failed to load appointments' });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user vet clinic");

    if (!appointment) return res.status(404).json({ msg: 'Appointment not found' });

    const io = getIO();
    if (io) {
      io.emit("appointment-updated", appointment);
      const userId = appointment.user?._id || appointment.user;
      if (userId) {
        io.to(`user-${userId.toString()}`).emit("user-notification", {
          type: "appointment",
          title: "Appointment Status Updated",
          message: `Your appointment status changed to ${appointment.status}`,
          payload: appointment
        });

        // [DEBUG] Global broadcast to see if it reaches the client
        io.emit("global-debug-message", {
          message: `Appointment ${appointment._id} status updated to ${appointment.status}`,
          userId: userId.toString()
        });
      }
    }

    res.json(appointment);
  } catch (err) {
    console.error('updateAppointmentStatus error:', err.message);
    res.status(500).json({ msg: err.message || 'Failed to update appointment status' });
  }
};

export const replyToAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorReply, roomNumber, replyLocation } = req.body;

    if (!doctorReply || !doctorReply.trim()) {
      return res.status(400).json({ msg: "Reply message cannot be empty" });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      {
        doctorReply: doctorReply.trim(),
        roomNumber: (roomNumber || "").trim(),
        replyLocation: (replyLocation || "").trim(),
      },
      { new: true }
    ).populate("user vet clinic");

    if (!appointment) return res.status(404).json({ msg: "Appointment not found" });

    const io = getIO();
    if (io) {
      io.emit("appointment-updated", appointment);
      const userId = appointment.user?._id || appointment.user;
      if (userId) {
        io.to(`user-${userId.toString()}`).emit("user-notification", {
          type: "appointment",
          title: "New Provider Message",
          message: `Your provider sent an instruction: "${appointment.doctorReply}"`,
          payload: appointment
        });

        // [DEBUG] Global broadcast to see if it reaches the client
        io.emit("global-debug-message", {
          message: `Reply sent to appointment ${appointment._id}`,
          userId: userId.toString()
        });
      }
    }

    res.json(appointment);
  } catch (err) {
    console.error('replyToAppointment error:', err.message);
    res.status(500).json({ msg: err.message || 'Failed to send reply' });
  }
};

