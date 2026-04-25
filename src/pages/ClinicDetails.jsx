import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { AuthContext } from "../context/AuthContext";
import { bookAppointment } from "../services/appointmentService";
import { useToast } from "../components/Toast";

// ── Booking Modal ─────────────────────────────────────────────────────────────
const BookingModal = ({ clinic, onClose, onSuccess }) => {
  const [form, setForm] = useState({ petName: "", date: "", time: "", reason: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const minTime = form.date === today
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
    : "00:00";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const dt = new Date(`${form.date}T${form.time}`);
    if (isNaN(dt.getTime())) { setError("Please enter a valid date and time."); return; }
    if (dt < new Date(Date.now() - 2 * 60 * 1000)) {
      setError("The selected time is in the past. Please pick a future time."); return;
    }
    setSubmitting(true);
    try {
      await bookAppointment({
        petName: form.petName,
        date: form.date,
        time: form.time,
        reason: form.reason,
        clinic: clinic._id,
        vet: clinic.provider,
        vetName: clinic.doctorName,
      });
      onSuccess(`Appointment booked at ${clinic.name}! The vet will confirm shortly.`);
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to book appointment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white/95 w-full max-w-[500px] rounded-[48px] shadow-2xl shadow-blue-900/40 overflow-hidden border border-white/40 backdrop-blur-2xl relative"
           style={{ animation: "slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        
        {/* Abstract Top Glow */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-500 opacity-20 blur-3xl pointer-events-none" />

        {/* Premium Header */}
        <div className="px-10 pt-10 pb-6 relative z-10">
          <button onClick={onClose} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-all font-black text-xl hover:rotate-90 duration-300">×</button>
          
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group hover:scale-110 transition-transform duration-500">
            <span className="text-3xl group-hover:rotate-12 transition-transform duration-500">📆</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Book Session</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-max border border-gray-200">
              Dr. {clinic.doctorName}
            </p>
          </div>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="px-10 pb-10 space-y-5 relative z-10">
          {error && (
            <div className="flex items-start gap-3 bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700 px-5 py-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm">
              <span className="text-base mt-0.5">⚠️</span> 
              <p>{error}</p>
            </div>
          )}

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Patient / Pet Name *</label>
            <input type="text" required value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              placeholder="e.g. Luna, Max..."
              className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none placeholder:text-gray-300 text-gray-900 shadow-inner" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Date *</label>
              <input type="date" required min={today} value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none text-gray-900 shadow-inner" />
            </div>
            <div className="group">
              <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Time *</label>
              <input type="time" required value={form.time} min={minTime}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none text-gray-900 shadow-inner" />
            </div>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Medical Notes / Reason *</label>
            <textarea required rows={3} value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Describe symptoms or checkup details..."
              className="w-full px-5 py-4 bg-gray-50/50 border-2 border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold outline-none placeholder:text-gray-300 resize-none text-gray-900 shadow-inner" />
          </div>

          <div className="pt-4">
            <button type="submit" disabled={submitting}
              className="relative w-full overflow-hidden group rounded-[20px] bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-[11px] h-16 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-blue-500/30">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                    Processing...
                  </>
                ) : "Confirm Booking ✓"}
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const ClinicDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [clinic, setClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/clinics/${id}`);
        setClinic(res.data);
      } catch (err) {
        console.error("Failed to fetch clinic details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinic();
  }, [id]);

  const handleBookClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setShowModal(true);
  };

  if (loading) return <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto my-20"></div>;
  if (!clinic) return <div className="text-center py-20 font-black text-gray-800">Clinic not found</div>;

  const isAvailable = clinic.isAvailable !== false;

  return (
    <div className="flex flex-col min-h-screen bg-white font-outfit">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-400">
          <Link to="/clinics" className="hover:text-blue-600 transition-colors">Clinics</Link>
          <span>/</span>
          <span className="text-gray-900">{clinic.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Info */}
          <div className="lg:col-span-8">
            <div className="relative rounded-[60px] overflow-hidden shadow-2xl mb-12 aspect-[21/9] bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center p-12 lg:p-16">
              <div className="absolute inset-0 opacity-20 filter blur-3xl pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -mt-20 -ml-20"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400 rounded-full -mb-20 -mr-20"></div>
              </div>
              <div className="relative z-10 text-center w-full">
                <span className="px-5 py-2 bg-white/10 text-white backdrop-blur-md border border-white/20 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 inline-block shadow-xl">
                  {clinic.specialization}
                </span>
                <h1 className="text-5xl lg:text-8xl font-black text-white leading-none tracking-tighter mb-4 flex items-center justify-center gap-6">
                  <span className="text-6xl opacity-50">🩺</span> {clinic.doctorName}
                </h1>
              </div>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-4xl font-black text-gray-900 mb-6 flex items-center gap-4">
                  <span className="w-12 h-1 bg-blue-600 rounded-full inline-block"></span>
                  About the Consultant
                </h2>
                <p className="text-xl font-medium text-gray-500 leading-relaxed italic border-l-8 border-blue-50 pl-10">
                  "{clinic.doctorAbout || `Dr. ${clinic.doctorName} is a highly experienced professional dedicated to providing the best pet care at ${clinic.name}.`}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 group hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-2xl">
                  <span className="text-4xl mb-4 block group-hover:scale-125 transition-transform duration-500">🏆</span>
                  <h4 className="text-2xl font-black mb-1">Clinical Success</h4>
                  <p className="font-bold opacity-60 text-sm uppercase tracking-widest">{clinic.experience} Years Experience</p>
                </div>
                <div className="p-10 bg-gray-50 rounded-[48px] border border-gray-100 group hover:bg-green-600 hover:text-white transition-all duration-500 shadow-sm hover:shadow-2xl">
                  <span className="text-4xl mb-4 block group-hover:scale-125 transition-transform duration-500">🧬</span>
                  <h4 className="text-2xl font-black mb-1">Modern Science</h4>
                  <p className="font-bold opacity-60 text-sm uppercase tracking-widest">Advanced Pet Care Technologies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 self-start sticky top-32">
            <div className="bg-slate-900 rounded-[50px] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mt-20 -mr-20 group-hover:scale-150 transition-transform duration-700"></div>

              <h3 className="text-3xl font-black mb-8 relative z-10">{clinic.name}</h3>

              {/* Availability badge */}
              <div className="mb-6 relative z-10">
                {isAvailable ? (
                  <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 text-xs font-bold uppercase rounded-full border border-green-500/30 w-fit">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse inline-block" /> Doctor Available
                  </span>
                ) : (
                  <span className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold uppercase rounded-full border border-red-500/30 w-fit">
                    <span className="h-2 w-2 bg-red-400 rounded-full inline-block" /> Currently Unavailable
                  </span>
                )}
              </div>

              <div className="space-y-8 mb-12 relative z-10">
                <div className="flex items-start gap-4">
                  <span className="text-2xl text-blue-400">📍</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Location</p>
                    <p className="font-bold leading-relaxed">{clinic.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl text-green-400">🕒</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Available Timings</p>
                    <p className="font-bold">{clinic.workingHours}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl text-purple-400">📧</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Contact Email</p>
                    <p className="font-bold">{clinic.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl text-blue-300">📞</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Contact Number</p>
                    <a href={`tel:${clinic.phone}`} className="font-bold hover:text-blue-400 transition-colors">{clinic.phone}</a>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookClick}
                disabled={!isAvailable}
                className={`block w-full py-6 rounded-[28px] text-center font-black uppercase tracking-widest text-sm transition-all shadow-xl relative z-10 ${
                  isAvailable
                    ? "bg-white text-gray-900 hover:bg-blue-600 hover:text-white hover:scale-105 shadow-blue-500/10"
                    : "bg-white/10 text-white/30 cursor-not-allowed"
                }`}
              >
                {isAvailable ? "📅 Book Appointment" : "Currently Unavailable"}
              </button>

              <p className="text-center mt-6 text-[10px] font-black uppercase tracking-[2px] text-white/30 relative z-10">
                Quick response guaranteed ⚡️
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <BookingModal
          clinic={clinic}
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => {
            toast.success(msg);
            setShowModal(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default ClinicDetails;

