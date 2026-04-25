import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import VetClinic from './pages/VetClinic';
import Inventory from './pages/Inventory';
import Analytics from './pages/Analytics';
import ManageAppointments from './pages/ManageAppointments';
import Orders from './pages/Orders';
import Notices from './pages/Notices';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PetAppointments from './pages/PetAppointments';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-outfit">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="lg:ml-64 flex flex-col min-h-screen">
            <Header onMenuOpen={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vet-clinic" element={<VetClinic />} />
                <Route path="/manage-appointments" element={<ManageAppointments />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/notices" element={<Notices />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/pet-appointments" element={<PetAppointments />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App;
