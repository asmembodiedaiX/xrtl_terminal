import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#2d7d46';
      case 'error':
        return '#c42b1c';
      case 'warning':
        return '#b36b00';
      case 'info':
        return '#0f4c81';
      default:
        return '#2d2d2d';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M5 8L7 10L11 6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L15 14H1L8 1Z" stroke="#ffffff" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 6V9M8 11V11.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#ffffff" strokeWidth="1.5"/>
            <path d="M8 7V11M8 5V5.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: getBackgroundColor(),
        color: '#ffffff',
        padding: '12px 20px',
        borderRadius: 8,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 9999,
        animation: 'slideUp 0.3s ease-out',
        minWidth: 280,
        maxWidth: 450
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
          }
          @keyframes slideDown {
            from {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }
            to {
              opacity: 0;
              transform: translateX(-50%) translateY(20px);
            }
          }
        `}
      </style>
      {getIcon()}
      <span style={{ fontSize: 13, fontWeight: 500 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: 4,
          opacity: 0.8,
          transition: 'opacity 0.15s'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );
};

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export default Toast;