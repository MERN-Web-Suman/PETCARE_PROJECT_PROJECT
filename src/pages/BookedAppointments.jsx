import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import API from "../services/api";

const BookedAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    petName: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await API.get("/appointments");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await API.put(`/appointments/${id}`, { status: 'cancelled' });
      alert("Appointment cancelled successfully");
      fetchAppointments();
    } catch (err) {
      alert("Failed to cancel appointment: " + (err.response?.data?.msg || err.message));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await API.delete(`/appointments/${id}`);
      setAppointments(appointments.filter(a => a._id !== id));
      alert("Appointment deleted successfully");
    } catch (err) {
      alert("Failed to delete appointment: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleEditClick = (appt) => {
    setEditingId(appt._id);
    setEditForm({
      petName: appt.petName || '',
      date: appt.date ? appt.date.split('T')[0] : '',
      time: appt.time || '',
      reason: appt.reason || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/appointments/${editingId}`, editForm);
      alert("Appointment updated successfully");
      setEditingId(null);
      fetchAppointments();
    } catch (err) {
      alert("Failed to update appointment: " + (err.response?.data?.msg || err.message));
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-black text-gray-900">My Appointments</h1>
            <p className="text-gray-500 mt-2 font-medium">Track your pet's healthcare appointments and clinic responses</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center border border-gray-100">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No appointments yet</h3>
              <p className="text-gray-500 mb-6">Your booked appointments will appear here once you schedule a visit.</p>
              <a href="/clinics" className="inline-block px-8 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all">
                Browse Clinics
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {appointments.map((appt) => (
                <div key={appt._id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 transition-transform hover:scale-[1.01]">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusBadge(appt.status)}`}>
                          {appt.status}
                        </span>
                        <span className="text-gray-400 font-bold">•</span>
                        <span className="text-sm font-black text-gray-900">Pet: {appt.petName}</span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1">
                        {appt.vetName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-2">📅</span>
                          {new Date(appt.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-2">🕒</span>
                          {appt.time}
                        </span>
                      </div>
                    </div>
                    {appt.status === 'pending' && (
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleEditClick(appt)} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                        <button onClick={() => handleCancel(appt._id)} className="px-4 py-2 bg-amber-50 text-amber-600 font-bold rounded-lg hover:bg-amber-600 hover:text-white transition-all">Cancel</button>
                        <button onClick={() => handleDelete(appt._id)} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-600 hover:text-white transition-all">Delete</button>
                      </div>
                    )}
                  </div>

                  {(appt.status === "confirmed" && appt.replyDetails) && (
                    <div className="mt-6 p-5 bg-blue-50 rounded-2xl border border-blue-100 relative group">
                      <div className="absolute -top-3 left-6 px-3 bg-white border border-blue-100 rounded-full">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Clinic Message</span>
                      </div>
                      {appt.status === "confirmed" && appt.replyDetails && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                            💬 Clinic Response:
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                              <span className="text-gray-500 block">Doctor:</span>
                              <span className="font-bold text-indigo-700">{appt.replyDetails.doctorName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Contact:</span>
                              <span className="font-bold text-indigo-700">{appt.replyDetails.assistantContact}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Room:</span>
                              <span className="font-bold text-indigo-700">{appt.replyDetails.roomNumber}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 block">Time:</span>
                              <span className="font-bold text-indigo-700">{appt.replyDetails.availableTime}</span>
                            </div>
                            {appt.replyDetails.location && (
                              <div className="col-span-2 mt-2 pt-2 border-t border-indigo-100/50">
                                <span className="text-gray-500 block">Location:</span>
                                <span className="font-bold text-indigo-700">📍 {appt.replyDetails.location}</span>
                              </div>
                            )}
                            {appt.replyDetails.replyDate && (
                              <div className="col-span-2 mt-2 pt-2 border-t border-indigo-100/50">
                                <span className="text-gray-500 block">Confirmed Date:</span>
                                <span className="font-bold text-indigo-700">📅 {new Date(appt.replyDetails.replyDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {appt.replyDetails.replyNotes && (
                              <div className="col-span-2 mt-2 pt-2 border-t border-indigo-100/50">
                                <span className="text-gray-500 block">Notes:</span>
                                <span className="font-bold text-indigo-700 italic">"{appt.replyDetails.replyNotes}"</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Reason for Visit</p>
                    <p className="text-sm text-gray-700 font-medium">{appt.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in fade-in zoom-in">
            <button onClick={() => setEditingId(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            <h2 className="text-3xl font-black text-gray-900 mb-6">Edit Appointment</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Pet Name</label>
                <input type="text" required value={editForm.petName} onChange={(e) => setEditForm({...editForm, petName:e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-2">Date</label>
                  <input type="date" required value={editForm.date} onChange={(e) => setEditForm({...editForm, date:e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-2">Time</label>
                  <input type="time" required value={editForm.time} onChange={(e) => setEditForm({...editForm, time:e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase mb-2">Reason</label>
                <textarea rows="3" required value={editForm.reason} onChange={(e) => setEditForm({...editForm, reason:e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold resize-none"></textarea>
              </div>
              <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black rounded-2xl hover:from-blue-700 hover:to-indigo-800 shadow-xl transition-all active:scale-95">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default BookedAppointments;
