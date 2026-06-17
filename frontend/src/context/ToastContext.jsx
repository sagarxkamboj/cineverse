import React, { createContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map((toast) => {
          let Icon = Info;
          let bgColor = 'bg-zinc-900 border-zinc-800 text-zinc-300';
          let iconColor = 'text-blue-500';

          if (toast.type === 'success') {
            Icon = CheckCircle;
            bgColor = 'bg-zinc-900/95 border-emerald-500/30 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            bgColor = 'bg-zinc-900/95 border-red-500/30 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
            iconColor = 'text-red-400';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            bgColor = 'bg-zinc-900/95 border-yellow-500/30 text-yellow-100 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
            iconColor = 'text-yellow-400';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start justify-between p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-fade-in ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
                <span className="text-sm font-semibold tracking-tight">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors ml-3 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
