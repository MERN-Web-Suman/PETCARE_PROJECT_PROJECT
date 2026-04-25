import { useState, useEffect, useContext } from "react";
import API from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { AuthContext } from "../context/AuthContext";

const NoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Health Tips", "Emergency", "General Care", "Seasonal Tips"];

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await API.get("/notices");
      setNotices(res.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to load notices");
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) return alert("Please login to like guidelines");
    try {
      const res = await API.patch(`/notices/like/${id}`);
      setNotices(notices.map(n => n._id === id ? res.data : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (id, stars) => {
    if (!user) return alert("Please login to rate guidelines");
    try {
      const res = await API.post(`/notices/rate/${id}`, { stars });
      setNotices(notices.map(n => n._id === id ? { ...res.data, provider: n.provider } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex flex-col min-h-screen bg-slate-50 font-outfit"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader message="Fetching guidelines..." /></div><Footer /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      <div className="flex-1 py-12 w-full animate-fade-in relative">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500 opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-pink-500 opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 bg-gradient-primary bg-clip-text text-transparent transform hover:scale-105 transition-transform duration-300 inline-block">
              Pet Care Guidelines
            </h1>
            <p className="text-xl text-gray-600 font-medium">Important health and safety information from our professional partners.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl font-black text-sm transition-all shadow-sm ${
                  activeCategory === cat 
                    ? "bg-indigo-600 text-white shadow-indigo-200 -translate-y-1" 
                    : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {notices
              .filter(n => activeCategory === "All" || n.category === activeCategory)
              .map((notice) => {
              const avgRating = notice.ratings?.length > 0 
                ? (notice.ratings.reduce((acc, r) => acc + r.stars, 0) / notice.ratings.length).toFixed(1) 
                : "0.0";
              const userRating = notice.ratings?.find(r => r.user === user?.id || r.user?._id === user?.id)?.stars || 0;
              const hasLiked = notice.likes?.includes(user?.id) || notice.likes?.some(l => l._id === user?.id);

              return (
                <div key={notice._id} className={`bg-white rounded-3xl shadow-xl overflow-hidden border transition-all duration-300 relative hover:shadow-2xl hover:-translate-y-1 ${
                  notice.isPinned ? 'border-indigo-400 ring-2 ring-indigo-50 shadow-indigo-100' : 'border-gray-100'
                }`}>
                  <div className={`h-2 ${
                    notice.category === 'Emergency' ? 'bg-red-500' :
                    notice.category === 'Health Tips' ? 'bg-green-500' :
                    notice.category === 'Seasonal Tips' ? 'bg-orange-500' :
                    'bg-indigo-500'
                  }`} />
                  
                  {notice.isPinned && (
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg z-10">
                      <span title="Pinned by Provider">📌</span>
                    </div>
                  )}

                  <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        notice.category === 'Emergency' ? 'bg-red-50 text-red-600' :
                        notice.category === 'Health Tips' ? 'bg-green-50 text-green-600' :
                        notice.category === 'Seasonal Tips' ? 'bg-orange-50 text-orange-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {notice.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                      {notice.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line text-sm mb-6">
                      {notice.content}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {notice.provider?.name?.charAt(0).toUpperCase() || "P"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-gray-900">Dr. {notice.doctorName || "Professional"}</span>
                          <span className="text-[10px] text-gray-400 font-bold">
                            {notice.specialization || "Expert Provider"} • {notice.experience || "Verified"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => handleLike(notice._id)}
                          className={`flex items-center gap-1.5 transition-all active:scale-90 ${
                            hasLiked ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                          }`}
                        >
                          <span className="text-xl">{hasLiked ? '❤️' : '🤍'}</span>
                          <span className="text-xs font-black">{notice.likes?.length || 0}</span>
                        </button>
                        
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleRate(notice._id, star)}
                              className={`text-sm transition-all hover:scale-125 ${
                                userRating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'
                              }`}
                            >
                              ★
                            </button>
                          ))}
                          <span className="text-[10px] font-black text-gray-900 ml-1.5 bg-gray-50 px-2 py-0.5 rounded-md">
                            {avgRating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {notices.length === 0 && !error && (
            <div className="text-center py-24 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-200">
              <span className="text-6xl block mb-4">📢</span>
              <p className="text-2xl text-gray-400 font-medium">No guidelines have been published yet.</p>
              <p className="text-gray-500 mt-2">Check back soon for seasonal care tips!</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-red-600 text-center font-bold">
              {error}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NoticeList;
