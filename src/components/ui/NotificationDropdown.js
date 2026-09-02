"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  Bell, 
  Sparkles, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  CreditCard, 
  Briefcase, 
  ChevronRight, 
  FileEdit, 
  Map, 
  MessageSquare, 
  LayoutTemplate, 
  AlertTriangle, 
  Zap, 
  GitBranch,
  XCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

function classifyNotification(notif) {
  const url = (notif.actionUrl || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();
  const message = (notif.message || '').toLowerCase();

  if (title.includes('failed') || title.includes('error') || message.includes('failed')) {
    return { type: 'error', label: 'Failed', icon: XCircle, iconColor: 'text-red-500', iconBg: 'bg-red-500/10 border-red-500/20' };
  }
  if (url.includes('credit') || title.includes('credit') || title.includes('payment')) {
    return { type: 'credit', label: 'Credits', icon: CreditCard, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10 border-amber-500/20' };
  }
  if (url.includes('github') || title.includes('github')) {
    return { type: 'github', label: 'GitHub', icon: GitBranch, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-500/10 border-emerald-500/20' };
  }
  if (url.includes('studio') || title.includes('studio')) {
    return { type: 'studio', label: 'Studio', icon: FileEdit, iconColor: 'text-(--primary)', iconBg: 'bg-(--primary)/10 border-(--primary)/20' };
  }
  if (title.includes('resume') || title.includes('analysis') || title.includes('analyze')) {
    return { type: 'analysis', label: 'Analysis', icon: FileText, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10 border-blue-500/20' };
  }
  if (url.includes('tailor') || title.includes('tailor')) {
    return { type: 'tailor', label: 'Tailor', icon: Zap, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (url.includes('cover') || title.includes('cover letter')) {
    return { type: 'cover', label: 'Cover Letter', icon: FileText, iconColor: 'text-purple-500', iconBg: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (url.includes('interview') || title.includes('interview')) {
    return { type: 'interview', label: 'Interview', icon: MessageSquare, iconColor: 'text-teal-500', iconBg: 'bg-teal-500/10 border-teal-500/20' };
  }
  if (url.includes('roadmap') || title.includes('roadmap')) {
    return { type: 'roadmap', label: 'Roadmap', icon: Map, iconColor: 'text-indigo-500', iconBg: 'bg-indigo-500/10 border-indigo-500/20' };
  }
  if (url.includes('portfolio') || title.includes('portfolio')) {
    return { type: 'portfolio', label: 'Portfolio', icon: LayoutTemplate, iconColor: 'text-(--primary)', iconBg: 'bg-(--primary)/10 border-(--primary)/20' };
  }
  if (url.includes('tracker') || title.includes('job')) {
    return { type: 'tracker', label: 'Tracker', icon: Briefcase, iconColor: 'text-blue-500', iconBg: 'bg-blue-500/10 border-blue-500/20' };
  }
  if (notif.priority === 'URGENT') {
    return { type: 'urgent', label: 'Urgent', icon: AlertTriangle, iconColor: 'text-red-500', iconBg: 'bg-red-500/10 border-red-500/20' };
  }
  if (notif.priority === 'HIGH') {
    return { type: 'high', label: 'Important', icon: AlertCircle, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10 border-amber-500/20' };
  }

  return { type: 'general', label: 'Update', icon: Sparkles, iconColor: 'text-(--primary)', iconBg: 'bg-(--primary)/10 border-(--primary)/20' };
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/domain/notifications?limit=10');
      setNotifications(data?.notifications || data || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/domain/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Mark all read error:", e);
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/domain/notifications/${notif.id}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }
    if (notif.actionUrl) {
      setIsOpen(false);
      router.push(notif.actionUrl);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const timeAgo = (date) => {
    if (!date) return '';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-xl border border-(--hairline) bg-(--surface-soft) hover:bg-(--surface-card) hover:border-(--muted-soft) transition-all flex items-center justify-center text-(--muted) hover:text-(--ink) cursor-pointer group"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-(--primary) text-white text-[10px] font-medium px-1 rounded-full shadow-xs group-hover:scale-110 transition-transform">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-2xl z-50 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-(--hairline-soft) flex justify-between items-center bg-(--surface-soft)/40">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm font-medium text-(--ink)">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] font-medium bg-(--primary)/10 text-(--primary) border border-(--primary)/20 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-(--muted) hover:text-(--primary) transition-colors cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>
          
          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-(--hairline-soft)">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin text-(--primary)" />
                <p className="text-(--muted) text-xs">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notif) => {
                const classification = classifyNotification(notif);
                const Icon = classification.icon;
                const isClickable = !!notif.actionUrl;

                return (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotifClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer group/notif flex gap-3 items-start ${
                      notif.isRead 
                        ? 'opacity-65 hover:opacity-100 hover:bg-(--surface-soft)/50' 
                        : 'bg-(--surface-card) hover:bg-(--surface-soft)'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${classification.iconBg}`}>
                      <Icon className={`w-4 h-4 ${classification.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h4 className="font-medium text-xs text-(--ink) leading-tight truncate">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-(--muted-soft) shrink-0">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-(--muted) leading-relaxed line-clamp-2">{notif.message}</p>
                      {isClickable && (
                        <div className="flex items-center justify-end mt-1.5">
                          <span className="inline-flex items-center gap-0.5 text-[11px] text-(--primary) font-medium group-hover/notif:translate-x-0.5 transition-transform">
                            View <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-(--primary) shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-(--muted)">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-medium">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-(--hairline-soft) bg-(--surface-soft)/40">
            <button 
              className="w-full py-2 rounded-xl text-xs font-medium text-(--ink) bg-(--surface-card) hover:bg-(--surface-soft) border border-(--hairline) transition-colors text-center shadow-xs"
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard/notifications');
              }}
            >
              View All Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
