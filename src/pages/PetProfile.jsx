import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getPetById, deletePet } from "../services/petService";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import Toast from "../components/Toast";
import AdoptionModal from "../components/AdoptionModal";
import OutingModal from "../components/OutingModal";

const PetProfile = () => {
  const { user: authUser } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [showOutingModal, setShowOutingModal] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setLoading(true);
        const res = await getPetById(id);
        setPet(res.data);
      } catch (err) {
        setError("Could not load pet details.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPet();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-slate-50 relative"><Navbar /><div className="py-32 flex justify-center"><Loader message="Loading Pet Profile..." /></div></div>;
  if (error || !pet) return <div className="min-h-screen bg-slate-50 relative"><Navbar /><div className="py-32 text-center text-red-500 font-bold">{error || "Pet not found"}</div></div>;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5001/${imagePath}`;
  };

  // Improved list formatting to handle commas and newlines
  const formatList = (str) => {
    if (!str) return [];
    // Split by comma OR newline, then filter out empty items
    return str.split(/[,\n]/).map(item => item.trim()).filter(i => i);
  };

  const parsedVaccines = formatList(pet.vaccinations);
  const parsedMedical = formatList(pet.medicalHistory);

  // Authorization: check if current user is owner
  // Depending on population, pet.owner might be an ID string or an object with _id
  const currentUserId = authUser?.id || authUser?._id || authUser?.user?.id || authUser?.user?._id;
  const ownerId = pet.owner?._id || pet.owner;
  const isOwner = currentUserId && ownerId && String(currentUserId) === String(ownerId);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this pet profile? This action is permanent.")) return;
    
    try {
      setIsDeleting(true);
      await deletePet(id);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to delete pet. " + (err.response?.data?.message || ""));
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-outfit">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in">
        
        {/* Breadcrumb / Back Navigation */}
        <div className="mb-8">
           <button onClick={() => window.history.back()} className="flex items-center gap-2 text-gray-500 font-bold hover:text-purple-600 transition-colors group">
             <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Listings
           </button>
        </div>

        {/* Pet Header Card - Premium Colors */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 mb-10 border border-purple-100 flex flex-col md:flex-row gap-10 items-center md:items-start relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 opacity-50 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-200 via-pink-200 to-blue-200 opacity-50 rounded-full blur-3xl -mb-20 -ml-20 pointer-events-none"></div>
          
          <div className="w-56 h-56 md:w-72 md:h-72 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 border-8 border-white shadow-2xl rounded-full flex items-center justify-center flex-shrink-0 relative z-10 overflow-hidden transform hover:scale-105 transition-transform duration-500">
            {pet.image ? (
              <img src={getImageUrl(pet.image)} alt={pet.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-9xl drop-shadow-md">🐕</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10 w-full pt-6">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-lg shadow-purple-500/30">
              Registered Profile
            </div>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 tracking-tight">{pet.name}</h1>
            <p className="text-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold mb-4">{pet.breed || "Standard Breed"}</p>
            
            {pet.hasAppointment && (
              <div className="mb-6 flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full animate-pulse ${pet.status === 'Sold' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-green-500 shadow-lg shadow-green-500/50'}`}></span>
                <span className={`text-sm font-black uppercase tracking-[0.2em] ${pet.status === 'Sold' ? 'text-red-500' : 'text-green-600'}`}>
                  {pet.status === 'Sold' ? 'Adopted / Sold' : 'Available for Adoption'}
                </span>
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
              <div className="px-6 py-3 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 text-blue-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Type: {pet.type}
              </div>
              <div className="px-6 py-3 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 text-purple-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Age: {pet.age} Years
              </div>
              <div className="px-6 py-3 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 text-pink-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg hover:shadow-xl transition-all hover:scale-105">
                Weight: {pet.weight || "N/A"}
              </div>
              {!isOwner && (
                pet.status === 'Sold' ? (
                  <div className="w-full bg-red-50 border-2 border-red-200 p-6 rounded-3xl text-center">
                    <p className="text-red-600 font-black uppercase tracking-[0.2em] text-sm mb-1">Status: Adopted 🏆</p>
                    <p className="text-gray-500 font-bold text-xs italic">This pet has already found their forever home!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4 w-full">
                    <button 
                      onClick={() => {
                        if (!authUser) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          setShowAdoptionModal(true);
                        }
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-500/30 hover:scale-105 transition-all"
                    >
                      Adopt {pet.name} 🏠
                    </button>
                    <button 
                      onClick={() => {
                        if (!authUser) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          setShowOutingModal(true);
                        }
                      }}
                      className="px-8 py-4 bg-gradient-to-r from-blue-400 to-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:scale-105 transition-all"
                    >
                      Outing with {pet.name} 🌳
                    </button>
                  </div>
                )
              )}
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-purple-100 inline-block text-left w-full max-w-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 opacity-30 rounded-full blur-2xl pointer-events-none"></div>
              {isOwner && (
                <div className="absolute right-6 top-6 flex gap-3 z-10">
                   <button 
                     onClick={() => navigate(`/edit-pet/${id}`)}
                     className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-yellow-500 hover:to-orange-500 shadow-xl shadow-yellow-200/50 transition-all flex items-center gap-2 active:scale-95"
                   >
                     <span>✏️</span> Edit
                   </button>
                   <button 
                     onClick={handleDelete}
                     disabled={isDeleting}
                     className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:from-red-600 hover:to-rose-600 shadow-xl shadow-red-200/50 transition-all flex items-center gap-2 active:scale-95"
                   >
                     <span>🗑️</span> {isDeleting ? "..." : "Delete"}
                   </button>
                </div>
              )}
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Ownership Documentation</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-white p-5 rounded-2xl border-2 border-blue-100 shadow-md hover:shadow-lg transition-all">
                  <span className="text-2xl bg-gradient-to-br from-blue-100 to-blue-50 w-14 h-14 flex items-center justify-center rounded-xl shadow-sm">👤</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Owner Name</p>
                    <p className="font-bold text-gray-900">{pet.ownerName || pet.owner?.name || "Anonymous Owner"}</p>
                  </div>
                </div>
                {pet.owner?.email && (
                  <div className="flex items-center gap-4 bg-gradient-to-br from-purple-50 to-white p-5 rounded-2xl border-2 border-purple-100 shadow-md hover:shadow-lg transition-all">
                    <span className="text-2xl bg-gradient-to-br from-purple-100 to-purple-50 w-14 h-14 flex items-center justify-center rounded-xl shadow-sm">📧</span>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Contact Email</p>
                      <a href={`mailto:${pet.owner.email}`} className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:underline">{pet.owner.email}</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Premium Gradient */}
        <div className="flex flex-wrap gap-3 mb-10 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-3 rounded-3xl border-2 border-purple-200 shadow-xl max-w-2xl mx-auto md:mx-0">
          {[
            { id: 'profile', label: 'Summary', icon: '📝' },
            { id: 'medical', label: 'Health Record', icon: '🏥' },
            { id: 'appointments', label: 'Schedule', icon: '📅' }
          ].map(tab => (
            <button 
              key={tab.id}
              className={`flex-1 min-w-[140px] px-6 py-4 font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50 transform scale-[1.05]' 
                  : 'text-gray-500 hover:text-purple-600 hover:bg-white/70'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="text-xl">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-fade-in">
              <div className="lg:col-span-2 space-y-10">
                <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-purple-100 p-10">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-10 flex items-center gap-4">
                    <span className="p-2 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl">📋</span> Physical & Registry Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {[
                      { label: "Date of Birth", value: pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not recorded", gradient: "from-blue-50 to-blue-100", border: "border-blue-200" },
                      { label: "Identification (Microchip)", value: pet.microchipId || "No chip registered", gradient: "from-purple-50 to-purple-100", border: "border-purple-200" },
                      { label: "Primary Color", value: pet.color || "Multi-tone", gradient: "from-pink-50 to-pink-100", border: "border-pink-200" },
                      { label: "Registry Breed", value: pet.breed || "Standard", gradient: "from-indigo-50 to-indigo-100", border: "border-indigo-200" }
                    ].map((item, idx) => (
                      <div key={idx} className={`bg-gradient-to-br ${item.gradient} p-8 rounded-3xl border-2 ${item.border} hover:shadow-xl transition-all group hover:scale-105`}>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-purple-600">{item.label}</label>
                        <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
        
              <div className="lg:col-span-1">
                <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-purple-100 p-10 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-pink-100 opacity-50 rounded-full blur-2xl pointer-events-none"></div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 flex items-center gap-4 relative z-10">
                    <span className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">📖</span> About {pet.name}
                  </h2>
                  <div className="relative z-10">
                    <span className="absolute -top-6 -left-4 text-7xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent font-serif">"</span>
                    <p className="text-gray-600 font-bold text-xl leading-relaxed italic relative z-10 pt-4 px-2">
                       {pet.description || `${pet.name} is a wonderful companion waiting to be discovered.`}
                    </p>
                    <span className="absolute -bottom-8 -right-4 text-7xl bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent font-serif">"</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'medical' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-green-100 p-10">
                <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-10 flex items-center gap-4">
                  <span className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">💉</span> Vaccination Log
                </h2>
                <div className="space-y-6">
                  {parsedVaccines.length > 0 ? parsedVaccines.map((vac, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-3xl p-6 flex items-center gap-6 group hover:border-green-400 transition-all hover:translate-x-2 hover:shadow-lg">
                      <div className="w-14 h-14 bg-white rounded-[1.25rem] shadow-md flex flex-shrink-0 items-center justify-center text-green-600 font-black text-2xl border-2 border-green-100">
                        V
                      </div>
                      <div className="font-black text-gray-900 text-xl tracking-tight">{vac}</div>
                    </div>
                  )) : (
                    <div className="text-gray-400 font-extrabold italic py-12 text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-dashed border-green-200">No records on file</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-blue-100 p-10">
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-10 flex items-center gap-4">
                  <span className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">🩺</span> Medical Observations
                </h2>
                <div className="space-y-8">
                  {parsedMedical.length > 0 ? parsedMedical.map((record, idx) => (
                    <div key={idx} className="relative pl-10 border-l-4 border-blue-300 py-2 group hover:border-blue-500 transition-colors">
                      <div className="absolute -left-[14px] top-4 w-6 h-6 bg-white border-4 border-blue-400 rounded-full group-hover:scale-125 transition-transform group-hover:bg-blue-500"></div>
                      <p className="text-gray-700 font-bold text-lg bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-3xl border-2 border-blue-200 group-hover:bg-white group-hover:shadow-lg transition-all leading-loose tracking-wide">{record}</p>
                    </div>
                  )) : (
                    <div className="text-gray-400 font-extrabold italic py-12 text-center bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border-2 border-dashed border-blue-200">Clean health summary</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="bg-white rounded-[2.5rem] shadow-xl border-2 border-purple-100 p-12 max-w-4xl mx-auto animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 opacity-50 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-12 text-center relative z-10">Upcoming Health Checks</h2>
              
              {pet.nextAppointment ? (
                  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group z-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mt-20 -mr-20 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                      <div className="text-center md:text-left">
                        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-2xl font-black text-lg mb-6 inline-block">
                          📅 {new Date(pet.nextAppointment).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                        <h4 className="font-black text-4xl mb-2 tracking-tight">Main Checkup</h4>
                        <p className="text-blue-100 font-bold text-lg italic opacity-80">Regularly scheduled veterinary assessment</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 flex flex-col items-center">
                        <span className="text-[10px] font-black text-purple-200 uppercase tracking-[0.2em] mb-3">Time Schedule</span>
                        <span className="text-5xl font-black">{new Date(pet.nextAppointment).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
              ) : (
                <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-4 border-dashed border-purple-200 rounded-[2.5rem] p-20 text-center flex flex-col items-center relative z-10">
                  <span className="text-8xl mb-6 grayscale opacity-30 drop-shadow-sm">🗓️</span>
                  <p className="text-3xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">No health checks scheduled</p>
                  <p className="text-gray-400 font-extrabold max-w-sm mb-8">Maintain {pet.name}'s peak health with regular checkups.</p>
                  <button 
                    onClick={() => {
                      if (!authUser) {
                        navigate("/login", { state: { from: location } });
                      } else {
                        navigate("/appointments");
                      }
                    }}
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all"
                  >
                    Schedule Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
      {showAdoptionModal && (
        <AdoptionModal 
          pet={pet} 
          onClose={() => setShowAdoptionModal(null)} 
          onSuccess={() => setToast({ message: "Adoption request sent successfully!", type: "success" })}
        />
      )}
      {showOutingModal && (
        <OutingModal 
          pet={pet} 
          onClose={() => setShowOutingModal(null)} 
          onSuccess={() => setToast({ message: "Outing request sent successfully!", type: "success" })}
        />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PetProfile;
