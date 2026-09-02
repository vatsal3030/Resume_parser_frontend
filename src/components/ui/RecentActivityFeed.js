"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import { Button } from './button';
import { 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Code, 
  Map, 
  MessageSquare,
  Activity
} from 'lucide-react';
import Link from 'next/link';

const EVENT_DISPLAY = {
  RESUME_ANALYZED: { icon: FileText, label: 'Resume Analyzed' },
  RESUME_TAILORED: { icon: Sparkles, label: 'Resume Tailored' },
  COVER_LETTER_GENERATED: { icon: FileText, label: 'Cover Letter Generated' },
  MOCK_INTERVIEW_GENERATED: { icon: MessageSquare, label: 'Mock Interview Ready' },
  ROADMAP_GENERATED: { icon: Map, label: 'Roadmap Generated' },
  PORTFOLIO_GENERATED: { icon: Sparkles, label: 'Portfolio Generated' },
  GITHUB_ANALYZED: { icon: Code, label: 'GitHub Analyzed' },
  AI_JOB_FAILED: { icon: AlertCircle, label: 'Job Failed', isError: true },
};

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

export function RecentActivityFeed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const { data } = await api.get('/domain/activity?limit=5');
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-(--primary)" />
        <h3 className="font-serif text-lg text-(--ink)">Recent Activity</h3>
      </div>
      
      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-3 p-3.5 border border-(--hairline-soft) bg-(--surface-card) rounded-xl animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-(--surface-soft)" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-(--surface-soft) rounded w-3/4" />
                <div className="h-2.5 bg-(--surface-soft) rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-6 border border-(--hairline-soft) bg-(--surface-card) rounded-2xl text-center">
          <p className="text-(--muted) text-xs font-medium">No activity yet. Upload a resume to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const display = EVENT_DISPLAY[event.type] || { icon: Sparkles, label: event.type };
            const IconComp = display.icon;
            const isError = display.isError;
            return (
              <div 
                key={event.id} 
                className="flex items-center gap-3 p-3 rounded-xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isError 
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                    : 'bg-(--surface-soft) text-(--primary) border border-(--hairline-soft)'
                }`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-xs text-(--ink) truncate">
                    {event.metadata?.label || display.label}
                  </h4>
                  <p className="text-[11px] text-(--muted) truncate">
                    {event.metadata?.icon} {event.targetType || 'AI Job'}
                  </p>
                </div>
                <span className="text-[10px] text-(--muted-soft) shrink-0">
                  {timeAgo(event.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <Link href="/dashboard/notifications" className="block pt-1">
        <button 
          type="button" 
          className="w-full py-2 rounded-xl text-xs font-medium text-(--muted) hover:text-(--ink) bg-(--surface-soft) hover:bg-(--surface-card) border border-(--hairline) transition-colors text-center cursor-pointer"
        >
          View All Activity
        </button>
      </Link>
    </div>
  );
}

const WORKFLOW_DISPLAY = {
  RESUME_OPTIMIZATION: { label: 'Resume Optimization', href: '/dashboard/tools/tailor' },
  INTERVIEW_PREP: { label: 'Interview Preparation', href: '/dashboard/tools/mock-interview' },
  ONBOARDING: { label: 'Getting Started', href: '/dashboard' },
};

export function ContinueWorkflowCard() {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { data } = await api.get('/domain/workflows?limit=1');
        if (data.length > 0) {
          setWorkflow(data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch workflows:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 mb-8 animate-pulse">
        <div className="h-4 bg-(--surface-soft) rounded w-28 mb-3" />
        <div className="h-6 bg-(--surface-soft) rounded w-3/4 mb-2" />
        <div className="h-3 bg-(--surface-soft) rounded w-full mb-6" />
        <div className="h-9 bg-(--surface-soft) rounded-xl w-36" />
      </div>
    );
  }

  if (!workflow) return null;

  const display = WORKFLOW_DISPLAY[workflow.type] || { label: workflow.type, href: '/dashboard' };

  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm mb-8 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-(--primary)/10 text-(--primary) border border-(--primary)/20">
          In Progress
        </span>
        <span className="text-xs text-(--muted) font-medium flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-(--primary)" /> {workflow.completionPercentage}% Complete
        </span>
      </div>

      <h3 className="text-xl font-serif text-(--ink) mb-1">{display.label}</h3>
      <p className="text-xs text-(--muted) mb-5">
        Current step: <span className="text-(--ink) font-medium">{workflow.currentStep.replace(/_/g, ' ')}</span>
        {workflow.metadata?.title && ` — ${workflow.metadata.title}`}
      </p>
      
      {/* Progress bar */}
      <div className="w-full bg-(--surface-soft) rounded-full h-2 overflow-hidden mb-5">
        <div 
          className="bg-(--primary) h-full rounded-full transition-all duration-500" 
          style={{ width: `${workflow.completionPercentage}%` }} 
        />
      </div>

      <Link href={display.href}>
        <Button variant="default" size="sm" className="flex items-center gap-2">
          Continue Workflow <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </Link>
    </div>
  );
}
