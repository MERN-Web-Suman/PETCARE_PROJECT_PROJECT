import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PetCard from "../components/PetCard";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import AdoptionModal from "../components/AdoptionModal";
import OutingModal from "../components/OutingModal";
import Toast from "../components/Toast";
import { useNavigate, useLocation } from "react-router-dom";
import { getPets, updatePetStatus } from "../services/petService";
import { getSavedPets, toggleSavePet } from "../services/profileService";

const TYPING_PHRASES = [
  "Find Your Perfect Pet Companion 🐶",
  "Adopt, Don't Shop ❤️",
  "Give a Pet a Loving Home 🏡",
];

const Adoption = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState([]);

  // Typewriter state
  const [displayed, setDisplayed] = useState("");
  const typingRef = useRef(null);
  const phraseIndex = useRef(0);

  const { user } = useContext(AuthContext);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPet, setSelectedPet] = useState(null);
  const [outingPet, setOutingPet] = useState(null);
  const [toast, setToast] = useState(null);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const res = await getPets();
      setPets(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load adoption listings.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSaved = async () => {
    try {
      const res = await getSavedPets();
      const savedIds = res.data.map(p => p._id || p);
      setSaved(savedIds);
    } catch (err) {
      console.error("Failed to fetch saved pets:", err);
    }
  };

  // Multi-phrase typewriter: type → pause → erase → next phrase → repeat
  useEffect(() => {
    let i = 0;
    let erasing = false;

    const tick = () => {
      const current = TYPING_PHRASES[phraseIndex.current];

      if (!erasing) {
        i++;
        setDisplayed(current.slice(0, i));
        if (i === current.length) {
          erasing = true;
          typingRef.current = setTimeout(tick, 2000); // pause before erase
          return;
        }
      } else {
        i--;
        setDisplayed(current.slice(0, i));
        if (i === 0) {
          erasing = false;
          phraseIndex.current = (phraseIndex.current + 1) % TYPING_PHRASES.length;
          typingRef.current = setTimeout(tick, 500); // brief pause before next phrase
          return;
        }
      }
      typingRef.current = setTimeout(tick, erasing ? 35 : 65);
    };

    typingRef.current = setTimeout(tick, 500);
    return () => clearTimeout(typingRef.current);
  }, []);

  useEffect(() => {
    fetchPets();
    if (user) fetchUserSaved();
  }, [user]);

  const filteredPets = pets.filter(p => {
    const matchesFilter = filter === "all" || p.type === filter;
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.breed?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleSave = async (petId) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    
    try {
      // Optimistic UI update
      const isCurrentlySaved = saved.includes(petId);
      if (isCurrentlySaved) {
        setSaved(saved.filter(id => id !== petId));
      } else {
        setSaved([...saved, petId]);
      }

      await toggleSavePet(petId);
    } catch (err) {
      console.error("Failed to toggle save:", err);
      // Revert on error
      fetchUserSaved();
    }
  };

  return (
    <>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .typing-cursor { display: inline-block; width: 3px; height: 1em; background: currentColor; margin-left: 3px; vertical-align: text-bottom; border-radius: 2px; animation: blink 0.85s step-start infinite; }
      `}</style>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-outfit">
        <Navbar />
        
        {/* Animated Hero Section */}
        <div className="relative bg-gradient-primary text-white py-12 sm:py-20 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-pink-300 opacity-20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-6 min-h-[5rem] sm:min-h-[4rem] tracking-tight leading-[1.2]">
              {displayed}<span className="typing-cursor text-yellow-300" />
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl opacity-90 font-light max-w-2xl mx-auto leading-relaxed">
              Give a loving home to a pet in need. Adoption saves lives and brings endless joy to your family!
            </p>
          </div>
        </div>

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full animate-fade-in -mt-6 sm:-mt-8 relative z-20">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6 mb-8 sm:mb-12 bg-white p-3 sm:p-4 rounded-2xl shadow-lg border border-gray-100 backdrop-blur-lg bg-opacity-90">
            
            <div className="relative flex-1 group w-full">
              <span className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary-500 transition-colors">🔍</span>
              <input
                type="text"
                placeholder="Search by name or breed..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-bold text-sm sm:text-base placeholder:text-gray-400"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 w-full md:w-auto">
              <button 
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 ${filter === 'all' ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 scale-105' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-primary-200 hover:text-primary-600'}`}
                onClick={() => setFilter('all')}
              >
                All Pets
              </button>
              <button 
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 ${filter === 'dog' ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 scale-105' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-primary-200 hover:text-primary-600'}`}
                onClick={() => setFilter('dog')}
              >
                🐕 Dogs <span className="hidden sm:inline ml-1 opacity-70">({pets.filter(p => p.type === 'dog').length})</span>
              </button>
              <button 
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all duration-300 ${filter === 'cat' ? 'bg-gradient-primary text-white shadow-lg shadow-primary-500/30 scale-105' : 'bg-gray-50 text-gray-500 border border-gray-100 hover:border-primary-200 hover:text-primary-600'}`}
                onClick={() => setFilter('cat')}
              >
                🐱 Cats <span className="hidden sm:inline ml-1 opacity-70">({pets.filter(p => p.type === 'cat').length})</span>
              </button>
              
              <div className="flex items-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-600 rounded-xl font-black border border-pink-100 text-xs sm:text-sm shadow-sm whitespace-nowrap ml-auto sm:ml-0">
                <span className="text-lg">❤️</span> <span className="sm:inline hidden">Saved:</span> {saved.length}
              </div>
            </div>
          </div>

          {/* Pets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {loading ? (
              <div className="col-span-full py-20 flex justify-center text-center">
                <Loader message="Finding pets looking for homes..." />
              </div>
            ) : error ? (
              <div className="col-span-full py-12 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 font-medium p-4">{error}</div>
            ) : filteredPets.length > 0 ? (
              filteredPets.map(pet => (
                <div key={pet._id} className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col hover:-translate-y-2">
                  <div className="flex-1">
                    <PetCard
                      pet={pet}
                      onClick={() => {
                        if (!user) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          navigate(`/pet/${pet._id}`);
                        }
                      }}
                      actionBtn={{
                        label: saved.includes(pet._id) ? "❤️ Saved" : "Save",
                        onAdopt: () => {
                          if (!user) {
                            navigate("/login", { state: { from: location } });
                          } else {
                            setSelectedPet(pet);
                          }
                        },
                        onOuting: () => {
                          if (!user) {
                            navigate("/login", { state: { from: location } });
                          } else {
                            setOutingPet(pet);
                          }
                        },
                        isOwner: user && (pet.owner?._id === user.id || pet.owner === user.id),
                        onStatusToggle: async (id, status) => {
                          try {
                            await updatePetStatus(id, status);
                            setPets(prev => prev.map(p => p._id === id ? { ...p, status } : p));
                            setToast({ message: `Pet marked as ${status}!`, type: "success" });
                          } catch (err) {
                            setToast({ message: "Failed to update status", type: "error" });
                          }
                        },
                        onClick: () => toggleSave(pet._id)
                      }}
                    />
                  </div>
                  <div className="p-4 pt-0 border-t border-gray-100 mt-2 bg-gray-50/50">
                    <button 
                      className="w-full bg-white border-2 border-primary-500 text-primary-600 py-3 rounded-xl font-bold hover:bg-primary-500 hover:text-white transition-colors duration-300 shadow-sm"
                      onClick={() => {
                        if (!user) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          navigate(`/pet/${pet._id}`);
                        }
                      }}
                    >
                      View Full Details &rarr;
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
                <div className="text-6xl mb-4 opacity-50">🐾</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No pets found</h3>
                <p className="text-gray-500 text-lg">No pets available for adoption right now. Please check back later!</p>
              </div>
            )}
          </div>

          {/* Educational Cards - Premium Colors */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-8 text-center tracking-tight">Why Adopt?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Saves Lives", desc: "Every adoption frees up shelter space for another animal in need.", icon: "❤️", gradient: "from-pink-500 to-rose-500", bgGradient: "from-pink-50 to-rose-50", shadow: "shadow-pink-500/30" },
                { title: "Cost Effective", desc: "Adoption fees are much lower and usually cover initial medical care.", icon: "💰", gradient: "from-green-500 to-emerald-500", bgGradient: "from-green-50 to-emerald-50", shadow: "shadow-green-500/30" },
                { title: "Healthy Pets", desc: "Adopted pets are usually already vaccinated, microchipped, and neutered.", icon: "🏥", gradient: "from-blue-500 to-cyan-500", bgGradient: "from-blue-50 to-cyan-50", shadow: "shadow-blue-500/30" }
              ].map((benefit, idx) => (
                <div key={idx} className={`bg-white rounded-[2rem] shadow-xl ${benefit.shadow} p-8 text-center border-2 border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl group overflow-hidden relative`}>
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.bgGradient} opacity-30 rounded-full blur-2xl pointer-events-none`}></div>
                  <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${benefit.gradient} text-white rounded-2xl flex items-center justify-center text-4xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg ${benefit.shadow}`}>
                    {benefit.icon}
                  </div>
                  <h3 className={`text-2xl font-black bg-gradient-to-r ${benefit.gradient} bg-clip-text text-transparent mb-3`}>{benefit.title}</h3>
                  <p className="text-gray-600 font-semibold leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
        {selectedPet && (
          <AdoptionModal 
            pet={selectedPet} 
            onClose={() => setSelectedPet(null)} 
            onSuccess={() => setToast({ message: "Adoption request sent successfully!", type: "success" })}
          />
        )}
        {outingPet && (
          <OutingModal 
            pet={outingPet} 
            onClose={() => setOutingPet(null)} 
            onSuccess={() => setToast({ message: "Outing request sent successfully!", type: "success" })}
          />
        )}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
};

export default Adoption;
