import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

// ── Inline Toast ──────────────────────────────────────────────────────────── home
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  return (
    <div className={`fixed bottom-8 right-8 z-[200] flex items-center gap-4 px-7 py-5 rounded-2xl shadow-2xl text-white font-bold text-sm ${bg}`}
         style={{ animation: 'slideUp 0.3s ease' }}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      <span>{message}</span>
      <button onClick={onClose} className='ml-2 opacity-70 hover:opacity-100 font-black text-lg'>×</button>
      <style>{`@keyframes slideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }`}</style>
    </div>
  );
};

// ── Reply Modal ─────────────────────────────────────────────────────────────
const ReplyModal = ({ appointment, onClose, onSent }) => {
  const [form, setForm] = React.useState({
    roomNumber: appointment.roomNumber || '',
    replyLocation: appointment.replyLocation || '',
    doctorReply: appointment.doctorReply || '',
  });
  const [saving, setSaving] = React.useState(false);
  const [err, setErr] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.doctorReply.trim()) { setErr('Clinic message cannot be empty.'); return; }
    setSaving(true);
    try {
      const res = await api.put(`/provider/appointments/${appointment._id}/reply`, {
        doctorReply: form.doctorReply.trim(),
        roomNumber: form.roomNumber.trim(),
        replyLocation: form.replyLocation.trim(),
      });
      onSent(res.data);
      onClose();
    } catch (err) {
      setErr(err?.response?.data?.msg || 'Failed to send reply.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-green-100"
           style={{ animation: 'scaleUp 0.25s ease' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-7 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">💬</div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Reply to Patient</h2>
              <p className="text-green-100 text-xs font-bold mt-0.5 uppercase tracking-widest">
                🐾 {appointment.petName} · {appointment.user?.name || appointment.user?.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/40 transition-all font-black text-xl">×</button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {err && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-bold">
              <span>⚠️</span>{err}
            </div>
          )}

          {/* Room Number */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              🚪 Room Number
            </label>
            <input
              type="text"
              value={form.roomNumber}
              onChange={(e) => setForm({ ...form, roomNumber: e.target.value })}
              placeholder="e.g. Room 3B, Consultation Room 2…"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              📍 Location / Floor
            </label>
            <input
              type="text"
              value={form.replyLocation}
              onChange={(e) => setForm({ ...form, replyLocation: e.target.value })}
              placeholder="e.g. 2nd Floor, Block A · Main Building…"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold outline-none placeholder:text-gray-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
              📋 Clinic Messages *
            </label>
            <textarea
              required rows={4}
              value={form.doctorReply}
              onChange={(e) => { setForm({ ...form, doctorReply: e.target.value }); setErr(''); }}
              placeholder="e.g. Please ensure your pet is fasted for 6 hours. Bring previous medical records and arrive 10 minutes early…"
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-bold outline-none resize-none placeholder:text-gray-300"
            />
          </div>

          <div className="flex gap-4 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transition-all disabled:opacity-60">
              {saving
                ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Sending…</span>
                : 'Send Reply ✓'}
            </button>
          </div>
        </form>
        <style>{`@keyframes scaleUp{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
      </div>
    </div>
  );
};

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [replyTarget, setReplyTarget] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/provider/appointments', {
        params: { page, limit, status: statusFilter || undefined }
      });
      setAppointments(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to load appointments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socket.on('appointment-updated', () => fetchAppointments());
    socket.on('appointment-created', () => fetchAppointments());
    return () => socket.disconnect();
  }, [page, limit, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/provider/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? res.data : a)));
      setToast({ message: `Appointment ${status === 'confirmed' ? 'accepted ✓' : 'rejected'}`, type: status === 'confirmed' ? 'success' : 'error' });
    } catch (err) {
      console.error('Failed to update status', err);
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Manage Appointments</h1>
            <p className="text-gray-500 font-bold mt-1 sm:mt-2 text-sm">View and respond to upcoming clinic visits.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Items per<br/>Page:</span>
              <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} className="px-4 py-3 bg-white border border-gray-100 rounded-xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status:</span>
              <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} className="px-5 py-3 bg-white border border-gray-100 rounded-xl font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-6 px-4">
            <p className="text-sm font-bold text-gray-400">
              {total > 0 ? (
                <>Showing <span className="text-gray-900 font-black">{(page - 1) * limit + 1}</span> to <span className="text-gray-900 font-black">{Math.min(page * limit, total)}</span> of <span className="text-gray-900 font-black">{total}</span> appointments</>
              ) : (
                'No appointments match your filters.'
              )}
            </p>
          </div>
          <div className="space-y-6">
            {loading && <p className="text-gray-400 italic">Refreshing appointments...</p>}
            {!loading && appointments.length === 0 && (
              <div className="py-24 text-center">
                <div className="text-5xl mb-4 opacity-30">📅</div>
                <h3 className="text-xl font-black text-gray-800">No Appointments Found</h3>
                <p className="text-gray-500 font-bold">Try changing the filters or check back later.</p>
              </div>
            )}
            {appointments.map((appt) => (
              <div key={appt._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-8 border border-gray-50 rounded-2xl sm:rounded-[32px] hover:bg-gray-50/50 transition-all gap-4 sm:gap-8">
                <div className="flex items-start gap-3 sm:gap-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-sm flex-shrink-0">👤</div>
                  <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base sm:text-xl font-black text-gray-900 truncate">{appt.user?.name || appt.user?.email}</p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex-shrink-0 ${
                        appt.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                        appt.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                        <span>🐾</span> {appt.petName || 'Anonymous Pet'}
                      </p>
                      <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>📅</span> {new Date(appt.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>⏰</span> {appt.time || 'TBD'}
                      </p>
                      <p className="text-[10px] sm:text-xs font-black text-indigo-500 uppercase tracking-widest">
                        <span>🏥</span> {appt.clinic?.name || 'General Clinic'}
                      </p>
                    </div>

                    <div className="mt-3 p-3 sm:p-5 bg-gray-50 border border-gray-100 rounded-2xl max-w-lg">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Pet Owner's Note</p>
                      <p className="text-xs sm:text-sm font-bold text-gray-600 italic leading-relaxed">"{appt.reason || 'No clinical notes provided.'}"</p>
                    </div>

                    {appt.doctorReply && (
                      <div className="mt-2 p-3 sm:p-5 bg-emerald-50 rounded-2xl border border-emerald-100 max-w-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100/30 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <span>💬</span> Clinic Messages Sent
                          </p>
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            {appt.roomNumber && (
                              <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Room</p>
                                <p className="text-[11px] font-black text-gray-800">🚪 {appt.roomNumber}</p>
                              </div>
                            )}
                            {appt.replyLocation && (
                              <div>
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Location</p>
                                <p className="text-[11px] font-black text-gray-800">📍 {appt.replyLocation}</p>
                              </div>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-emerald-700">{appt.doctorReply}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col flex-wrap items-center sm:items-end gap-2 sm:gap-3 min-w-0 sm:min-w-[150px] w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 mt-2 sm:mt-0">
                  {appt.status === 'pending' && (
                    <div className="flex w-full sm:w-auto items-center gap-2">
                      <button onClick={() => updateStatus(appt._id, 'confirmed')} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg text-center">Accept</button>
                      <button onClick={() => updateStatus(appt._id, 'rejected')} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-gray-100 text-red-600 rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all text-center">Reject</button>
                    </div>
                  )}
                  {appt.status === 'confirmed' && (
                    <button onClick={() => setReplyTarget(appt)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transition-all whitespace-nowrap">
                      <span>💬</span> {appt.doctorReply ? 'Edit' : 'Send Message'}
                    </button>
                  )}
                </div>
              </div>
            ))}

          </div>

          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-50">
            <button
               disabled={page <= 1}
               onClick={() => setPage(1)}
               className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-white hover:text-blue-600 transition-all shadow-sm font-black text-xs"
               title="First Page"
            >
              «
            </button>
            <button
               disabled={page <= 1}
               onClick={() => setPage((p) => Math.max(1, p - 1))}
               className="px-5 py-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-white hover:text-blue-600 transition-all shadow-sm font-black text-xs uppercase tracking-widest"
            >
              ← Prev
            </button>

            <div className="bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-black text-sm border border-blue-100 shadow-inner">
               {page} / {Math.max(1, Math.ceil(total / limit))}
            </div>

            <button
               disabled={page >= Math.ceil(total / limit)}
               onClick={() => setPage((p) => p + 1)}
               className="px-5 py-3 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-white hover:text-blue-600 transition-all shadow-sm font-black text-xs uppercase tracking-widest"
            >
              Next →
            </button>
            <button
               disabled={page >= Math.ceil(total / limit)}
               onClick={() => setPage(Math.ceil(total / limit))}
               className="w-10 h-10 flex items-center justify-center bg-gray-50 border border-gray-100 rounded-xl disabled:opacity-30 hover:bg-white hover:text-blue-600 transition-all shadow-sm font-black text-xs"
               title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {replyTarget && (
        <ReplyModal
          appointment={replyTarget}
          onClose={() => setReplyTarget(null)}
          onSent={(updated) => {
            setAppointments(prev => prev.map(a => a._id === updated._id ? updated : a));
            setToast({ message: 'Clinic message sent ✓', type: 'success' });
          }}
        />
      )}
    </div>
  );
}
