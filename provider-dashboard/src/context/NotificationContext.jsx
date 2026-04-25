import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Track unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
    console.log('Attempting to connect to socket server at:', SOCKET_URL);
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });
    // 1. New Appointments
    const handleNewAppointment = (appointment) => {
      setNotifications(prev => [{
        id: `appt-${Date.now()}`,
        type: 'appointment',
        title: 'New Appointment Booked',
        message: `${appointment.petName || 'A pet'} has a new appointment on ${new Date(appointment.date).toLocaleDateString()}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        data: appointment
      }, ...prev]);
    };

    // 2. New Orders
    const handleNewOrder = (order) => {
      setNotifications(prev => [{
        id: `order-${Date.now()}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${order._id?.slice(-6) || 'N/A'} placed for ₹${order.totalAmount || 0}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        data: order
      }, ...prev]);
    };

    // 3. SOS Alerts
    const handleSOS = (sosData) => {
      setNotifications(prev => [{
        id: `sos-${Date.now()}`,
        type: 'sos',
        title: '🚨 EMERGENCY SOS',
        message: `Emergency reported! Contact: ${sosData.phone || 'N/A'}. Location: ${sosData.locationInfo?.city || 'Unknown'}.`,
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'high',
        data: sosData
      }, ...prev]);
    };

    socket.on('connect', () => console.log('✅ Connected to Notification Server!'));
    socket.on('connect_error', (err) => console.log('❌ Socket connection error:', err.message));

    socket.on('appointment-created', handleNewAppointment);
    socket.on('order-placed', handleNewOrder);
    socket.on('receive-sos', handleSOS);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('appointment-created', handleNewAppointment);
      socket.off('order-placed', handleNewOrder);
      socket.off('receive-sos', handleSOS);
      socket.disconnect();
    };
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
