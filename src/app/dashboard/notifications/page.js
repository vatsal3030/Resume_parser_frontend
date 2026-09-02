"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, FileText, CheckCircle2, Sparkles, CreditCard, Briefcase, Code, FileEdit, Map, MessageSquare, LayoutTemplate } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/domain/notifications?limit=50');
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/domain/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotifClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await api.patch(`/domain/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
      } catch (e) {}
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
        <div className="h-8 bg-(--surface-soft) rounded-xl w-44 mb-2 animate-pulse" />
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-(--surface-card) rounded-2xl border border-(--hairline)" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-(--hairline) pb-6">
        <div>
          <h1 className="text-3xl font-serif text-(--ink) flex items-center gap-3">
            <Bell className="w-7 h-7 text-(--primary)" /> Notifications
          </h1>
          <p className="text-xs text-(--muted) mt-1">Your recent activity and AI generation updates</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-(--primary)" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card) text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-(--muted-soft)" />
            <h3 className="font-serif text-lg text-(--ink)">No Notifications</h3>
            <p className="text-xs text-(--muted) mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => {
            const Icon = getNotifIcon(notif);
            return (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`
                  p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex gap-4 items-start
                  ${!notif.isRead 
                    ? 'bg-(--surface-card) border-(--primary)/50 shadow-sm' 
                    : 'bg-(--surface-card)/70 border-(--hairline) hover:bg-(--surface-card)'
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  !notif.isRead 
                    ? 'bg-(--primary)/10 text-(--primary) border-(--primary)/30' 
                    : 'bg-(--surface-soft) text-(--muted) border-(--hairline-soft)'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-medium text-sm text-(--ink) truncate">{notif.title}</h3>
                    <span className="text-[10px] text-(--muted-soft) shrink-0">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-(--body) mt-1 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-(--primary) shrink-0 mt-2" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
