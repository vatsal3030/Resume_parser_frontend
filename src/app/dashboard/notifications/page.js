"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { PageShell } from '@/components/ui/PageShell';
import { 
  Bell, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Briefcase, 
  Code, 
  FileEdit, 
  Map, 
  MessageSquare, 
  LayoutTemplate,
  XCircle,
  AlertTriangle,
  Zap,
  GitBranch,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

function getNotificationMeta(notif) {
  const url = (notif.actionUrl || '').toLowerCase();
  const title = (notif.title || '').toLowerCase();
  const message = (notif.message || '').toLowerCase();

  if (title.includes('failed') || title.includes('error') || message.includes('failed')) {
    return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
  }
  if (url.includes('credit') || title.includes('credit') || title.includes('payment')) {
    return { icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
  }
  if (url.includes('github') || title.includes('github')) {
    return { icon: GitBranch, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' };
  }
  if (url.includes('studio') || title.includes('studio')) {
    return { icon: FileEdit, color: 'text-(--primary)', bg: 'bg-(--primary)/10 border-(--primary)/20' };
  }
  if (title.includes('resume') || title.includes('analysis') || title.includes('analyze')) {
    return { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
  }
  if (url.includes('tailor') || title.includes('tailor')) {
    return { icon: Zap, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (url.includes('cover') || title.includes('cover letter')) {
    return { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' };
  }
  if (url.includes('interview') || title.includes('interview')) {
    return { icon: MessageSquare, color: 'text-teal-500', bg: 'bg-teal-500/10 border-teal-500/20' };
  }
  if (url.includes('roadmap') || title.includes('roadmap')) {
    return { icon: Map, color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/20' };
  }
  if (url.includes('portfolio') || title.includes('portfolio')) {
    return { icon: LayoutTemplate, color: 'text-(--primary)', bg: 'bg-(--primary)/10 border-(--primary)/20' };
  }
  if (url.includes('tracker') || title.includes('job')) {
    return { icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' };
  }
  if (notif.priority === 'URGENT') {
    return { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' };
  }
  if (notif.priority === 'HIGH') {
    return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' };
  }
  return { icon: Sparkles, color: 'text-(--primary)', bg: 'bg-(--primary)/10 border-(--primary)/20' };
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
      setNotifications(data?.notifications || data || []);
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
      <PageShell title="Notifications" subtitle="Your recent activity and AI generation updates">
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-(--surface-card) rounded-2xl border border-(--hairline) p-4 flex gap-4 items-center">
              <div className="w-10 h-10 rounded-xl bg-(--surface-soft)" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-(--surface-soft) rounded w-48" />
                <div className="h-3 bg-(--surface-soft) rounded w-96" />
              </div>
            </div>
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell 
      title="Notifications" 
      subtitle="Your recent activity and AI generation updates"
      actions={
        notifications.some(n => !n.isRead) && (
          <Button variant="secondary" size="sm" onClick={handleMarkAllRead} className="text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-(--primary)" /> Mark All Read
          </Button>
        )
      }
    >
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="p-12 rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card) text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-(--muted) opacity-40" />
            <h3 className="font-serif text-base text-(--ink)">No Notifications</h3>
            <p className="text-xs text-(--muted) mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => {
            const meta = getNotificationMeta(notif);
            const Icon = meta.icon;
            const isClickable = !!notif.actionUrl;

            return (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`
                  p-4 md:p-5 rounded-2xl border transition-colors cursor-pointer flex gap-4 items-start shadow-xs group
                  ${!notif.isRead 
                    ? 'bg-(--surface-card) border-(--hairline) hover:bg-(--surface-soft)' 
                    : 'bg-(--surface-card) border-(--hairline-soft) opacity-75 hover:opacity-100 hover:bg-(--surface-soft)'
                  }
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${meta.bg}`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-serif font-medium text-sm text-(--ink) truncate">{notif.title}</h3>
                    <span className="text-[11px] text-(--muted-soft) shrink-0">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-(--muted) leading-relaxed">{notif.message}</p>
                  {isClickable && (
                    <div className="flex items-center justify-end mt-2">
                      <span className="inline-flex items-center gap-1 text-xs text-(--primary) font-medium group-hover:translate-x-0.5 transition-transform">
                        View Details <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  )}
                </div>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-(--primary) shrink-0 mt-1.5" />
                )}
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
