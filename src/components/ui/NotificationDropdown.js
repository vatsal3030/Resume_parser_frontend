"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
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
  GitBranch 
} from 'lucide-react';
import { Button } from './button';
import { supabase } from '@/lib/supabase';

function classifyNotification(notif) {
  const url = (notif.actionUrl || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();
  const message = (notif.message || '').toLowerCase();

  if (title.includes('failed') || title.includes('error') || message.includes('failed')) {
    return { type: 'error', label: 'Failed', color: 'red', icon: AlertCircle };
  }
  if (url.includes('credit') || title.includes('credit') || title.includes('payment')) {
    return { type: 'credit', label: 'Credits', color: 'yellow', icon: CreditCard };
  }
  if (url.includes('github') || title.includes('github')) {
    return { type: 'github', label: 'GitHub', color: 'green', icon: GitBranch };
  }
  if (url.includes('studio') || title.includes('studio')) {
    return { type: 'studio', label: 'Studio', color: 'mint', icon: FileEdit };
  }
  if (title.includes('resume') || title.includes('analysis') || title.includes('analyze')) {
    return { type: 'analysis', label: 'Analysis', color: 'blue', icon: FileText };
  }
  if (url.includes('tailor') || title.includes('tailor')) {
    return { type: 'tailor', label: 'Tailor', color: 'pink', icon: Zap };
  }
  if (url.includes('cover') || title.includes('cover letter')) {
    return { type: 'cover', label: 'Cover Letter', color: 'pink', icon: FileText };
  }
  if (url.includes('interview') || title.includes('interview')) {
    return { type: 'interview', label: 'Interview', color: 'mint', icon: MessageSquare };
  }
  if (url.includes('roadmap') || title.includes('roadmap')) {
    return { type: 'roadmap', label: 'Roadmap', color: 'purple', icon: Map };
  }
  if (url.includes('portfolio') || title.includes('portfolio')) {
    return { type: 'portfolio', label: 'Portfolio', color: 'orange', icon: LayoutTemplate };
  }
  if (url.includes('tracker') || title.includes('job')) {
    return { type: 'tracker', label: 'Tracker', color: 'blue', icon: Briefcase };
  }
  if (notif.priority === 'URGENT') {
    return { type: 'urgent', label: 'Urgent', color: 'red', icon: AlertTriangle };
  }
  if (notif.priority === 'HIGH') {
    return { type: 'high', label: 'Important', color: 'orange', icon: AlertCircle };
  }

  return { type: 'general', label: 'Update', color: 'blue', icon: Sparkles };
}

const TYPE_COLORS = {
  red: { 
    bg: 'bg-red-500/[0.04] dark:bg-red-500/[0.08]', 
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20', 
    icon: 'text-red-500' 
  },
  yellow: { 
    bg: 'bg-amber-500/[0.04] dark:bg-amber-500/[0.08]', 
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20', 
    icon: 'text-amber-500' 
  },
  green: { 
    bg: 'bg-emerald-500/[0.04] dark:bg-emerald-500/[0.08]', 
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20', 
    icon: 'text-emerald-500' 
  },
  blue: { 
    bg: 'bg-sky-500/[0.04] dark:bg-sky-500/[0.08]', 
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20', 
    icon: 'text-sky-500' 
  },
  pink: { 
    bg: 'bg-rose-500/[0.04] dark:bg-rose-500/[0.08]', 
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20', 
    icon: 'text-rose-500' 
  },
  mint: { 
    bg: 'bg-teal-500/[0.04] dark:bg-teal-500/[0.08]', 
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20', 
    icon: 'text-teal-500' 
  },
  purple: { 
    bg: 'bg-purple-500/[0.04] dark:bg-purple-500/[0.08]', 
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20', 
    icon: 'text-purple-500' 
  },
  orange: { 
    bg: 'bg-orange-500/[0.04] dark:bg-orange-500/[0.08]', 
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20', 
    icon: 'text-orange-500' 
  },
};

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
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-(--primary) text-white text-[10px] font-medium px-1 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-2xl z-50 overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-(--hairline-soft) flex justify-between items-center bg-(--surface-soft)/50">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base text-(--ink)">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium bg-(--primary)/10 text-(--primary) px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-(--muted) hover:text-(--primary) transition-colors cursor-pointer"
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
                const colors = TYPE_COLORS[classification.color] || TYPE_COLORS.blue;
                const isClickable = !!notif.actionUrl;

                return (
                  <div 
                    key={notif.id} 
                    onClick={() => handleNotifClick(notif)}
                    className={`p-3.5 transition-all cursor-pointer group/notif ${
                      notif.isRead 
                        ? 'opacity-60 hover:opacity-100 hover:bg-(--surface-soft)' 
                        : `${colors.bg} hover:brightness-95`
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-0.5 shrink-0 w-8 h-8 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center">
                        <Icon className={`w-4 h-4 ${colors.icon}`} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <h4 className="font-medium text-xs text-(--ink) leading-tight truncate">
                            {notif.title}
                          </h4>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${colors.badge}`}>
                            {classification.label}
                          </span>
                        </div>
                        <p className="text-xs text-(--muted) leading-relaxed line-clamp-2">{notif.message}</p>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-(--muted-soft)">
                          <span>{timeAgo(notif.createdAt)}</span>
                          {isClickable && (
                            <span className="inline-flex items-center gap-0.5 text-(--primary) opacity-0 group-hover/notif:opacity-100 transition-opacity">
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
              <div className="p-8 text-center text-(--muted)">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 opacity-30 text-emerald-500" />
                <p className="text-xs font-medium">You&apos;re all caught up!</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-2 border-t border-(--hairline-soft) bg-(--surface-soft)/50">
            <button 
              className="w-full py-2 rounded-xl text-xs font-medium text-(--ink) bg-(--surface-card) hover:bg-(--surface-soft) border border-(--hairline) transition-colors text-center"
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
