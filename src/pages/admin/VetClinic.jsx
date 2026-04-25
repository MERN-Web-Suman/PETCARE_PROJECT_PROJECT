import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../../services/api';

export default function VetClinic() {
  const [clinic, setClinic] = useState({
    name: 'Sunny Paws Veterinary Clinic',
    email: 'contact@sunnypaws.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Pet City',
    specialties: ['General Care', 'Surgery', 'Dentistry'],
    workingHours: '9:00 AM - 6:00 PM',
    availableDoctors: 3,
    totalAppointmentsMonthly: 156,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(clinic);
  const [appointments, setAppointments] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/provider/appointments', {
          params: { page, limit, status: statusFilter || undefined }
        });
        if (!mounted) return;
        setAppointments(res.data.data || []);
        setTotal(res.data.total || 0);
      } catch (err) {
        console.error('Failed to load provider appointments', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAppointments();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001');
    socket.on('appointment-updated', () => { fetchAppointments(); });
    socket.on('appointment-created', () => { fetchAppointments(); });

    return () => { mounted = false; socket.disconnect(); };
  }, [page, limit, statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      const res = await api.put(`/provider/appointments/${id}`, { status });
      setAppointments((prev) => prev.map((a) => (a._id === id ? res.data : a)));
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update appointment status');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setClinic(formData);
    setIsEditing(false);
    alert('Clinic information updated successfully!');
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Vet Clinic Management</h1>
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Clinic Information</h2>
          <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        </div>
        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><p className="text-gray-600 text-sm">Clinic Name</p><p className="text-xl font-semibold text-gray-900">{clinic.name}</p></div>
            <div><p className="text-gray-600 text-sm">Email</p><p className="text-xl font-semibold text-gray-900">{clinic.email}</p></div>
            <div><p className="text-gray-600 text-sm">Phone</p><p className="text-xl font-semibold text-gray-900">{clinic.phone}</p></div>
            <div><p className="text-gray-600 text-sm">Address</p><p className="text-xl font-semibold text-gray-900">{clinic.address}</p></div>
            <div><p className="text-gray-600 text-sm">Working Hours</p><p className="text-xl font-semibold text-gray-900">{clinic.workingHours}</p></div>
            <div><p className="text-gray-600 text-sm">Available Doctors</p><p className="text-xl font-semibold text-gray-900">{clinic.availableDoctors}</p></div>
          </div>
        ) : (
          <form className="space-y-4">
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Clinic Name" />
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" placeholder="Email" />
            <button type="button" onClick={handleSave} className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">Save Changes</button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Manage Appointments</h2>
        <div className="space-y-4">
          {loading && <p>Loading...</p>}
          {appointments.map((appt) => (
            <div key={appt._id} className="flex items-center justify-between p-4 border rounded">
              <div><p className="font-semibold">{appt.user?.name || appt.user?.email}</p><p className="text-xs">{new Date(appt.date).toLocaleString()}</p></div>
              <div className="flex gap-2">
                <button onClick={() => updateStatus(appt._id, 'confirmed')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Accept</button>
                <button onClick={() => updateStatus(appt._id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded text-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
