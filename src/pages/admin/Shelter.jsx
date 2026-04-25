import React, { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Shelter() {
  const [shelter, setShelter] = useState({
    name: 'Happy Hearts Animal Shelter',
    email: 'info@happyhearts.org',
    phone: '+1 (555) 987-6543',
    address: '456 Oak Avenue, Pet City',
    capacity: 150,
    currentAnimals: 87,
    adoptedThisMonth: 12,
    volunteerCount: 24,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(shelter);
  const [adoptions, setAdoptions] = useState([]);

  useEffect(() => {
    const fetchAdoptions = async () => {
      try {
        const res = await api.get('/adoptions');
        setAdoptions(res.data || []);
      } catch (err) {
        console.error('Failed to load adoptions', err);
      }
    };
    fetchAdoptions();
  }, []);

  const updateAdoptionStatus = async (id, status) => {
    try {
      const res = await api.put(`/adoptions/${id}`, { status });
      setAdoptions((prev) => prev.map((a) => (a._id === id ? res.data : a)));
    } catch (err) {
      console.error(err);
      alert('Failed to update adoption');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    setShelter(formData);
    setIsEditing(false);
    alert('Shelter information updated successfully!');
  };

  const occupancyRate = ((shelter.currentAnimals / shelter.capacity) * 100).toFixed(1);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shelter Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-2">Current Animals</p>
          <p className="text-3xl font-bold text-blue-600">{shelter.currentAnimals}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-2">Occupancy Rate</p>
          <p className="text-3xl font-bold text-green-600">{occupancyRate}%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Adoption Cases</h2>
        <div className="space-y-4">
          {adoptions.length === 0 && <p className="text-gray-600">No adoptions yet.</p>}
          {adoptions.map((a) => (
            <div key={a._id} className="flex items-center justify-between p-4 border rounded">
              <div><p className="font-semibold">{a.petName} — {a.breed}</p><p className="text-sm">Status: {a.status}</p></div>
              <div className="flex gap-2">
                <button onClick={() => updateAdoptionStatus(a._id, 'adopted')} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Mark Adopted</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
