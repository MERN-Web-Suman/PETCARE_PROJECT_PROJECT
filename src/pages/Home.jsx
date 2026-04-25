import { useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getPets, updatePetStatus } from "../services/petService";
import { AuthContext } from "../context/AuthContext";
import PetCard from "../components/PetCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { TypeAnimation } from 'react-type-animation';
import AdoptionModal from "../components/AdoptionModal";
import OutingModal from "../components/OutingModal";
import Toast from "../components/Toast";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState({ city: "", state: "" });
  const [selectedPet, setSelectedPet] = useState(null);
  const [outingPet, setOutingPet] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLocation = async () => {
      // Primary: GeoJS (No rate limits, fast)
      try {
        const res1 = await fetch("https://get.geojs.io/v1/ip/geo.json");
        if (res1.ok) {
          const data1 = await res1.json();
          if (data1.city && data1.region && isMounted) {
            setUserLocation({ city: data1.city, state: data1.region });
            return;
          }
        }
      } catch (e) { console.warn("GeoJS failed", e); }

      // Secondary: IP-API (Generous allowance, works on localhost)
      try {
        const res2 = await fetch("http://ip-api.com/json");
        if (res2.ok) {
          const data2 = await res2.json();
          if (data2.status === "success" && data2.city && data2.regionName && isMounted) {
            setUserLocation({ city: data2.city, state: data2.regionName });
            return;
          }
        }
      } catch (e) { console.warn("IP-API failed", e); }

      // Tertiary: ipapi.co (What was initially used)
      try {
        const res3 = await fetch("https://ipapi.co/json/");
        if (res3.ok) {
          const data3 = await res3.json();
          if (data3.city && data3.region && !data3.error && isMounted) {
            setUserLocation({ city: data3.city, state: data3.region });
            return;
          }
        }
      } catch (e) { console.warn("ipapi.co failed", e); }

      // Final fail-safe: Prevent infinite "Detecting..." hang
      if (isMounted) {
        setUserLocation({ city: "Remote", state: "Connection" });
      }
    };

    fetchLocation();
    fetchPets();

    return () => { isMounted = false; };
  }, [user]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const ownerId = user?.user?._id || user?.id;
      const res = await getPets(ownerId ? { owner: ownerId } : {});
      setPets(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load pets. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPets = pets.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || p.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          display: flex;
          width: 200%;
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in text-gray-800">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-primary text-white rounded-[24px] sm:rounded-[40px] p-6 sm:p-12 lg:p-20 mb-8 sm:mb-12 shadow-2xl overflow-hidden group">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 sm:w-96 h-64 sm:h-96 bg-white opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-700"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 sm:w-64 h-48 sm:h-64 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-700"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
            <div className="max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 sm:mb-8 animate-bounce">
                <span className="text-lg sm:text-xl">🐶</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-yellow-300">Your Pet's Best Friend</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight min-h-[100px] sm:min-h-[140px]">
                <TypeAnimation
                  sequence={[
                    '🐾 Welcome to PetCare',
                    2000,
                    '🐾 Your Vet, One Click Away',
                    2000,
                    '🐾 Loving Care for Every Pet',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </h1>

              <p className="text-base sm:text-xl lg:text-2xl opacity-90 font-light mb-8 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed text-indigo-100">
                The complete pet care solution tailored for your family.
                Experience premium services with a personal touch.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 sm:gap-4">
                <button 
                  onClick={() => document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 bg-white text-primary-700 rounded-full font-black text-base sm:text-lg shadow-xl hover:bg-yellow-300 hover:scale-105 transition-all duration-300 active:scale-95"
                >
                  Start Exploring
                </button>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-primary-600 bg-indigo-200 flex items-center justify-center text-sm font-bold overflow-hidden shadow-lg transform hover:-translate-y-1 transition-transform">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=pet${i}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] font-black tracking-widest text-indigo-200 uppercase whitespace-nowrap">
                    +5k Happy Pets
                  </div>
                </div>
              </div>
            </div>

            {/* Icons Slider Container */}
            <div className="relative w-full lg:w-1/3 h-48 sm:h-64 lg:h-80 bg-white/5 backdrop-blur-xl rounded-[24px] sm:rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col justify-center gap-4 sm:gap-8 mt-8 lg:mt-0">
              {[0, 1].map((row) => (
                <div key={row} className="overflow-hidden whitespace-nowrap">
                  <div className={`animate-scroll flex gap-4 sm:gap-6 ${row === 1 ? 'flex-row-reverse' : ''}`} 
                       style={{ animationDirection: row === 1 ? 'reverse' : 'normal' }}>
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="w-12 h-12 sm:w-20 sm:h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 transition-all hover:scale-110">
                        <span className="text-2xl sm:text-4xl transition-transform">
                          {['🐶', '🐱', '🏥', '🦴', '🩺', '💊', '🐾', '🐰', '💉', '🦜'][i % 10]}
                        </span>
                      </div>
                    ))}
                    {[...Array(10)].map((_, i) => (
                      <div key={'r'+i} className="w-12 h-12 sm:w-20 sm:h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20 transition-all hover:scale-110">
                        <span className="text-2xl sm:text-4xl transition-transform">
                          {['🐶', '🐱', '🏥', '🦴', '🩺', '💊', '🐾', '🐰', '💉', '🦜'][i % 10]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Filter Section with Premium Colors */}
        <div id="search-section" className="flex flex-col md:flex-row gap-4 mb-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-3 sm:p-4 rounded-[20px] shadow-xl shadow-purple-100/50 border border-purple-100 backdrop-blur-lg">
          
          <div className="flex items-center gap-3 px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl whitespace-nowrap shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 active:scale-95 w-full md:w-auto">
            <span className="text-xl sm:text-2xl animate-bounce" style={{ animationDuration: '2s' }}>📍</span>
            <div className="flex flex-col justify-center overflow-hidden">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-purple-200 leading-none mb-1">Current Location</span>
              <span className="text-xs sm:text-sm font-bold text-white leading-tight truncate pr-2">
                {userLocation.city ? (
                  <>{userLocation.city}{userLocation.state ? `, ${userLocation.state}` : ''}</>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Detecting…
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Premium Search Bar */}
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-all duration-300"></div>
            <div className="relative flex items-center bg-white border border-gray-200 rounded-2xl focus-within:border-transparent focus-within:ring-4 focus-within:ring-purple-500/30 transition-all overflow-hidden shadow-lg group-hover:shadow-xl">
              <span className="pl-5 pr-3 text-gray-400 group-focus-within:text-purple-600 transition-all duration-300 transform group-focus-within:scale-110">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search your perfect pet companion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-4 bg-transparent focus:outline-none font-semibold text-sm sm:text-base text-gray-800 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mr-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex gap-3">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)} 
              className="flex-1 md:flex-none px-5 py-3.5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all font-bold text-xs sm:text-sm cursor-pointer hover:border-purple-300 shadow-sm hover:shadow-md"
            >
              <option value="all">🐾 All Pets</option>
              <option value="dog">🐶 Dogs</option>
              <option value="cat">🐱 Cats</option>
              <option value="bird">🦜 Birds</option>
              <option value="other">🐇 Others</option>
            </select>
            <button 
              onClick={fetchPets} 
              className="flex-1 md:flex-none px-6 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-black text-xs sm:text-sm hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/30"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 via-pink-50 to-rose-50 border-l-4 border-pink-500 text-pink-700 p-5 rounded-r-2xl mb-8 shadow-lg shadow-pink-100/50 flex items-center gap-3 animate-in slide-in-from-top-2">
            <span className="text-2xl">⚠️</span>
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Pets Grid with Enhanced Cards */}
        {loading ? (
          <div className="py-20 flex justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl shadow-inner">
            <Loader message="Discovering amazing pets..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPets.length > 0 ? (
              filteredPets.map((p, index) => (
                <div 
                  key={p._id} 
                  className="transform hover:-translate-y-3 transition-all duration-300 group"
                  style={{animationDelay: `${index * 50}ms`}}
                >
                  <PetCard
                    pet={p}
                    onClick={() => {
                      if (!user) {
                        navigate("/login", { state: { from: location } });
                      } else {
                        navigate(`/pet/${p._id}`);
                      }
                    }}
                    actionBtn={{ 
                      label: "View Details", 
                      onAdopt: () => {
                        if (!user) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          setSelectedPet(p);
                        }
                      },
                      onOuting: () => {
                        if (!user) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          setOutingPet(p);
                        }
                      },
                      onClick: () => {
                        if (!user) {
                          navigate("/login", { state: { from: location } });
                        } else {
                          navigate(`/pet/${p._id}`);
                        }
                      } 
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl border-2 border-dashed border-purple-200 shadow-inner">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                  <span className="relative text-7xl">📭</span>
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">No pets found</h3>
                <p className="text-gray-600 text-base max-w-md font-medium">Try adjusting your search terms or filters to find what you're looking for.</p>
                <button
                  onClick={() => {setSearchTerm(''); setFilter('all');}}
                  className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-purple-500/30"
                >
                  🔄 Reset Filters
                </button>
              </div>
            )}
          </div>
        )}
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
  );
};

export default Home;
