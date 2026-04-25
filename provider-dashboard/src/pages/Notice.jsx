import React, { useState, useEffect } from 'react';
import api from '../services/api';

const categoryBadge = (category) => {
  switch (category) {
    case 'Emergency':
      return 'bg-rose-100 text-rose-700 border border-rose-200';
    case 'Health Tips':
      return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'Seasonal Tips':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    default:
      return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
  }
};

export default function Notice() {
  const [notices, setNotices] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'General Care',
    content: '',
    isPinned: false,
    doctorName: '',
    experience: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchNotices();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile");
    }
  };

  const fetchNotices = async () => {
    setListLoading(true);
    try {
      const res = await api.get('/notices/provider');
      setNotices(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/notices', formData);
      setFormData({ 
        title: '', 
        category: 'General Care', 
        content: '', 
        isPinned: false,
        doctorName: '',
        experience: '',
        specialization: ''
      });
      fetchNotices();
      alert("Notice published successfully!");
    } catch (err) {
      alert("Failed to publish notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this notice?")) {
      try {
        await api.delete(`/notices/${id}`);
        fetchNotices();
      } catch (err) {
        console.error("Notice delete error:", err);
        alert(err.response?.data?.message || err.message || "Failed to remove notice");
      }
    }
  };

  const pinnedCount = notices.filter((n) => n.isPinned).length;
  const emergencyCount = notices.filter((n) => n.category === 'Emergency').length;

  return (
    <div className="flex min-h-screen flex-col gap-8 bg-slate-50/80 p-6 md:p-8">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-indigo-50/60 p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-slate-900 via-indigo-800 to-amber-600 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              Notice Management
            </h1>
            <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
              Publish pet care guidelines and alerts for the main website.
            </p>
          </div>
          <div className="grid w-full grid-cols-2 gap-3 lg:w-auto lg:grid-cols-3">
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Total</p>
              <p className="mt-1 text-2xl font-extrabold text-indigo-900">{notices.length}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Pinned</p>
              <p className="mt-1 text-2xl font-extrabold text-amber-900">{pinnedCount}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-rose-200 bg-rose-50/70 p-3 shadow-sm lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Emergency</p>
              <p className="mt-1 text-2xl font-extrabold text-rose-900">{emergencyCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <h2 className="mb-6 flex flex-col gap-4 text-2xl font-black text-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <span>Create New Notice</span>
          {profile && (
            <div className="rounded-2xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-left sm:text-right">
              <p className="text-sm font-bold text-violet-800">Posting as: {profile.name}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600/80">
                {profile.specialization || 'Pet Professional'} · {profile.experience || 'Verified'}
              </p>
            </div>
          )}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Summer Safety Tips"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option>Health Tips</option>
                <option>Emergency</option>
                <option>General Care</option>
                <option>Seasonal Tips</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Doctor Name</label>
              <input 
                type="text" 
                required
                value={formData.doctorName}
                onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
                placeholder="e.g., Dr. Jane Doe"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Experience</label>
              <input 
                type="text" 
                required
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="e.g., 5+ Years"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Specialization</label>
              <input 
                type="text" 
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                placeholder="e.g., Veterinary Surgeon"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/40 px-4 py-3">
            <input 
              type="checkbox" 
              id="isPinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({...formData, isPinned: e.target.checked})}
              className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isPinned" className="cursor-pointer text-sm font-bold text-slate-700">
              Pin this notice to the top
            </label>
          </div>

          <div>
            <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-widest text-slate-500">Content Details</label>
            <textarea 
              required
              rows="5"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Provide detailed instructions..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-amber-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:from-indigo-700 hover:via-violet-700 hover:to-amber-700 disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish to Main Website"}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-6 py-4">
          <h3 className="font-black text-slate-900">Your Published Notices</h3>
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Manage visibility on the main site</p>
        </div>
        <div className="divide-y divide-slate-100">
          {listLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </div>
          ) : notices.length > 0 ? (
            notices.map((notice) => (
              <div
                key={notice._id}
                className="flex flex-col gap-4 p-6 transition hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${categoryBadge(notice.category)}`}>
                      {notice.category}
                    </span>
                    {notice.isPinned && (
                      <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-800">
                        Pinned
                      </span>
                    )}
                    <h4 className="font-bold text-slate-900">{notice.title}</h4>
                  </div>
                  <p className="mb-2 line-clamp-2 text-sm text-slate-600">{notice.content}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span className="text-indigo-600">{notice.doctorName}</span>
                    <span>Exp: {notice.experience}</span>
                    {notice.specialization && <span>Spec: {notice.specialization}</span>}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => handleDelete(notice._id)}
                  className="shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-600 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-16 text-center">
              <p className="font-bold text-amber-800">No notices published yet.</p>
              <p className="mt-1 text-sm text-amber-700/80">Create your first notice above to show content on the main website.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
