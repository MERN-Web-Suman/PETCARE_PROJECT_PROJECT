import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Toast from '../components/Toast';

export default function PetAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [outings, setOutings] = useState([]);
  const [activeTab, setActiveTab] = useState('adoption');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [apptRes, outingRes] = await Promise.all([
        api.get('/pet-appointments/owner'),
        api.get('/outing-requests/owner')
      ]);
      setAppointments(apptRes.data || []);
      setOutings(outingRes.data || []);
    } catch (err) {
      console.error('Failed to load requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, status, type) => {
    try {
      const endpoint = type === 'adoption' ? `/pet-appointments/${id}/status` : `/outing-requests/${id}/status`;
      await api.put(endpoint, { status });
      
      if (type === 'adoption') {
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      } else {
        setOutings(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      }
      
      setToast({ message: `Request ${status} successfully!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handlePetStatusUpdate = async (petId, status) => {
    try {
      await api.put(`/pets/${petId}/status`, { status });
      
      const updateDataList = (list) => list.map(item => item.pet?._id === petId ? { ...item, pet: { ...item.pet, status } } : item);
      setAppointments(prev => updateDataList(prev));
      setOutings(prev => updateDataList(prev));
      
      setToast({ message: `Pet marked as ${status}!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update pet status', type: 'error' });
    }
  };

  const currentData = activeTab === 'adoption' ? appointments : outings;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto text-gray-800">
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight uppercase">Pet Requests</h1>
            <p className="text-gray-500 font-bold mt-2">Manage incoming adoption and outing requests.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button 
              onClick={() => setActiveTab('adoption')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'adoption' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Adoption ({appointments.length})
            </button>
            <button 
              onClick={() => setActiveTab('outing')}
              className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'outing' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Outing ({outings.length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading requests...</p>
            </div>
          ) : currentData.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-6xl mb-4">{activeTab === 'adoption' ? '🏠' : '🌳'}</div>
              <h3 className="text-xl font-black text-gray-800">No {activeTab} Requests</h3>
              <p className="text-gray-500 font-bold">New requests will appear here once submitted by users.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentData.map((item) => (
                <div key={item._id} className="group p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/30 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    <div className="flex gap-6">
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-inner flex-shrink-0 ${activeTab === 'adoption' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        {item.pet?.image ? (
                           <img src={`http://localhost:5001/${item.pet.image}`} className="w-full h-full object-cover rounded-2xl" alt="" />
                        ) : "🐾"}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-xl font-black text-gray-900">{item.petName}</h3>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            item.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                            item.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                          <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <span className={activeTab === 'adoption' ? 'text-purple-500' : 'text-blue-500'}>👤</span> {item.applicantName}
                          </p>
                          <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <span className={activeTab === 'adoption' ? 'text-purple-500' : 'text-blue-500'}>📧</span> {item.email}
                          </p>
                          <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <span className={activeTab === 'adoption' ? 'text-purple-500' : 'text-blue-500'}>📞</span> {item.mobile}
                          </p>
                          <p className="text-sm font-bold text-gray-600 flex items-center gap-2">
                            <span className={activeTab === 'adoption' ? 'text-purple-500' : 'text-blue-500'}>⏰</span> {item.date ? `${item.date} @ ` : ''}{item.time}
                          </p>
                        </div>
                        {item.message && (
                            <p className="text-xs font-bold text-blue-600 mt-2 bg-blue-50 px-3 py-2 rounded-lg inline-block italic">
                                "{item.message}"
                            </p>
                        )}
                        <p className="text-sm font-bold text-gray-500 mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <span className="text-[10px] uppercase tracking-widest block mb-1 opacity-50">Address / Location</span>
                          {item.address}
                        </p>

                        {activeTab === 'adoption' && (
                           <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                              <span className="text-[10px] font-black uppercase text-gray-400">Inventory Status:</span>
                              {item.pet?.status === 'Sold' ? (
                                <button 
                                  onClick={() => handlePetStatusUpdate(item.pet._id, 'Available')}
                                  className="text-[10px] font-black text-blue-600 hover:underline"
                                >
                                  Mark as Available
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handlePetStatusUpdate(item.pet._id, 'Sold')}
                                  className="px-4 py-1.5 bg-gray-900 text-white rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all"
                                >
                                  Mark as Sold
                                </button>
                              )}
                           </div>
                        )}
                      </div>
                    </div>

                    <div className="flex lg:flex-col gap-2 justify-center min-w-[140px]">
                      {item.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateStatus(item._id, 'confirmed', activeTab)}
                            className={`flex-1 px-6 py-3 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'adoption' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                          >
                            Approve ✓
                          </button>
                          <button 
                            onClick={() => updateStatus(item._id, 'rejected', activeTab)}
                            className="flex-1 px-6 py-3 bg-white border-2 border-gray-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all"
                          >
                            Reject ✕
                          </button>
                        </>
                      )}
                      {item.status !== 'pending' && (
                        <div className="text-center">
                          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            Completed {new Date(item.updatedAt).toLocaleDateString()}
                          </p>
                          {item.pet?.status === 'Sold' && (
                            <span className="mt-2 inline-block px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-100">
                               Adopted
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
