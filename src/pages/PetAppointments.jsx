import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import { getOwnerPetAppointments, getRequesterPetAppointments, updatePetAppointmentStatus } from '../services/petAppointmentService';
import { getOwnerOutingRequests, getRequesterOutingRequests, updateOutingRequestStatus } from '../services/outingService';
import { updatePetStatus } from '../services/petService';

const PetAppointments = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({
    received_adoption: [],
    sent_adoption: [],
    received_outing: [],
    sent_outing: []
  });
  const [activeTab, setActiveTab] = useState('adoption'); // adoption / outing
  const [activeView, setActiveView] = useState('received'); // received / sent
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rAdopt, sAdopt, rOuting, sOuting] = await Promise.all([
        getOwnerPetAppointments(),
        getRequesterPetAppointments(),
        getOwnerOutingRequests(),
        getRequesterOutingRequests()
      ]);
      setData({
        received_adoption: rAdopt.data || [],
        sent_adoption: sAdopt.data || [],
        received_outing: rOuting.data || [],
        sent_outing: sOuting.data || []
      });
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, type) => {
    try {
      if (type === 'adoption') {
        await updatePetAppointmentStatus(id, status);
        setData(prev => ({
          ...prev,
          received_adoption: prev.received_adoption.map(appt => appt._id === id ? { ...appt, status } : appt)
        }));
      } else {
        await updateOutingRequestStatus(id, status);
        setData(prev => ({
          ...prev,
          received_outing: prev.received_outing.map(out => out._id === id ? { ...out, status } : out)
        }));
      }
      setToast({ message: `Request ${status} successfully!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update status', type: 'error' });
    }
  };

  const handlePetStatusUpdate = async (petId, status) => {
    try {
      await updatePetStatus(petId, status);
      // Update local state for both adoption and outing received lists
      const updateList = (list) => list.map(item => item.pet?._id === petId ? { ...item, pet: { ...item.pet, status } } : item);
      setData(prev => ({
        ...prev,
        received_adoption: updateList(prev.received_adoption),
        received_outing: updateList(prev.received_outing)
      }));
      setToast({ message: `Pet marked as ${status}!`, type: 'success' });
    } catch (err) {
      setToast({ message: 'Failed to update pet status', type: 'error' });
    }
  };

  const currentListKey = `${activeView}_${activeTab}`;
  const currentList = data[currentListKey] || [];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 font-outfit">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-fade-in text-gray-800">
        <div className="mb-12 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
            <div>
                <h1 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4 italic">
                    {activeTab === 'adoption' ? 'Adoption' : 'Outing'} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Requests</span>
                </h1>
                <p className="text-gray-500 font-bold ml-1">
                    {activeView === 'received' ? 'Requests you\'ve received from others.' : 'Requests you\'ve sent to pet owners.'}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                {/* Adoption / Outing Toggle */}
                <div className="flex bg-white/60 p-1.5 rounded-[2rem] border border-purple-100 shadow-2xl backdrop-blur-md">
                    <button 
                    onClick={() => setActiveTab('adoption')}
                    className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'adoption' ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl' : 'text-gray-400 hover:text-purple-600'}`}
                    >
                    <span>🏠</span> Adoptions ({data.received_adoption.length + data.sent_adoption.length})
                    </button>
                    <button 
                    onClick={() => setActiveTab('outing')}
                    className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'outing' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-xl' : 'text-gray-400 hover:text-blue-600'}`}
                    >
                    <span>🌳</span> Outings ({data.received_outing.length + data.sent_outing.length})
                    </button>
                </div>

                {/* Received / Sent Toggle */}
                <div className="flex bg-gray-900/5 p-1.5 rounded-[2rem] border border-gray-200 shadow-inner">
                    <button 
                    onClick={() => setActiveView('received')}
                    className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeView === 'received' ? 'bg-white text-gray-900 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    📥 Received ({data[`received_${activeTab}`].length})
                    </button>
                    <button 
                    onClick={() => setActiveView('sent')}
                    className={`px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${activeView === 'sent' ? 'bg-white text-gray-900 shadow-md border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                    📤 Sent ({data[`sent_${activeTab}`].length})
                    </button>
                </div>
            </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader message="Synchronizing requests..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {currentList.length > 0 ? (
              currentList.map(item => (
                <div key={item._id} className={`bg-white rounded-[2.5rem] shadow-xl border p-8 hover:shadow-2xl transition-all duration-300 relative group overflow-hidden ${activeTab === 'adoption' ? 'border-purple-100 hover:border-purple-200' : 'border-blue-100 hover:border-blue-200'}`}>
                    {/* Background decoration */}
                    <div className={`absolute top-0 right-0 w-64 h-64 opacity-5 rounded-full blur-3xl -mt-32 -mr-32 pointer-events-none ${activeTab === 'adoption' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>

                    <div className="flex flex-col lg:flex-row justify-between gap-10">
                        <div className="flex gap-8">
                            <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner border-2 border-white/80 overflow-hidden flex-shrink-0 transform group-hover:scale-105 transition-transform duration-500 ${activeTab === 'adoption' ? 'bg-gradient-to-br from-purple-100 to-pink-100' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}`}>
                                {item.pet?.image ? (
                                    <img src={`http://localhost:5001/${item.pet.image}`} className="w-full h-full object-cover" alt="" />
                                ) : "🐾"}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-4 mb-4">
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{item.petName}</h3>
                                    <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border-2 ${
                                        item.status === 'confirmed' ? 'bg-green-50 text-green-600 border-green-100' :
                                        item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                        'bg-red-50 text-red-600 border-red-100'
                                    }`}>
                                        {item.status}
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 mt-6 text-sm font-bold text-gray-600">
                                    <div className="flex items-center gap-4 group/item">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover/item:scale-110 transition-all ${activeTab === 'adoption' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                            {activeView === 'received' ? '👤' : '👑'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{activeView === 'received' ? 'Applicant' : 'Owner'}</p>
                                            <p className="text-gray-900 capitalize text-base">{activeView === 'received' ? item.applicantName : (item.owner?.name || 'Owner')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group/item">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover/item:scale-110 transition-all ${activeTab === 'adoption' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                            📧
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Contact Email</p>
                                            <p className="text-gray-900 text-base">{activeView === 'received' ? item.email : (item.owner?.email || item.email)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group/item">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover/item:scale-110 transition-all ${activeTab === 'adoption' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                            📞
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Mobile Phone</p>
                                            <p className="text-gray-900 text-base">{item.mobile}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group/item">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover/item:scale-110 transition-all ${activeTab === 'adoption' ? 'bg-purple-50 text-purple-500' : 'bg-blue-50 text-blue-500'}`}>
                                            📅
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Date & Time</p>
                                            <p className="text-gray-900 text-base">{item.date ? `${item.date} @ ` : ''}{item.time}</p>
                                        </div>
                                    </div>
                                </div>

                                {item.message && (
                                   <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-l-4 border-blue-400 text-sm italic font-bold text-gray-700 shadow-inner">
                                       "{item.message}"
                                   </div>
                                )}
                                
                                <div className="mt-8 p-6 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{activeTab === 'adoption' ? 'Residential Address' : 'Pick-up / Meetup Location'}</p>
                                    <p className="font-bold text-gray-800 text-lg leading-snug">{item.address}</p>
                                </div>

                                {activeView === 'received' && activeTab === 'adoption' && (
                                   <div className="mt-6 flex items-center gap-4 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-100">
                                       <p className="text-xs font-black text-yellow-700 uppercase tracking-widest">Pet Status:</p>
                                       {item.pet?.status === 'Sold' ? (
                                         <button 
                                           onClick={() => handlePetStatusUpdate(item.pet._id, 'Available')}
                                           className="px-6 py-2 bg-white border-2 border-yellow-200 text-yellow-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-100 transition-all"
                                         >
                                           Mark as Available 🔙
                                         </button>
                                       ) : (
                                         <button 
                                           onClick={() => handlePetStatusUpdate(item.pet._id, 'Sold')}
                                           className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all"
                                         >
                                           Mark as Sold / Adopted 🏆
                                         </button>
                                       )}
                                   </div>
                                )}
                            </div>
                        </div>

                        <div className="flex lg:flex-col gap-3 justify-center min-w-[200px] xl:border-l-2 xl:border-gray-50 xl:pl-10">
                            {activeView === 'received' && item.status === 'pending' ? (
                                <>
                                    <button 
                                        onClick={() => handleStatusUpdate(item._id, 'confirmed', activeTab)}
                                        className={`flex-1 px-8 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all shadow-xl ${activeTab === 'adoption' ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-purple-500/20' : 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-blue-500/20'}`}
                                    >
                                        Approve ✓
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(item._id, 'rejected', activeTab)}
                                        className="flex-1 px-8 py-4 bg-white border-2 border-gray-100 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transform hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Reject ✕
                                    </button>
                                </>
                            ) : (
                                <div className="text-center lg:text-right">
                                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Request Timestamp</p>
                                        <p className="font-bold text-gray-600 text-base">{new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        <p className="text-[10px] font-bold text-gray-400">{new Date(item.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className={`mt-4 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block ${
                                        item.status === 'confirmed' ? 'text-green-500 bg-green-50' :
                                        item.status === 'pending' ? 'text-amber-500 bg-amber-50' :
                                        'text-red-500 bg-red-50'
                                    }`}>
                                        {activeView === 'sent' ? `Owner ${item.status}` : `Successfully ${item.status}`}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
              ))
            ) : (
              <div className="py-40 text-center bg-white rounded-[4rem] border-4 border-dashed border-gray-100 shadow-inner flex flex-col items-center justify-center animate-in fade-in zoom-in duration-700">
                <div className="relative mb-10">
                    <div className={`absolute inset-0 rounded-full blur-3xl opacity-20 animate-pulse ${activeTab === 'adoption' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>
                    <span className="text-8xl relative z-10">{activeView === 'received' ? '📥' : '📤'}</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter uppercase italic">No {activeTab}s Found</h3>
                <p className="text-gray-400 font-bold max-w-sm text-lg mb-10 leading-relaxed">
                    {activeView === 'received' 
                      ? `When users apply for your pets, they will appear here in the "${activeTab}" list.` 
                      : `You haven't sent any ${activeTab} requests yet. Start exploring pets!`}
                </p>
                {activeView === 'sent' && (
                    <button 
                        onClick={() => window.location.href = '/adoption'}
                        className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-2xl"
                    >
                        Explore Pets &rarr;
                    </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default PetAppointments;
