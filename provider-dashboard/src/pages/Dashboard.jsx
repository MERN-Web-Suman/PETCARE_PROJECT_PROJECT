import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import StatCard from '../components/StatCard';
import api from '../services/api';

export default function Dashboard() {
  const [sosAlerts, setSosAlerts] = useState([]);
  const [selectedSOS, setSelectedSOS] = useState(null);
  const [stats, setStats] = useState({
    appointments: 0,
    inventory: 0,
    revenue: '$0',
    orders: 0,
    pendingOrders: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const handleCancelSOS = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this emergency alert? This will permanently delete the record.")) return;
    try {
      await api.delete(`/sos/${id}`);
      setSosAlerts(prev => prev.filter(alert => alert._id !== id));
    } catch (err) {
      console.error("Failed to delete SOS alert:", err);
      alert("Error removing alert. Please try again.");
    }
  };

  const handleViewDetails = async (id) => {
    try {
      const res = await api.get(`/sos/${id}`);
      setSelectedSOS(res.data);
    } catch (err) {
      console.error("Failed to fetch SOS details:", err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/provider/stats');
        if (statsRes?.data) {
          setStats({
            appointments: statsRes.data.appointments,
            inventory: statsRes.data.inventoryCount,
            revenue: `$${statsRes.data.totalRevenue}`,
            orders: statsRes.data.orderCount,
            pendingOrders: statsRes.data.pendingOrders
          });
        }
        
        const sosRes = await api.get('/sos');
        setSosAlerts(sosRes.data || []);

        const activityRes = await api.get('/provider/activity');
        setRecentActivity(activityRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    
    socket.on('sos-triggered', (data) => {
      setSosAlerts(prev => [data, ...prev].slice(0, 10));
    });

    socket.on('appointment-created', (appointment) => {
      const newActivity = {
        _id: appointment._id || Date.now(),
        type: 'appointment',
        action: `New appointment: ${appointment.petName} (${appointment.reason})`,
        timestamp: new Date().toISOString(),
        icon: '📅',
        color: 'blue'
      };
      setRecentActivity(prev => [newActivity, ...prev].slice(0, 15));
      setStats((s) => ({ ...s, appointments: s.appointments + 1 }));
    });

    socket.on('order-placed', (order) => {
      const newActivity = {
        _id: order._id || Date.now(),
        type: 'order',
        action: `New order from ${order.shippingDetails?.name || 'Customer'}`,
        timestamp: new Date().toISOString(),
        icon: '🛍️',
        color: 'emerald'
      };
      setRecentActivity(prev => [newActivity, ...prev].slice(0, 15));
      setStats((s) => ({ 
        ...s, 
        orders: s.orders + 1,
        pendingOrders: s.pendingOrders + 1
      }));
    });

    socket.on('inventory-created', (product) => {
      const newActivity = {
        _id: product._id || Date.now(),
        type: 'inventory',
        action: `Added to inventory: ${product.name}`,
        timestamp: new Date().toISOString(),
        icon: '📦',
        color: 'amber'
      };
      setRecentActivity(prev => [newActivity, ...prev].slice(0, 15));
      setStats((s) => ({ ...s, inventory: s.inventory + 1 }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 flex flex-col gap-6 sm:gap-8 relative">
      {/* SOS ALERTS SECTION */}
      {sosAlerts.length > 0 && (
        <div className="animate-fade-in">
          <div className="bg-red-600 rounded-3xl p-1 shadow-2xl shadow-red-500/30">
            <div className="bg-white rounded-[22px] p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl animate-bounce">🚨</span>
                  <h2 className="text-lg sm:text-2xl font-black text-red-600 uppercase tracking-tight">Active SOS Alerts</h2>
                </div>
                <span className="px-3 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Immediate Response Required</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sosAlerts.slice(0, 4).map((alert) => (
                  <div key={alert._id} className="bg-red-50 border-2 border-red-100 rounded-2xl p-5 hover:border-red-300 transition-all group relative">
                    <button 
                      onClick={() => handleCancelSOS(alert._id)}
                      className="absolute top-4 right-4 p-2 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Cancel Emergency"
                    >
                      🗑️
                    </button>
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-3 py-1 bg-white text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-200">
                        {alert.emergencyType}
                      </span>
                      <span className="text-[10px] font-bold text-red-400">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{alert.petName}</h3>
                    <p className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1.5">
                      <span className="text-red-500">📍</span> {alert.location}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-red-100">
                      <a href={`tel:${alert.petContactNumber}`} className="text-sm font-black text-red-600 hover:underline">
                        📞 {alert.petContactNumber}
                      </a>
                      <button 
                        onClick={() => handleViewDetails(alert._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-tight hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SOS DETAILS MODAL */}
      {selectedSOS && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="bg-red-600 p-8 text-white relative">
              <button 
                onClick={() => setSelectedSOS(null)}
                className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">🚨</span>
                <span className="px-4 py-1.5 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest border border-white/20">Emergency SOS</span>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tight">{selectedSOS.petName || 'Unknown Pet'}</h2>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Emergency Type</label>
                  <p className="text-xl font-black text-red-600 uppercase">{selectedSOS.emergencyType}</p>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">Time Logged</label>
                  <p className="text-xl font-black text-gray-800">{new Date(selectedSOS.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Location</label>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-2xl text-red-500">📍</span>
                  <p className="text-lg font-bold text-gray-900">{selectedSOS.location}</p>
                </div>
              </div>

              {selectedSOS.description && (
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Instructions / Details</label>
                  <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100 text-gray-700 font-medium leading-relaxed italic">
                    "{selectedSOS.description}"
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-xl">
                      {selectedSOS.author?.name ? selectedSOS.author.name[0].toUpperCase() : 'U'}
                   </div>
                   <div>
                      <p className="font-black text-gray-900">{selectedSOS.author?.name || 'Authorized User'}</p>
                      <p className="text-xs font-bold text-gray-400">{selectedSOS.author?.email || 'No email provided'}</p>
                   </div>
                </div>
                <a 
                  href={`tel:${selectedSOS.petContactNumber}`}
                  className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                >
                   <span>📞</span> Call Critical Help
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="flex flex-wrap justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight uppercase">Control System</h1>
          <p className="text-gray-500 mt-2 font-bold text-sm sm:text-lg">Manage your entire practice from one central hub</p>
        </div>
        <div className="bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          <span className="font-black text-gray-700 uppercase tracking-widest text-xs">System Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mb-4">
        <StatCard
          icon="📋"
          title="Appointments"
          value={stats.appointments}
          trend={12}
          color="blue"
        />
        <StatCard
          icon="📦"
          title="Inventory Items"
          value={stats.inventory}
          trend={0}
          color="green"
        />
        <StatCard
          icon="💰"
          title="Total Revenue"
          value={stats.revenue}
          trend={0}
          color="purple"
        />
        <StatCard
          icon="🛒"
          title="Pending Orders"
          value={stats.pendingOrders}
          trend={0}
          color="red"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-inner">⚡</div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Recent Activity</h2>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">Live Stream — Last 5 Days</span>
        </div>
        
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity._id || activity.id}
                className="group flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 bg-${activity.color || 'blue'}-50 text-2xl rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    {activity.icon || '📝'}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 text-lg leading-tight mb-1">{activity.action}</p>
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-wider">
                       <span>📅 {new Date(activity.timestamp).toLocaleDateString()}</span>
                       <span className="opacity-30">•</span>
                       <span>⏰ {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 bg-${activity.color || 'blue'}-50 text-${activity.color || 'blue'}-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-${activity.color || 'blue'}-100`}>
                  {activity.type}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center">
               <div className="text-6xl mb-4 opacity-20">📡</div>
               <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No recent activity detected in the last 5 days.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
