import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { useToast } from "../components/Toast";

const SOS = () => {
  const [sosActive, setSosActive] = useState(false);
  const [sosData, setSosData] = useState({
    emergencyType: "",
    petName: "",
    petContactNumber: "",
    description: "",
    location: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const emergencyTypes = [
    { value: "injury", label: "🩹 Pet Injury", icon: "🩹" },
    { value: "lost", label: "❌ Pet Lost", icon: "❌" },
    { value: "poisoning", label: "☠️ Poisoning", icon: "☠️" },
    { value: "accident", label: "🚗 Accident", icon: "🚗" },
    { value: "allergic", label: "🤧 Allergic Reaction", icon: "🤧" },
    { value: "other", label: "🆘 Other Emergency", icon: "🆘" }
  ];

  const handleSOS = (type) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setSosData({ ...sosData, emergencyType: type });
    setSosActive(true);
  };

  const handleSubmit = async () => {
    if (!sosData.petName || !sosData.location || !sosData.petContactNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      const payload = {
        ...sosData,
        author: user?._id || user?.id || user?.user?._id || user?.user?.id
      };
      
      await axios.post("http://localhost:5001/api/sos", payload);
      
      setSubmitted(true);
      toast.success("SOS Alert Broadcasted! 🚨 Help is on the way.");
      setTimeout(() => {
        setSosActive(false);
        setSosData({ emergencyType: "", petName: "", petContactNumber: "", description: "", location: "" });
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to send SOS:", err);
      toast.error("Failed to send emergency alert. Please call emergency services.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      
      {/* Emergency Header */}
      <div className="bg-gradient-primary text-white py-12 sm:py-20 px-4 relative overflow-hidden shadow-lg border-b border-white/10">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-10"></div>
          <div className="absolute top-10 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-red-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center px-4">
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-red-500 border-4 border-white/30 rounded-full flex items-center justify-center text-5xl sm:text-6xl mb-6 shadow-2xl animate-bounce">
            🚨
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-4 tracking-tight drop-shadow-lg text-white leading-tight">Emergency SOS</h1>
          <p className="text-base sm:text-xl opacity-90 font-bold max-w-2xl text-center leading-relaxed">
            Quick access to critical pet care when every second counts. Help is just a click away!
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 w-full animate-fade-in relative z-20">

        {sosActive ? (
          <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-12 mb-12 border-2 border-red-500 transform origin-top animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 to-red-700"></div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="text-red-500">📍</span> Emergency Report
            </h2>
            
            <div className="space-y-6 sm:space-y-8">
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-6 flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-sm">
                  {emergencyTypes.find(t => t.value === sosData.emergencyType)?.icon}
                </div>
                <div>
                  <h3 className="font-black text-red-800 uppercase tracking-widest text-[10px] sm:text-xs mb-1">Emergency Type</h3>
                  <p className="text-lg sm:text-2xl font-black text-red-600 leading-tight">{emergencyTypes.find(t => t.value === sosData.emergencyType)?.label}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <label className="block font-black text-gray-700 text-sm mb-2 uppercase tracking-wide">Pet Name *</label>
                  <input
                    type="text"
                    placeholder="Your pet's name"
                    value={sosData.petName}
                    onChange={(e) => setSosData({...sosData, petName: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 font-bold transition-all text-base sm:text-lg shadow-inner"
                  />
                </div>
                <div>
                  <label className="block font-black text-gray-700 text-sm mb-2 uppercase tracking-wide">Contact Number *</label>
                  <input
                    type="tel"
                    placeholder="Emergency phone"
                    value={sosData.petContactNumber}
                    onChange={(e) => setSosData({...sosData, petContactNumber: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 font-bold transition-all text-base sm:text-lg shadow-inner"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-black text-gray-700 text-sm mb-2 uppercase tracking-wide">Current Location *</label>
                  <input
                    type="text"
                    placeholder="Where are you right now?"
                    value={sosData.location}
                    onChange={(e) => setSosData({...sosData, location: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 font-bold transition-all text-base sm:text-lg shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block font-black text-gray-700 text-sm mb-2 uppercase tracking-wide">Describe Situation</label>
                <textarea
                  placeholder="Provide urgent details..."
                  value={sosData.description}
                  onChange={(e) => setSosData({...sosData, description: e.target.value})}
                  rows="3"
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-red-500/20 focus:border-red-500 resize-none font-medium transition-all text-base sm:text-lg shadow-inner"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end pt-6 border-t border-gray-100">
                <button 
                  className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-black hover:bg-gray-200 transition-all w-full sm:w-auto active:scale-95" 
                  onClick={() => setSosActive(false)}
                >
                  Cancel
                </button>
                <button 
                  className="px-10 py-4 bg-red-600 text-white rounded-xl font-black text-lg hover:bg-black hover:shadow-2xl transition-all w-full sm:w-auto disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
                  onClick={handleSubmit}
                  disabled={submitted}
                >
                  {submitted ? (
                    <><span>✅</span> Alert Sent!</>
                  ) : (
                    <><span>🚨</span> Broadcast SOS</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-12 sm:mb-20">
            <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 bg-clip-text text-transparent text-center mb-8 sm:mb-12 tracking-tight">Select Emergency Type</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
              {emergencyTypes.map(type => (
                <button
                  key={type.value}
                  className="group flex flex-col items-center gap-4 p-8 sm:p-10 bg-gradient-to-br from-white via-red-50 to-white border-2 border-red-100 shadow-xl rounded-[32px] hover:border-red-500 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
                  onClick={() => handleSOS(type.value)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-6xl sm:text-7xl relative z-10 group-hover:scale-110 transition-transform duration-500 drop-shadow-md">{type.icon}</span>
                  <span className="font-black text-gray-800 text-xl sm:text-2xl relative z-10 tracking-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contacts Grid - Premium Design */}
        <div className="bg-gradient-to-br from-white via-red-50 to-pink-50 rounded-[40px] shadow-2xl p-6 sm:p-12 mb-12 border-2 border-red-100 flex flex-col items-center sm:items-stretch relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-red-200 to-orange-200 opacity-40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-200 to-red-200 opacity-40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="flex items-center gap-4 mb-10 w-full relative z-10">
            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-2xl shadow-lg">📞</div>
            <h2 className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-red-600 via-orange-600 to-pink-600 bg-clip-text text-transparent tracking-tight">Emergency Contacts</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 w-full relative z-10">
            {[
              { title: "Pet Hospital", desc: "Emergency Line", link: "tel:1-800-PET-HELP", label: "Call Now", icon: "🏥", gradient: "from-blue-500 to-cyan-500" },
              { title: "Ambulance", desc: "Emergency Transport", link: "tel:911", label: "Call Now", icon: "🚑", gradient: "from-red-500 to-rose-500" },
              { title: "Poison Center", desc: "Pet Poison Hotline", link: "tel:1-855-764-7661", label: "Call Now", icon: "☠️", gradient: "from-purple-500 to-pink-500" },
              { title: "Nearby Vets", desc: "Emergency Search", action: true, label: "Explore", icon: "🐾", gradient: "from-orange-500 to-amber-500" }
            ].map((contact, idx) => (
              <div key={idx} className={`bg-white border-2 border-gray-100 rounded-[32px] p-8 text-center hover:shadow-2xl hover:-translate-y-1 transition-all relative overflow-hidden group shadow-xl`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${contact.gradient} opacity-20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10">
                  <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${contact.gradient} rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg text-white`}>{contact.icon}</div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{contact.title}</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-6">{contact.desc}</p>
                  
                  {contact.action ? (
                    <button 
                      onClick={() => navigate("/clinics")}
                      className="w-full py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-2xl font-black text-sm hover:from-gray-900 hover:to-black transition-all shadow-lg active:scale-95"
                    >
                      {contact.label}
                    </button>
                  ) : (
                    <a href={contact.link} className={`block w-full py-4 bg-gradient-to-r ${contact.gradient} text-white rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg active:scale-95`}>
                      {contact.label}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* First Aid Checklist */}
        <div className="bg-yellow-400 rounded-[40px] shadow-2xl p-8 sm:p-12 border border-yellow-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-20 rounded-full blur-3xl -mt-20 -mr-20 animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-3 bg-white/30 text-yellow-900 rounded-2xl backdrop-blur-md">📋</div>
              <h2 className="text-2xl sm:text-4xl font-black text-yellow-950 tracking-tight">Emergency Checklist</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: "📁", text: "Medical records accessible" },
                { icon: "💊", text: "Current medications list" },
                { icon: "📍", text: "Nearest 24/7 ER Vet saved" },
                { icon: "🩹", text: "First aid kit stocked" },
                { icon: "📸", text: "ID photos ready" },
                { icon: "💧", text: "Clean water available" }
              ].map((tip, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-white/10 p-5 rounded-2xl border border-white/20 backdrop-blur-xl group-hover:bg-white/20 transition-all">
                  <span className="text-2xl bg-white/20 w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0">{tip.icon}</span>
                  <span className="text-yellow-950 font-black text-sm sm:text-base leading-tight">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
      <Footer />
    </div>
  );
};

export default SOS;
