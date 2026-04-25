import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Bell, Plus, Pencil, Trash2, CheckCircle, 
  AlertCircle, X, Search, Pin, Star
} from 'lucide-react';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General Care',
    content: '',
    doctorName: '',
    experience: '',
    specialization: '',
    isPinned: false
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices/provider');
      setNotices(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load notices', err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingNotice) {
        await api.put(`/notices/${editingNotice._id}`, formData);
      } else {
        await api.post('/notices', formData);
      }
      setShowModal(false);
      setEditingNotice(null);
      setFormData({
        title: '',
        category: 'General Care',
        content: '',
        doctorName: '',
        experience: '',
        specialization: '',
        isPinned: false
      });
      fetchNotices();
    } catch (err) {
      console.error('Save failed', err);
      alert('Error saving notice');
    }
  };

  const handleEdit = (notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      category: notice.category,
      content: notice.content,
      doctorName: notice.doctorName,
      experience: notice.experience,
      specialization: notice.specialization || '',
      isPinned: notice.isPinned
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      fetchNotices();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const categories = ["Health Tips", "Emergency", "General Care", "Seasonal Tips"];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center font-outfit">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Notices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-[#f8fafc] font-outfit">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">Notice Hub</h1>
            <p className="text-slate-500 font-medium">Create and manage public announcements for your community.</p>
          </div>
          <button 
            onClick={() => {
              setEditingNotice(null);
              setFormData({
                title: '',
                category: 'General Care',
                content: '',
                doctorName: '',
                experience: '',
                specialization: '',
                isPinned: false
              });
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-100"
          >
            <Plus size={18} /> New Notice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
               {notice.isPinned && (
                 <div className="absolute top-0 right-10 bg-blue-600 text-white p-2 rounded-b-xl shadow-lg animate-bounce">
                    <Pin size={14} fill="white" />
                 </div>
               )}
               <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                    notice.category === 'Emergency' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {notice.category}
                  </span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(notice)} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl border border-slate-100"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(notice._id)} className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl border border-slate-100"><Trash2 size={16} /></button>
                  </div>
               </div>
               
               <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{notice.title}</h3>
               <p className="text-slate-600 font-medium mb-6 line-clamp-3 text-sm leading-relaxed">{notice.content}</p>
               
               <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                        {notice.doctorName?.[0] || 'D'}
                     </div>
                     <div>
                        <p className="text-xs font-black text-slate-900 leading-none">{notice.doctorName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{notice.specialization || notice.experience}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500">
                    <Star size={12} fill="currentColor" />
                    <span className="text-[10px] font-black">{notice.ratings?.length || 0} Ratings</span>
                  </div>
               </div>
            </div>
          ))}
        </div>

        {notices.length === 0 && (
          <div className="flex flex-col items-center justify-center p-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
            <Bell size={64} className="text-slate-200 mb-6" />
            <p className="text-xl font-black text-slate-900">No active notices.</p>
            <p className="text-slate-500 font-medium mt-2">Start by creating your first announcement!</p>
          </div>
        )}
      </div>

      {/* Modern Notice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white">
            <div className="bg-blue-600 p-8 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight">{editingNotice ? 'Edit Notice' : 'Draft New Notice'}</h2>
                <p className="text-blue-200 font-medium text-xs mt-1 lowercase underline tracking-widest">Broadcasting to community portal</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Announcement Title</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all"
                    placeholder="e.g. Seasonal Vaccination Campaign"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Category</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-blue-500 focus:ring-0 transition-all appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex items-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.isPinned ? 'bg-blue-600' : 'bg-slate-200'}`}>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={formData.isPinned}
                                onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
                            />
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isPinned ? 'translate-x-6' : ''}`}></div>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Pin to top</span>
                    </label>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Author / Doctor Name</label>
                  <input 
                    required 
                    placeholder="e.g. Dr. Sarah Johnson"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all"
                    value={formData.doctorName}
                    onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Experience</label>
                  <input 
                    required 
                    placeholder="e.g. 10+ Years"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-blue-500 focus:ring-0"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  />
                </div>

                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Specialization</label>
                  <input 
                    placeholder="e.g. Veterinary Surgeon"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 font-bold text-slate-900 focus:border-blue-500 focus:ring-0"
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Full Content</label>
                  <textarea 
                    required 
                    rows="4"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-0 transition-all resize-none"
                    placeholder="Provide full details of your announcement here..."
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-2xl shadow-blue-100 active:scale-95"
              >
                {editingNotice ? 'Save Modifications' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
