"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, AlertCircle, FileText, CheckCircle2, Sparkles, CreditCard, Briefcase, Code, FileEdit, Map, MessageSquare, LayoutTemplate, Trash2 } from 'lucide-react';
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

  const handleDeleteAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    try {
      // Assuming a DELETE /domain/notifications endpoint exists, or we might need to add it.
      // If not, we can just delete one by one or create bulk delete endpoint.
      toast.info('Feature not implemented on backend yet. Adding soon!');
    } catch (error) {
      toast.error('Failed to delete notifications');
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
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Notifications</h1>
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-white border-4 border-brutal-black"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-brutal-black pb-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Bell className="w-10 h-10" /> Notifications
          </h1>
          <p className="font-bold text-gray-600 mt-1">Your recent activity and updates</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
          <Button variant="destructive" onClick={handleDeleteAll}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete All
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="p-12 border-4 border-dashed border-brutal-black bg-white text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-black uppercase tracking-wider text-gray-600">No Notifications</h3>
            <p className="font-bold text-gray-500 mt-2">You&apos;re all caught up!</p>
          </div>
        ) : (
          notifications.map(notif => {
            const Icon = getNotifIcon(notif);
            return (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`
                  relative p-4 md:p-6 bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]
                  hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all cursor-pointer
                  flex gap-4 items-start group
                  ${!notif.isRead ? 'border-l-brutal-pink border-l-8' : ''}
                `}
              >
                <div className={`p-3 border-2 border-brutal-black shadow-[2px_2px_0_#000] ${!notif.isRead ? 'bg-brutal-yellow' : 'bg-gray-100'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-black text-lg">{notif.title}</h3>
                    <span className="text-xs font-bold text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-1 border-2 border-brutal-black">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="font-medium text-gray-700 mt-1">{notif.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
