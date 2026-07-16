"use client";
import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const TOAST_ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const TOAST_STYLES = {
  success: 'bg-brutal-green border-brutal-black text-black',
  error: 'bg-red-500 border-brutal-black text-white',
  warning: 'bg-brutal-yellow border-brutal-black text-black',
  info: 'bg-brutal-blue border-brutal-black text-white',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const recentToastsRef = useRef(new Map()); // dedup: key -> timestamp

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000, action }) => {
    // Deduplication: skip if same title+message was added within last 3 seconds
    const dedupeKey = `${type}:${(title || '').toLowerCase().trim()}:${(message || '').toLowerCase().trim()}`;
    const now = Date.now();
    const lastTime = recentToastsRef.current.get(dedupeKey);
    if (lastTime && now - lastTime < 3000) {
      return -1; // Skip duplicate
    }
    recentToastsRef.current.set(dedupeKey, now);
    // Cleanup old entries every 50 toasts
    if (recentToastsRef.current.size > 50) {
      for (const [key, time] of recentToastsRef.current) {
        if (now - time > 5000) recentToastsRef.current.delete(key);
      }
    }

    const id = ++toastIdRef.current;
    
    setToasts(prev => {
      const next = [...prev, { id, type, title, message, action, exiting: false }];
      // Max 5 concurrent toasts — remove oldest non-action toast if exceeded
      if (next.length > 5) {
        const oldestIdx = next.findIndex(t => !t.action && !t.exiting);
        if (oldestIdx !== -1) {
          next.splice(oldestIdx, 1);
        }
      }
      return next;
    });

    // Auto-dismiss
    if (duration > 0 && !action) {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 300);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  // Convenience methods
  const toast = {
    success: (title, message, action) => addToast({ type: 'success', title, message, action }),
    error: (title, message, action) => addToast({ type: 'error', title, message, duration: 6000, action }),
    warning: (title, message, action) => addToast({ type: 'warning', title, message, duration: 5000, action }),
    info: (title, message, action) => addToast({ type: 'info', title, message, action }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container — fixed top-right */}
      <div 
        className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none"
        style={{ maxWidth: '420px', width: '100%' }}
      >
        {toasts.map((t) => {
          const Icon = TOAST_ICONS[t.type] || Info;
          return (
            <div
              key={t.id}
              className={`
                pointer-events-auto
                flex items-start gap-3 p-4 
                border-4 shadow-[4px_4px_0_rgba(0,0,0,1)]
                ${TOAST_STYLES[t.type]}
                ${t.exiting ? 'animate-toast-exit' : 'animate-toast-enter'}
              `}
              role="alert"
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={3} />
              <div className="flex-1 min-w-0">
                {t.title && (
                  <p className="font-black text-sm uppercase tracking-wide leading-tight">{t.title}</p>
                )}
                {t.message && (
                  <p className="font-bold text-sm mt-0.5 opacity-90 leading-snug">{t.message}</p>
                )}
                {t.action && (
                  <button 
                    onClick={() => {
                      t.action.onClick();
                      removeToast(t.id);
                    }}
                    className="mt-2 text-xs font-black uppercase tracking-wider underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 hover:opacity-70 transition-opacity"
                aria-label="Close"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications anywhere.
 * 
 * Usage:
 *   const toast = useToast();
 *   toast.success('Uploaded!', 'Your resume has been submitted.');
 *   toast.error('Failed', 'Something went wrong.');
 *   toast.warning('Heads up', 'You have 3 credits left.');
 *   toast.info('Processing', 'AI is analyzing your resume...');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return context;
}
