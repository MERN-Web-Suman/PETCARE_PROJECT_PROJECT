import React, { useState } from 'react';

export default function Analytics() {
  const [appointmentData] = useState([
    { month: 'Jan', appointments: 65, completed: 52 },
    { month: 'Feb', appointments: 75, completed: 61 },
    { month: 'Mar', appointments: 85, completed: 70 },
  ]);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Analytics & Reports</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Appointments Trend</h2>
          <div className="space-y-4">
            {appointmentData.map((data, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1 text-sm font-semibold"><span>{data.month}</span><span>{data.appointments} appts</span></div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${(data.appointments / 150) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
