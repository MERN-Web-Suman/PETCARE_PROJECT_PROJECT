import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, Star, MessageCircle, Share2, Calendar, User, Pin, ArrowRight } from 'lucide-react';

const CategoryBadge = ({ category }) => {
  const colors = {
    "Emergency": "bg-red-500 text-white",
    "Health Tips": "bg-emerald-500 text-white",
    "General Care": "bg-blue-500 text-white",
    "Seasonal Tips": "bg-amber-500 text-white"
  };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colors[category] || colors["General Care"]}`}>
      {category}
    </span>
  );
};

export default function Notices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load notices', err);
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await api.patch(`/notices/like/${id}`);
      fetchNotices(); // Refresh to get updated like count
    } catch (err) {
      console.error('Like failed', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 bg-[#f8fafc] flex items-center justify-center font-outfit">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Latest Bulletins...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-outfit">
      <Navbar />
      
      <div className="flex-1 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 mb-4 animate-bounce">
              <Bell size={20} />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Community Bulletins</span>
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Latest <span className="text-indigo-600">PetCare</span> Notices
            </h1>
            <p className="text-slate-500 font-bold max-w-2xl mx-auto text-xl leading-relaxed">
              Stay informed with critical health tips, emergency alerts, and expert advice from our verified veterinary community.
            </p>
          </div>

          {/* Notices Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {notices.map((notice) => (
              <div 
                  key={notice._id} 
                  className={`group relative bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col ${notice.isPinned ? 'ring-4 ring-indigo-100 border-indigo-200 scale-105 z-10' : ''}`}
              >
                {notice.isPinned && (
                  <div className="absolute -top-4 -right-4 bg-indigo-600 text-white p-4 rounded-3xl shadow-xl shadow-indigo-100 animate-pulse transition-transform group-hover:rotate-12">
                     <Pin size={24} fill="white" />
                  </div>
                )}

                <div className="mb-8 flex flex-wrap items-center gap-3">
                   <CategoryBadge category={notice.category} />
                   <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                      <Calendar size={14} /> {new Date(notice.createdAt).toLocaleDateString()}
                   </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">
                  {notice.title}
                </h2>
                
                <p className="text-slate-500 font-medium mb-10 line-clamp-4 leading-relaxed text-lg italic">
                  "{notice.content}"
                </p>

                <div className="mt-auto pt-8 border-t border-slate-100 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner uppercase">
                             {notice.doctorName?.[0] || 'D'}
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">{notice.doctorName}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 line-clamp-1">{notice.specialization || notice.experience}</p>
                          </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <div className="flex items-center gap-1 text-amber-500">
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                            <Star size={14} fill="currentColor" />
                         </div>
                         <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">Top Rated Provider</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <button 
                              onClick={() => handleLike(notice._id)}
                              className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors group/btn"
                          >
                             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover/btn:bg-rose-50">
                                 <MessageCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                             </div>
                             <span className="text-xs font-black">{notice.likes?.length || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors group/btn">
                             <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover/btn:bg-indigo-50">
                                 <Share2 size={18} />
                             </div>
                             <span className="text-xs font-black">Share Bulletin</span>
                          </button>
                      </div>
                      <button className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-indigo-600 transition-all hover:scale-110 shadow-xl shadow-slate-200">
                         <ArrowRight size={20} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {notices.length === 0 && (
            <div className="text-center py-40">
               <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center text-7xl mx-auto mb-10 grayscale opacity-20">📭</div>
               <h3 className="text-4xl font-black text-slate-900 tracking-tight">The Board is Quiet</h3>
               <p className="text-slate-500 font-bold mt-4 text-xl">We're waiting for providers to post new updates. Check back soon!</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
