import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useToast } from "../components/Toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // Access authenticated user to get ID
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    // Only connect if user is logged in
    if (!user || (!user.id && !user._id)) return;

    // Use environment variable or fallback to localhost
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || "http://localhost:5001";
    
    console.log(`🔌 Attempting to connect User Socket: ${SOCKET_URL}`);
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("✅ User Notification Server Connected!");
      toast.info("Notification System Connected! 🔔");
      // Automatically join the user's private notification room
      const userId = user.id || user._id;
      if (userId) {
        socket.emit("join-user-room", userId);
        console.log(`📡 Joining private room: user-${userId}`);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      toast.error(`Notification Error: ${err.message}`);
    });

    // Handle audio sound alert
    const playNotificationSound = () => {
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(e => console.log("🔇 Audio play blocked by browser:", e));
      } catch (err) {
        console.error("Failed to play notification sound", err);
      }
    };

    // Listen to personal user notifications from Provider actions
    const handleUserNotification = (data) => {
      console.log("🔔 Received real-time notification:", data);
      
      // Play beep sound!
      playNotificationSound();

      setNotifications((prev) => [
        {
          id: `u-notif-${Date.now()}`,
          type: data.type || "info",
          title: data.title || "New Update",
          message: data.message || "You have a new notification.",
          timestamp: new Date().toISOString(),
          isRead: false,
          data: data.payload || null,
        },
        ...prev,
      ]);
    };

    socket.on("user-notification", handleUserNotification);

    // [DEBUG] Listen for ANY broadcast to test connection
    socket.on("global-debug-message", (data) => {
      console.log("🛠️ Received GLOBAL debug message:", data);
      toast.warning(`Broadcast Debug: ${data.message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("user-notification", handleUserNotification);
      socket.disconnect();
    };
  }, [user]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
