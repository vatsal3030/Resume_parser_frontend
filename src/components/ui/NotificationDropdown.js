"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import { Bell, Sparkles, AlertCircle, FileText, CheckCircle2, Loader2, CreditCard, Briefcase, Code, ChevronRight, FileEdit, Map, MessageSquare, LayoutTemplate, AlertTriangle, Zap, GitBranch } from 'lucide-react';
import { Button } from './button';

/**
 * Notification type classification — determines color, icon, and badge text.
 */
function classifyNotification(notif) {
  const url = (notif.actionUrl || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();
  const message = (notif.message || '').toLowerCase();

  // Failed/Error notifications
  if (title.includes('failed') || title.includes('error') || message.includes('failed')) {
    return { type: 'error', label: 'Failed', color: 'red', icon: AlertCircle };
  }

  // Credit/Payment notifications
  if (url.includes('credit') || title.includes('credit') || title.includes('payment')) {
    return { type: 'credit', label: 'Credits', color: 'yellow', icon: CreditCard };
  }

  // GitHub notifications
  if (url.includes('github') || title.includes('github')) {
    return { type: 'github', label: 'GitHub', color: 'green', icon: GitBranch };
  }

  // Resume Studio
  if (url.includes('studio') || title.includes('studio')) {
    return { type: 'studio', label: 'Studio', color: 'mint', icon: FileEdit };
  }

  // Resume analysis
  if (title.includes('resume') || title.includes('analysis') || title.includes('analyze')) {
    return { type: 'analysis', label: 'Analysis', color: 'blue', icon: FileText };
  }

  // Tailor
  if (url.includes('tailor') || title.includes('tailor')) {
    return { type: 'tailor', label: 'Tailor', color: 'pink', icon: Zap };
  }

  // Cover letter
  if (url.includes('cover') || title.includes('cover letter')) {
    return { type: 'cover', label: 'Cover Letter', color: 'pink', icon: FileText };
  }

  // Interview
  if (url.includes('interview') || title.includes('interview')) {
    return { type: 'interview', label: 'Interview', color: 'mint', icon: MessageSquare };
  }

  // Roadmap
  if (url.includes('roadmap') || title.includes('roadmap')) {
    return { type: 'roadmap', label: 'Roadmap', color: 'purple', icon: Map };
  }

  // Portfolio
  if (url.includes('portfolio') || title.includes('portfolio')) {
    return { type: 'portfolio', label: 'Portfolio', color: 'orange', icon: LayoutTemplate };
  }

  // Tracker/Job
  if (url.includes('tracker') || title.includes('job')) {
    return { type: 'tracker', label: 'Tracker', color: 'blue', icon: Briefcase };
  }

  // Urgent/High priority
  if (notif.priority === 'URGENT') {
    return { type: 'urgent', label: 'Urgent', color: 'red', icon: AlertTriangle };
  }
  if (notif.priority === 'HIGH') {
    return { type: 'high', label: 'Important', color: 'orange', icon: AlertCircle };
  }

  // Default
  return { type: 'general', label: 'Update', color: 'blue', icon: Sparkles };
}

/**
 * Color mappings for notification types
 */
const TYPE_COLORS = {
  red:    { border: 'border-l-red-500',     bg: 'bg-red-50',      badge: 'bg-red-500 text-white',     icon: 'text-red-500' },
  yellow: { border: 'border-l-yellow-500',  bg: 'bg-yellow-50',   badge: 'bg-brutal-yellow text-black', icon: 'text-yellow-600' },
  green:  { border: 'border-l-green-500',   bg: 'bg-green-50',    badge: 'bg-green-500 text-white',   icon: 'text-green-600' },
  blue:   { border: 'border-l-blue-400',    bg: 'bg-blue-50',     badge: 'bg-brutal-blue text-black', icon: 'text-blue-500' },
  pink:   { border: 'border-l-pink-400',    bg: 'bg-pink-50',     badge: 'bg-brutal-pink text-black', icon: 'text-pink-500' },
  mint:   { border: 'border-l-emerald-400', bg: 'bg-emerald-50',  badge: 'bg-brutal-mint text-black', icon: 'text-emerald-500' },
  purple: { border: 'border-l-purple-400',  bg: 'bg-purple-50',   badge: 'bg-purple-400 text-white',  icon: 'text-purple-500' },
  orange: { border: 'border-l-orange-400',  bg: 'bg-orange-50',   badge: 'bg-orange-400 text-white',  icon: 'text-orange-500' },
};

import { supabase } from '@/lib/supabase';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/domain/notifications?limit=10');
      setNotifications(data);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error('Failed to fetch notifications:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset notifications on account switch or logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setNotifications([]); // Instantly clear previous account data
      if (session?.user) {
        fetchNotifications();
      }
    });

    const handleAuthReset = () => {
      setNotifications([]);
      fetchNotifications();
    };
    window.addEventListener('accountSwitched', handleAuthReset);
    window.addEventListener('AUTH_STATE_CHANGED', handleAuthReset);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('accountSwitched', handleAuthReset);
      window.removeEventListener('AUTH_STATE_CHANGED', handleAuthReset);
    };
  }, [fetchNotifications]);

  // Fetch on first open, then poll every 30s when open
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Poll for unread count every 60s regardless
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/domain/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/domain/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  /**
   * Handle notification click: mark as read + navigate if actionUrl exists.
   */
  const handleNotifClick = async (notif) => {
    // Mark as read
    if (!notif.isRead) {
      handleMarkRead(notif.id);
    }

    // Navigate to actionUrl if present
    if (notif.actionUrl) {
      setIsOpen(false);
      router.push(notif.actionUrl);
    }
  };

  /**
   * Format a timestamp into relative time.
   */
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatDate(dateString);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 border-2 border-transparent hover:border-brutal-black hover:bg-brutal-yellow transition-all rounded-none group"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-red-500 border-2 border-brutal-black text-white text-[10px] font-black px-1 group-hover:scale-110 transition-transform">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-96 bg-white border-4 border-brutal-black shadow-[6px_6px_0_rgba(0,0,0,1)] z-50 animate-in slide-in-from-top-2">
            <div className="p-4 border-b-3 border-brutal-black bg-brutal-black flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight text-white text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-black bg-brutal-yellow text-black px-2.5 py-1 border-2 border-white">
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <div className="max-h-[420px] overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
                  <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => {
                  const classification = classifyNotification(notif);
                  const Icon = classification.icon;
                  const colors = TYPE_COLORS[classification.color] || TYPE_COLORS.blue;
                  const isClickable = !!notif.actionUrl;

                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotifClick(notif)}
                      className={`p-4 border-b-2 border-gray-200 transition-all cursor-pointer group/notif border-l-4
                        ${colors.border}
                        ${notif.isRead ? 'opacity-60 hover:opacity-80 bg-white' : `${colors.bg} hover:brightness-95`}`}
                    >
                      <div className="flex gap-3">
                        <div className={`mt-0.5 shrink-0 w-9 h-9 flex items-center justify-center border-2 border-brutal-black ${notif.isRead ? 'bg-gray-100' : colors.bg}`}>
                          <Icon className={`w-4.5 h-4.5 ${colors.icon}`} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <h4 className={`font-bold text-sm leading-tight truncate ${isClickable ? 'group-hover/notif:underline underline-offset-2' : ''}`}>
                                {notif.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border ${colors.badge}`}>
                                {classification.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 leading-relaxed">{notif.message}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] font-bold text-gray-400">
                              {timeAgo(notif.createdAt)}
                            </span>
                            {isClickable && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase text-brutal-blue opacity-0 group-hover/notif:opacity-100 transition-opacity">
                                View <ChevronRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-gray-500 font-medium">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>You&apos;re all caught up!</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-2 border-t-3 border-brutal-black bg-slate-50 flex flex-col gap-1">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs font-bold hover:bg-slate-200"
                    onClick={handleMarkAllRead}
                  >
                    Mark all as read
                  </Button>
                )}
                <Button 
                  variant="default"
                  className="w-full text-xs font-black uppercase tracking-widest bg-brutal-yellow text-black border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/dashboard/notifications');
                  }}
                >
                  View All Activity
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
