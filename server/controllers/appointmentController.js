import Appointment from "../models/Appointment.js";
import { getIO } from "../utils/socket.js";

export const bookAppointment = async (req, res) => {
  try {
    const { date, time } = req.body;
    if (date || time) {
      const proposed = combineDateTime(null, date, time);
      if (isNaN(proposed.getTime())) return res.status(400).json({ msg: 'Invalid date/time' });
      // Use a 30-min grace window to handle client/server timezone differences
      if (proposed < new Date(Date.now() - 30 * 60 * 1000)) {
        return res.status(400).json({ msg: 'Cannot book appointment in the past' });
      }
      req.body.date = proposed;
    }

    const appointment = await Appointment.create({
      ...req.body,
      user: req.user?.id || req.user?._id
    });

    const populated = await Appointment.findById(appointment._id).populate('user vet clinic');

    const io = getIO();
    if (io) io.emit("appointment-created", populated);

    res.json(populated);
  } catch (err) {
    console.error('bookAppointment error:', err.message);
    res.status(500).json({ msg: err.message || 'Failed to book appointment. Please try again.' });
  }
};

const allowedStatuses = new Set(['pending', 'confirmed', 'rejected', 'completed', 'cancelled']);

function combineDateTime(existingDate, dateStr, timeStr) {
  // existingDate may be a Date or ISO string
  const base = existingDate ? new Date(existingDate) : new Date();
  let year = base.getFullYear();
  let month = base.getMonth();
  let day = base.getDate();
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d)) {
      year = d.getFullYear();
      month = d.getMonth();
      day = d.getDate();
    }
  }
  let hours = base.getHours();
  let minutes = base.getMinutes();
  if (timeStr) {
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    }
  }
  return new Date(year, month, day, hours, minutes);
}

export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, date, time, reason } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });

    // allow only owner (user) or provider/admin to update
    const userId = req.user?.id || req.user?._id;
    if (String(appt.user) !== String(userId) && !(req.user?.role === 'provider' || req.user?.role === 'admin')) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Validate and normalize status
    if (status) {
      const s = String(status).toLowerCase();
      const normalized = s === 'approved' ? 'confirmed' : s;
      if (!allowedStatuses.has(normalized)) return res.status(400).json({ msg: 'Invalid status' });
      appt.status = normalized;
    }

    // Validate date/time (prevent scheduling in the past)
    if (date || time) {
      const newDt = combineDateTime(appt.date, date, time);
      if (isNaN(newDt.getTime())) return res.status(400).json({ msg: 'Invalid date/time' });
      // Use a 30-min grace window to handle client/server timezone differences
      if (newDt < new Date(Date.now() - 30 * 60 * 1000)) {
        return res.status(400).json({ msg: 'Cannot set appointment in the past' });
      }
      appt.date = newDt;
      if (time) appt.time = time;
    }

    if (reason) appt.reason = reason;

    await appt.save();
    const populated = await Appointment.findById(appt._id).populate('user vet clinic');

    const io = getIO();
    if (io) io.emit('appointment-updated', populated);

    res.json(populated);
  } catch (err) {
    console.error('updateAppointment error:', err.message);
    res.status(500).json({ msg: 'Failed to update appointment: ' + err.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ msg: 'Appointment not found' });

    const userId = req.user?.id || req.user?._id;
    if (String(appt.user) !== String(userId) && !(req.user?.role === 'provider' || req.user?.role === 'admin')) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await appt.deleteOne();

    const io = getIO();
    if (io) io.emit('appointment-deleted', { _id: id });

    res.json({ success: true });
  } catch (err) {
    console.error('deleteAppointment error:', err.message);
    res.status(500).json({ msg: 'Failed to delete appointment: ' + err.message });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    res.json(await Appointment.find({ user: userId }).populate("user vet clinic"));
  } catch (err) {
    console.error('getAppointments error:', err.message);
    res.status(500).json({ msg: 'Failed to fetch appointments: ' + err.message });
  }
};
