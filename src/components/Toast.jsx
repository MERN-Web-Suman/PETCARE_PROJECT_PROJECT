import React, { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    return toast; // Default to raw toast if used outside provider
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toastAction = {
    success: (msg) => toast.success(msg, {
      duration: 3000,
      icon: '✅',
      style: {
        borderRadius: '16px',
        background: '#10b981',
        color: '#fff',
        fontWeight: 'bold',
      },
    }),
    error: (msg) => toast.error(msg, {
      duration: 4000,
      icon: '❌',
      style: {
        borderRadius: '16px',
        background: '#ef4444',
        color: '#fff',
        fontWeight: 'bold',
      },
    }),
    warning: (msg) => toast(msg, {
      duration: 4000,
      icon: '⚠️',
      style: {
        borderRadius: '16px',
        background: '#f59e0b',
        color: '#fff',
        fontWeight: 'bold',
      },
    }),
    info: (msg) => toast(msg, {
      duration: 3000,
      icon: 'ℹ️',
      style: {
        borderRadius: '16px',
        background: '#3b82f6',
        color: '#fff',
        fontWeight: 'bold',
      },
    }),
  };

  return (
    <ToastContext.Provider value={toastAction}>
      {children}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          className: 'premium-toast',
          duration: 3000,
        }}
      />
    </ToastContext.Provider>
  );
};

export default ToastProvider;
