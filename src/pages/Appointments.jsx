import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAppointments,
  updateAppointment,
  cancelAppointment,
} from "../services/appointmentService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

// ── Edit Appointment Modal ────────────────────────────────────────────────────
const EditModal = ({ appointment, onClose, onSave }) => {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    petName: appointment.petName || "",
    date: appointment.date ? new Date(appointment.date).toISOString().split("T")[0] : "",
    time: appointment.time || "",
    reason: appointment.reason || "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (form.date && form.time) {
      const dt = new Date(`${form.date}T${form.time}`);
      if (dt < new Date()) { setErr("Cannot set appointment in the past."); return; }
    }
    setSaving(true);
    try {
      await updateAppointment(appointment._id, form);
      onSave("Appointment updated successfully ✓");
      onClose();
    } catch (e) {
      setErr(e?.response?.data?.msg || e?.response?.data?.message || e.message || "Failed to update appointment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white/95 w-full max-w-[500px] rounded-[48px] shadow-2xl shadow-yellow-900/40 overflow-hidden border border-white/40 backdrop-blur-2xl relative"
           style={{ animation: "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        
        {/* Abstract Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 opacity-20 blur-3xl pointer-events-none" />

        {/* Premium Header */}
        <div className="px-10 pt-10 pb-6 relative z-10">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-all font-black text-xl hover:rotate-90 duration-300">×</button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30 mb-6 group hover:scale-110 transition-transform duration-500">
            <span className="text-3xl group-hover:rotate-12 transition-transform duration-500">✏️</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Edit Session</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-max border border-gray-200">
              Patient: {appointment.petName}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5 relative z-10">
          {err && (
            <div className="flex items-start gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-5 py-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm">
              <span className="text-base mt-0.5">⚠️</span> 
              <p>{err}</p>
            </div>
          )}

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Patient / Pet Name *</label>
            <input type="text" required value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all font-bold outline-none text-gray-900 shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Date *</label>
              <input type="date" required min={today} value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all font-bold outline-none text-gray-900 shadow-inner" />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Time *</label>
              <input type="time" required value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all font-bold outline-none text-gray-900 shadow-inner" />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-orange-500 transition-colors">Reason / Notes *</label>
            <textarea required rows={3} value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Update your visit reason or notes…"
              className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-400/10 transition-all font-bold outline-none resize-none placeholder:text-gray-300 text-gray-900 shadow-inner" />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose}
              className="flex-1 py-4 bg-gray-100/50 text-gray-600 rounded-[20px] font-black uppercase tracking-[0.15em] text-[11px] hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="relative flex-1 overflow-hidden group rounded-[20px] bg-gray-900 text-white font-black uppercase tracking-[0.15em] text-[11px] h-14 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-orange-500/30">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-yellow-500 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    Saving...
                  </>
                ) : "Save Changes ✓"}
              </span>
            </button>
          </div>
        </form>

        <style>{`
          @keyframes slideUpFade {
            0% { transform: translateY(40px) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
};

// ── Confirm Cancel Modal ──────────────────────────────────────────────────────
const ConfirmModal = ({ petName, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
       onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl p-8 text-center border border-red-100"
         style={{ animation: "scaleUp 0.25s ease" }}>
      <div className="text-5xl mb-4">🗑️</div>
      <h3 className="text-xl font-black text-gray-900 mb-2">Cancel Appointment?</h3>
      <p className="text-gray-500 font-medium mb-8">
        Are you sure you want to cancel the appointment for <strong>{petName}</strong>? This cannot be undone.
      </p>
      <div className="flex gap-4">
        <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all">Keep It</button>
        <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-black hover:bg-red-600 transition-all">Yes, Cancel</button>
      </div>
      <style>{`@keyframes scaleUp{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
    </div>
  </div>
);

// ── Main Appointments Page ────────────────────────────────────────────────────
const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [editTarget, setEditTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await getAppointments();
      setAppointments(res.data || []);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  // ── Cancel appointment ────────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    const id = cancelTarget._id;
    setCancelTarget(null);
    try {
      await cancelAppointment(id);
      fetchAppointments();
      toast.success("Appointment cancelled.");
    } catch (err) {
      const msg = err?.response?.data?.msg || err?.response?.data?.message || err.message || "Failed to cancel appointment";
      toast.error(msg);
    }
  };

  // ── Status theme map ──────────────────────────────────────────────────────
  const getStatusTheme = (status) => {
    const map = {
      confirmed: { badge: "bg-green-500",  bar: "bg-green-500"  },
      pending:   { badge: "bg-orange-500", bar: "bg-orange-500" },
      completed: { badge: "bg-blue-500",   bar: "bg-blue-500"   },
      rejected:  { badge: "bg-red-500",    bar: "bg-red-500"    },
      cancelled: { badge: "bg-gray-400",   bar: "bg-gray-400"   },
    };
    return map[status] || map.cancelled;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 relative overflow-hidden shadow-md">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-cyan-300 opacity-20 rounded-full blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl border border-white/30">
            📅
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            My Appointments
          </h1>
          <p className="text-xl opacity-90 font-light max-w-2xl text-center mb-8">
            Track your pet's upcoming clinic visits and vet replies.
          </p>
          {/* Link to clinics — only place to book */}
          <Link
            to="/clinics"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 rounded-full font-bold hover:bg-gray-50 hover:scale-105 shadow-xl transition-all duration-300"
          >
            🏥 Find &amp; Book a Clinic
          </Link>
        </div>
      </div>

      {/* Appointments List */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full -mt-8 relative z-20">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader message="Loading your appointments…" />
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.length > 0 ? (
              appointments.map((apt) => {
                const theme = getStatusTheme(apt.status);
                const isPending = apt.status === "pending";
                return (
                  <div
                    key={apt._id}
                    className="bg-white rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 relative overflow-hidden flex flex-col md:flex-row"
                  >
                    {/* Status colour bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-3 ${theme.bar} rounded-l-3xl`} />

                    <div className="p-8 pl-12 flex-1 relative">
                      {/* BG watermark */}
                      <div className="absolute right-10 top-1/2 -translate-y-1/2 text-8xl opacity-5 pointer-events-none select-none">🏥</div>

                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className={`px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider ${theme.badge}`}>
                              {apt.status?.toUpperCase() || "UNKNOWN"}
                            </span>
                            <span className="text-gray-400 font-bold text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                              {new Date(apt.date).toLocaleDateString()} at {apt.time}
                            </span>
                          </div>
                          <h3 className="text-3xl font-extrabold text-gray-800 mb-2">
                            {apt.petName || apt.pet?.name}
                          </h3>
                          <p className="text-lg font-semibold text-gray-600 flex items-center gap-2">
                            <span className="text-indigo-500">👨‍⚕️</span>
                            Dr. {apt.vetName || apt.vet?.name || "—"}
                          </p>
                        </div>

                        {/* Edit / Cancel — only while pending */}
                        {isPending && (
                          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                            <button
                              onClick={() => setEditTarget(apt)}
                              className="flex-1 md:flex-none px-6 py-2.5 bg-yellow-100 text-yellow-700 hover:bg-yellow-500 hover:text-white border border-yellow-200 hover:border-transparent rounded-xl font-bold transition-colors"
                            >
                              ✏️ Edit Details
                            </button>
                            <button
                              onClick={() => setCancelTarget(apt)}
                              className="flex-1 md:flex-none px-6 py-2.5 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white border border-red-100 hover:border-transparent rounded-xl font-bold transition-colors"
                            >
                              🗑️ Cancel
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reason */}
                      <div className="mt-6 pt-6 border-t border-gray-100 relative z-10">
                        <h4 className="font-bold text-gray-800 mb-2">Reason for Visit</h4>
                        <p className="text-gray-600 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
                          {apt.reason || "—"}
                        </p>
                      </div>

                      {/* Doctor's Reply */}
                      {apt.doctorReply && (
                        <div className="mt-4 relative z-10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse inline-block" />
                            <h4 className="font-black text-emerald-700 text-sm uppercase tracking-widest">
                              💬 Clinic Messages
                            </h4>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Meta Info: Room & Location */}
                              {(apt.roomNumber || apt.replyLocation) && (
                                <div className="flex flex-col gap-4 min-w-[180px]">
                                  {apt.roomNumber && (
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-lg border border-emerald-100">🚪</div>
                                      <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Room</p>
                                        <p className="font-bold text-gray-800">{apt.roomNumber}</p>
                                      </div>
                                    </div>
                                  )}
                                  {apt.replyLocation && (
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-lg border border-emerald-100">📍</div>
                                      <div>
                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Location</p>
                                        <p className="font-bold text-gray-800">{apt.replyLocation}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Main Description */}
                              <div className="flex-1 pt-1">
                                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                  <span>👤</span> Message from Dr. {apt.vetName || apt.vet?.name || "Your Vet"}:
                                </p>
                                <p className="text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                                  {apt.doctorReply}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-16 text-center shadow-sm">
                <div className="text-6xl mb-6 opacity-50">📆</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Appointments Yet</h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                  Browse our verified vet clinics and book your first appointment in seconds.
                </p>
                <Link
                  to="/clinics"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-full font-bold hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                  🏥 Browse Clinics
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          appointment={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(msg) => { toast.success(msg); fetchAppointments(); }}
        />
      )}

      <Footer />
    </div>
  );
};

export default Appointments;
