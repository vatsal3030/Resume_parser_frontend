"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import { Bell, Sparkles, AlertCircle, FileText, CheckCircle2, Loader2, CreditCard, Briefcase, Code, ChevronRight, FileEdit, Map, MessageSquare, LayoutTemplate } from 'lucide-react';
import { Button } from './button';

/**
 * Maps notification priority to visual treatment.
 */
const PRIORITY_STYLES = {
  URGENT: 'border-l-4 border-l-red-500',
  HIGH: 'border-l-4 border-l-orange-400',
  NORMAL: '',
};

/**
 * Returns a contextual icon based on the notification's actionUrl or title.
 */
function getNotifIcon(notif) {
  const url = (notif.actionUrl || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();

  if (url.includes('credit') || title.includes('credit') || title.includes('payment')) return CreditCard;
  if (url.includes('studio') || title.includes('resume')) return FileEdit;
  if (url.includes('tailor')) return FileText;
  if (url.includes('cover')) return FileText;
  if (url.includes('interview') || title.includes('interview')) return MessageSquare;
  if (url.includes('roadmap') || title.includes('roadmap')) return Map;
  if (url.includes('github') || title.includes('github')) return Code;
  if (url.includes('portfolio')) return LayoutTemplate;
  if (url.includes('tracker') || title.includes('job')) return Briefcase;
  if (notif.priority === 'HIGH' || notif.priority === 'URGENT') return AlertCircle;
  return Sparkles;
}

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
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brutal-pink border-2 border-brutal-black rounded-full group-hover:animate-ping"></span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 mt-2 w-80 bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] z-50 animate-in slide-in-from-top-2">
            <div className="p-4 border-b-2 border-brutal-black bg-brutal-bg flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs font-bold bg-black text-white px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {loading && notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin opacity-50" />
                  <p className="text-gray-500 text-sm font-medium">Loading...</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => {
                  const Icon = getNotifIcon(notif);
                  const isClickable = !!notif.actionUrl;

                  return (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotifClick(notif)}
                      className={`p-4 border-b-2 border-brutal-black transition-colors cursor-pointer group/notif
                        ${notif.isRead ? 'opacity-60 hover:opacity-80' : 'bg-white hover:bg-brutal-yellow/10'} 
                        ${PRIORITY_STYLES[notif.priority] || ''}`}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1 shrink-0">
                          <Icon className={`w-5 h-5 ${notif.priority === 'URGENT' ? 'text-red-500' : notif.priority === 'HIGH' ? 'text-orange-500' : 'text-brutal-blue'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-bold text-sm leading-tight ${isClickable ? 'group-hover/notif:underline underline-offset-2' : ''}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                              {timeAgo(notif.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                          {isClickable && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black uppercase text-brutal-blue mt-1.5 opacity-0 group-hover/notif:opacity-100 transition-opacity">
                              View <ChevronRight className="w-3 h-3" />
                            </span>
                          )}
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
              <div className="p-2 border-t-2 border-brutal-black bg-slate-50 flex flex-col gap-1">
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
