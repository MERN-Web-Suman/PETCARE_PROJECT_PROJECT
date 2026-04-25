import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { bookAppointment } from "../services/appointmentService";
import API from "../services/api";

// ── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-7 py-5 rounded-2xl shadow-2xl text-white font-bold text-sm animate-slide-up ${colors[type] || colors.info}`}
      style={{ animation: "slideUp 0.35s ease" }}
    >
      <span className="text-xl">
        {type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"}
      </span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 text-lg font-black">
        ×
      </button>
    </div>
  );
};

// ── Booking Modal ────────────────────────────────────────────────────────────
const BookingModal = ({ clinic, onClose, onSuccess }) => {
  const [form, setForm] = useState({ petName: "", date: "", time: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  // Compute minimum time — if date is today, restrict to future times
  const now = new Date();
  const minTime = form.date === today
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : "00:00";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate future date/time
    const dt = new Date(`${form.date}T${form.time}`);
    if (isNaN(dt.getTime())) {
      setError("Please enter a valid date and time.");
      return;
    }
    // Allow a 2-minute grace window to avoid race conditions
    if (dt < new Date(Date.now() - 2 * 60 * 1000)) {
      setError("The selected time is in the past. Please pick a future time.");
      return;
    }

    setSubmitting(true);
    try {
      await bookAppointment({
        petName: form.petName,
        date: form.date,
        time: form.time,
        reason: form.reason,
        clinic: clinic._id,
        vet: clinic.provider,       // provider's user ID → used by dashboard filter
        vetName: clinic.doctorName, // display name for user-side list
      });
      onSuccess(`Appointment booked at ${clinic.name}! The vet will confirm shortly.`);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to book appointment. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Trap focus & close on backdrop click
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-blue-100 animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/30">
                🐾
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Book Appointment</h2>
                <p className="text-blue-100 text-xs font-bold mt-0.5 uppercase tracking-widest">
                  {clinic.name} · Dr. {clinic.doctorName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition-all font-black text-xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-bold">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Pet Name */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Pet Name *
            </label>
            <input
              type="text"
              required
              value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              placeholder="e.g. Buddy, Luna, Max…"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                min={today}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                Time *
              </label>
              <input
                type="time"
                required
                min={minTime}
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none"
              />
              {form.date === today && (
                <p className="text-[10px] text-yellow-600 font-bold mt-1 pl-1">📅 Today selected — pick a future time</p>
              )}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              Reason / Notes *
            </label>
            <textarea
              required
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe symptoms, checkup details, or special requests…"
              className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Clinic Info Pill */}
          <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <span className="text-xl">🏥</span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Clinic</p>
              <p className="font-bold text-gray-800 text-sm">{clinic.name} · {clinic.address}</p>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-3">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                Booking…
              </span>
            ) : (
              "Confirm Appointment ✓"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main ClinicList Page ─────────────────────────────────────────────────────
const ClinicList = () => {
  const { user } = useContext(AuthContext);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const res = await API.get("/clinics");
      setClinics(res.data);
    } catch (err) {
      console.error("Failed to fetch clinics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBooking = (clinic) => {
    if (!user) {
      setToast({ message: "Please log in to book an appointment.", type: "info" });
      return;
    }
    if (clinic.isAvailable === false) return;
    setSelectedClinic(clinic);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (msg) => {
    setToast({ message: msg, type: "success" });
  };

  const filtered = clinics.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      c.specialization?.toLowerCase().includes(search.toLowerCase()) ||
      c.address?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 relative overflow-hidden shadow-md mt-16 sm:mt-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-56 h-56 bg-cyan-300 opacity-20 rounded-full blur-2xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl border border-white/30">
            🏥
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4 tracking-tight drop-shadow-md">
            Veterinary Clinics
          </h1>
          <p className="text-xl opacity-90 font-light max-w-2xl text-center mb-8">
            Find expert care for your beloved companions from verified local professionals.
          </p>

          {/* Search Bar */}
          <div className="relative w-full max-w-lg">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-white/60 text-xl pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search clinics, doctors, specialties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder:text-white/50 font-bold focus:outline-none focus:ring-4 focus:ring-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Clinic Grid */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 -mt-8 relative z-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-100 rounded-full w-24 mb-6" />
                <div className="h-7 bg-gray-100 rounded-full w-3/4 mb-4" />
                <div className="space-y-3 mb-8">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-100 rounded-full" />
                  ))}
                </div>
                <div className="h-14 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center shadow-sm">
            <span className="text-6xl mb-4 block opacity-50">🏥</span>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No clinics found</h3>
            <p className="text-gray-500 text-lg">
              {search
                ? `No results for "${search}". Try a different search.`
                : "Check back later or expand your search area."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">
              {filtered.length} clinic{filtered.length !== 1 ? "s" : ""} found
            </p>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((clinic) => {
                const available = clinic.isAvailable !== false;
                return (
                  <div
                    key={clinic._id}
                    className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col h-full transform duration-300"
                  >
                    <div className="p-8 flex-1 flex flex-col">
                      {/* Status badges */}
                      <div className="flex items-center justify-between mb-6">
                        <span className="px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-full border border-blue-100">
                          Vet Clinic
                        </span>
                        {available ? (
                          <span className="flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-200">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse inline-block" />
                            Available
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 text-xs font-bold uppercase rounded-full border border-red-200">
                            <span className="h-2 w-2 bg-red-500 rounded-full inline-block" />
                            Unavailable
                          </span>
                        )}
                      </div>

                      {/* Clinic name */}
                      <h3 className="text-2xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                        {clinic.name}
                      </h3>

                      {/* Details */}
                      <div className="space-y-3 mb-8 flex-1 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <div className="flex items-center text-gray-700 font-medium">
                          <span className="w-8 text-blue-500 text-lg">👨‍⚕️</span>
                          <span className="font-bold text-gray-900">{clinic.doctorName}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="w-8 text-blue-500 text-lg">🎓</span>
                          <span>{clinic.experience} Experience</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="w-8 text-blue-500 text-lg">🔬</span>
                          <span>{clinic.specialization}</span>
                        </div>
                        <div className="flex items-center text-gray-600 text-sm">
                          <span className="w-8 text-blue-500 text-lg">🕒</span>
                          <span>{clinic.workingHours || "Contact for hours"}</span>
                        </div>
                        <div className="flex items-start text-gray-600 text-sm">
                          <span className="w-8 text-blue-500 text-lg mt-0.5">📍</span>
                          <span className="leading-snug">{clinic.address}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button
                        id={`book-btn-${clinic._id}`}
                        onClick={() => handleOpenBooking(clinic)}
                        disabled={!available}
                        className={`w-full py-4 font-black rounded-xl shadow-lg transition-all active:scale-95 ${
                          available
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-blue-500/30 hover:shadow-xl hover:-translate-y-0.5"
                            : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none"
                        }`}
                      >
                        {available ? "📅 Book Appointment" : "Currently Unavailable"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedClinic && (
        <BookingModal
          clinic={selectedClinic}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedClinic(null);
          }}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(24px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        .animate-scale-up { animation: scaleUp 0.25s ease; }
      `}</style>

      <Footer />
    </div>
  );
};

export default ClinicList;
