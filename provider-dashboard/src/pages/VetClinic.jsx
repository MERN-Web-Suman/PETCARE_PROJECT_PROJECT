import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';

// ── Inline Toast ────────────────────────────────────────────────────────────
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




const ClinicForm = ({ formData, handleChange, handleSave, setIsEditing }) => (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden mb-8 p-10">
      <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
        <span className="text-blue-600">🩺</span> Clinic & Doctor Details
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Doctor Name *</label>
            <input type="text" name="doctorName" required value={formData.doctorName || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="Dr. John Doe"/>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Specialization *</label>
            <input type="text" name="specialization" required value={formData.specialization || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="Veterinary Surgeon"/>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Experience (Years) *</label>
            <input type="text" name="experience" required value={formData.experience || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="e.g. 10"/>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Clinic Name *</label>
            <input type="text" name="name" required value={formData.name || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="Sunny Paws Clinic"/>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Contact Number *</label>
            <input type="tel" name="phone" required value={formData.phone || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="+1 (555) 000-0000"/>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Email Address *</label>
            <input type="email" name="email" required value={formData.email || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="clinic@example.com"/>
          </div>
          <div>
            <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Available Timings</label>
            <input type="text" name="workingHours" value={formData.workingHours || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="Mon-Fri, 9AM - 6PM"/>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Office Address *</label>
          <input type="text" name="address" required value={formData.address || ''} onChange={handleChange} className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all" placeholder="123 Main St, Pet City"/>
        </div>

        <div className="md:col-span-2 flex items-center gap-4 py-4 border-t border-b border-gray-50 my-4">
           <label className="flex items-center cursor-pointer gap-4">
              <span className="text-sm font-black text-gray-700 uppercase tracking-wide">Practice Currently Active?</span>
              <div className="relative">
                <input 
                  type="checkbox" 
                  name="isAvailable" 
                  checked={formData.isAvailable !== false} 
                  onChange={(e) => handleChange({ target: { name: 'isAvailable', value: e.target.checked } })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
           </label>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-black text-gray-700 mb-2 uppercase tracking-wide">Description</label>
          <textarea name="doctorAbout" value={formData.doctorAbout || ''} onChange={handleChange} rows="4" className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all resize-none" placeholder="Share your experience and care philosophy..."/>
        </div>
      </div>

      <div className="mt-12 flex justify-end gap-4">
        <button type="button" onClick={() => setIsEditing(false)} className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
        <button type="button" onClick={handleSave} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 hover:shadow-lg transition-all">Save Practice</button>
      </div>
    </div>
);

export default function VetClinic() {
  const [clinics, setClinics] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const res = await api.get('/clinics/provider');
      setClinics(res.data || []);
    } catch (err) {
      console.error('Failed to fetch clinic data', err);
    }
  };


  const handleAdd = () => {
    setFormData({ name: '', email: '', phone: '', address: '', doctorName: '', experience: '', specialization: '', workingHours: '', doctorAbout: '' });
    setCurrentId(null);
    setIsEditing(true);
  };

  const handleEdit = (clinic) => {
    setFormData(clinic);
    setCurrentId(clinic._id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clinic?')) return;
    try {
      await api.delete(`/clinics/${id}`);
      fetchClinics();
      alert('Clinic deleted successfully');
    } catch (err) {
      console.error('Error deleting clinic:', err);
      alert('Failed to delete clinic');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSave = async () => {
    // Basic client-side validation mapping
    const fieldMapping = {
      name: 'Clinic Name',
      email: 'Email Address',
      phone: 'Contact Number',
      address: 'Office Address',
      doctorName: 'Doctor Name',
      experience: 'Experience',
      specialization: 'Specialization'
    };

    const missingFields = Object.keys(fieldMapping).filter(field => !formData[field] || formData[field].trim() === '');
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.map(f => fieldMapping[f]).join(', ')}`);
      return;
    }

    try {
      if (currentId) {
        await api.put(`/clinics/${currentId}`, formData);
        alert('Clinic updated successfully!');
      } else {
        await api.post('/clinics', formData);
        alert('New clinic added successfully!');
      }
      setIsEditing(false);
      fetchClinics();
    } catch (error) {
      console.error('Error saving clinic:', error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || 'Failed to save clinic details. Please check all fields.';
      alert(errorMsg);
    }
  };

  const filteredClinics = clinics
    .filter(c => 
      c.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'name') return (a.doctorName || '').localeCompare(b.doctorName || '');
      if (sortBy === 'experience') return Number(b.experience || 0) - Number(a.experience || 0);
      return 0;
    });

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 sm:mb-12 gap-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">Clinic Management</h1>
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            {!isEditing && (
              <>
                <div className="flex bg-white p-1 rounded-xl border border-gray-100 shadow-sm flex-1 sm:flex-none">
                  <button onClick={() => setViewMode('grid')} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Grid</button>
                  <button onClick={() => setViewMode('table')} className={`w-full sm:w-auto px-4 py-2 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>Table</button>
                </div>
                <button
                  onClick={handleAdd}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1"
                >
                  + Add Clinic
                </button>
              </>
            )}
          </div>
        </div>

        {!isEditing && clinics.length > 0 && (
          <div className="flex flex-col md:flex-row gap-6 mb-10 items-center justify-between">
            <div className="relative w-full md:w-96">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search by doctor, specialty, or clinic..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 font-bold transition-all"
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 bg-white border border-gray-100 rounded-xl shadow-sm font-bold text-gray-700 focus:ring-4 focus:ring-blue-500/10 transition-all"
              >
                <option value="name">Doctor Name (A-Z)</option>
                <option value="experience">Experience (Highest First)</option>
              </select>
            </div>
          </div>
        )}

        {isEditing ? (
          <ClinicForm 
            formData={formData} 
            handleChange={handleChange} 
            handleSave={handleSave} 
            setIsEditing={setIsEditing} 
          />
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {filteredClinics.map((c) => (
                  <div key={c._id} className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 hover:shadow-2xl transition-all group flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        🩺
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{c.doctorName}</h3>
                        <p className="text-xs font-black text-blue-600 uppercase tracking-widest">{c.specialization}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4 mb-8 flex-1">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Clinic Name</span>
                          <p className="font-bold text-gray-800">{c.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Experience</span>
                          <p className="font-bold text-gray-800">{c.experience} Years</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Location</span>
                        <p className="font-bold text-gray-800 line-clamp-1">📍 {c.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Contact</span>
                          <p className="font-bold text-gray-800 text-sm">{c.phone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Status</span>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${c.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {c.isAvailable ? 'Active' : 'Closed'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 block mb-1">Working Hours</span>
                        <p className="font-bold text-gray-800 text-sm">⏰ {c.workingHours || '9:00 AM - 6:00 PM'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 border-t pt-6">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="flex-1 py-3 bg-gray-50 text-gray-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(c._id)}
                        className="flex-1 py-3 bg-gray-50 text-red-400 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-16">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Doctor</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Clinic</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Specialty</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Experience</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClinics.map((c) => (
                      <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-bold text-gray-900">{c.doctorName}</p>
                          <p className="text-xs text-gray-500">{c.phone}</p>
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-800">{c.name}</td>
                        <td className="px-8 py-6 tracking-tight text-blue-600 font-black uppercase text-[10px]">{c.specialization}</td>
                        <td className="px-8 py-6 font-bold text-gray-800">{c.experience} Years</td>
                        <td className="px-8 py-6">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${c.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {c.isAvailable ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex gap-3">
                            <button onClick={() => handleEdit(c)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">✏️</button>
                            <button onClick={() => handleDelete(c._id)} className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredClinics.length === 0 && (
              <div className="col-span-full py-32 bg-white rounded-[50px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                <span className="text-6xl mb-6">🏥</span>
                <h3 className="text-2xl font-black text-gray-800 mb-2">No Matching Results</h3>
                <p className="text-gray-500 font-bold mb-8">Try adjusting your search filters or add a new profile.</p>
                <button onClick={handleAdd} className="px-10 py-4 bg-blue-600 text-white rounded-[2rem] font-bold shadow-lg">Setup Your Provider Profile</button>
              </div>
            )}
          </>
        )}

        {/* Stats (Cumulative for all clinics) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 mt-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[40px] p-10 text-white shadow-xl">
            <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-3">Total Monthly Appointments</p>
            <p className="text-6xl font-black">
              {clinics.reduce((acc, c) => acc + (c.totalAppointmentsMonthly || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs mb-3">Practicing Locations</p>
            <p className="text-6xl font-black text-gray-900">{clinics.length}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
