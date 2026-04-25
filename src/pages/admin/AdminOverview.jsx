import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import StatCard from '../../components/admin/StatCard';
import api from '../../services/api';

export default function AdminOverview() {
  const [stats, setStats] = useState({
    appointments: 24,
    pets: 156,
    revenue: '$12,540',
    requests: 8,
  });
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: 'New appointment booking', time: '2 hours ago', type: 'appointment' },
    { id: 2, action: 'Pet admitted to shelter', time: '4 hours ago', type: 'shelter' },
    { id: 3, action: 'Payment received', time: '1 day ago', type: 'payment' },
    { id: 4, action: 'New veterinary request', time: '2 days ago', type: 'request' },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/provider/stats');
        if (response?.data) setStats((s) => ({
          appointments: response.data.appointments || s.appointments,
          pets: s.pets,
          revenue: s.revenue,
          requests: s.requests,
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');

    socket.on('appointment-created', (appointment) => {
      setRecentActivity((prev) => [
        { id: appointment._id || Date.now(), action: 'New appointment booking', time: 'just now', type: 'appointment' },
        ...prev
      ]);
      setStats((s) => ({ ...s, appointments: (Number(s.appointments) || 0) + 1 }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your practice today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon="📋" title="Appointments" value={stats.appointments} trend={12} color="blue" />
        <StatCard icon="🐾" title="Active Pets" value={stats.pets} trend={5} color="green" />
        <StatCard icon="💰" title="Revenue" value={stats.revenue} trend={8} color="purple" />
        <StatCard icon="📬" title="Pending Requests" value={stats.requests} trend={-2} color="red" />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div>
                <p className="font-semibold text-gray-900">{activity.action}</p>
                <p className="text-gray-600 text-sm">{activity.time}</p>
              </div>
              <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold">{activity.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
