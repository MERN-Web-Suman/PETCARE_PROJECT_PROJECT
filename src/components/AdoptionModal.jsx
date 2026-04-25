import React, { useState, useContext } from 'react';
import { createPetAppointment } from '../services/petAppointmentService';
import { AuthContext } from '../context/AuthContext';

const AdoptionModal = ({ pet, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    petName: pet.name,
    applicantName: user?.name || '',
    email: user?.email || '',
    mobile: '',
    address: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const submissionData = {
        ...formData,
        pet: pet._id,
        owner: pet.owner._id || pet.owner // handle both populated and unpopulated
      };
      await createPetAppointment(submissionData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit adoption request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[40px] w-full max-w-lg overflow-hidden shadow-2xl border border-purple-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors text-2xl">✕</button>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-4xl">🏠</span>
            <span className="px-4 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">Adoption Application</span>
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tight">Adopt {pet.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Pet to Adopt</label>
              <input 
                type="text" 
                value={formData.petName} 
                disabled 
                className="w-full px-5 py-4 bg-gray-100 border-2 border-transparent rounded-2xl font-black text-gray-400 cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Applicant Name</label>
              <input 
                type="text" 
                required
                placeholder="Full Name"
                value={formData.applicantName}
                onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold outline-none" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Email</label>
              <input 
                type="email" 
                required
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold outline-none" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Preferred Appointment Time</label>
              <input 
                type="time" 
                required
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold outline-none" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mobile Number</label>
            <input 
              type="tel" 
              required
              placeholder="+1 (555) 000-0000"
              value={formData.mobile}
              onChange={(e) => setFormData({...formData, mobile: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold outline-none" 
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Your Address</label>
            <textarea 
              required
              rows="3"
              placeholder="Street, City, State, ZIP..."
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold outline-none resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">Cancel</button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-black hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Request ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdoptionModal;
