import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const notifySuccess = (msg) => addToast(msg, 'success');
  const notifyError = (msg) => addToast(msg, 'error');
  const notifyInfo = (msg) => addToast(msg, 'info');

  return (
    <NotificationContext.Provider
      value={{
        addToast,
        notifySuccess,
        notifyError,
        notifyInfo
      }}
    >
      {children}
      {/* Toast rendering portal */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        maxWidth: '380px'
      }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.85rem 1.15rem',
              background: '#FFFFFF',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(44, 24, 16, 0.15)',
              borderLeft: `4px solid ${
                toast.type === 'success'
                  ? '#2E7D32'
                  : toast.type === 'error'
                  ? '#C62828'
                  : '#C59B27'
              }`,
              color: '#2C1810',
              fontSize: '0.92rem',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} color="#2E7D32" />}
            {toast.type === 'error' && <AlertCircle size={18} color="#C62828" />}
            {toast.type === 'info' && <Info size={18} color="#C59B27" />}
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', color: '#8D7668', display: 'flex' }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
