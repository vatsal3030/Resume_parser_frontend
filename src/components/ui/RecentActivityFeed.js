"use client";
import React, { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/formatDate';
import { Card, CardContent } from './card';
import { Button } from './button';
import { FileText, Sparkles, UserCheck, Clock, ArrowRight, CheckCircle2, Loader2, AlertCircle, Code, Map, MessageSquare } from 'lucide-react';
import Link from 'next/link';

/**
 * Maps backend event types to UI display config.
 */
const EVENT_DISPLAY = {
  RESUME_ANALYZED: { icon: FileText, color: 'bg-brutal-blue', label: 'Resume Analyzed' },
  RESUME_TAILORED: { icon: Sparkles, color: 'bg-brutal-pink', label: 'Resume Tailored' },
  COVER_LETTER_GENERATED: { icon: FileText, color: 'bg-brutal-mint', label: 'Cover Letter Generated' },
  MOCK_INTERVIEW_GENERATED: { icon: MessageSquare, color: 'bg-brutal-green', label: 'Mock Interview Ready' },
  ROADMAP_GENERATED: { icon: Map, color: 'bg-brutal-yellow', label: 'Roadmap Generated' },
  PORTFOLIO_GENERATED: { icon: Sparkles, color: 'bg-brutal-blue', label: 'Portfolio Generated' },
  GITHUB_ANALYZED: { icon: Code, color: 'bg-black text-white', label: 'GitHub Analyzed' },
  AI_JOB_FAILED: { icon: AlertCircle, color: 'bg-red-100', label: 'Job Failed' },
};

/**
 * Format a timestamp into relative time (e.g., "2h ago", "3d ago").
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
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gray-500" />
        <h3 className="font-black text-xl uppercase tracking-tight">Recent Activity</h3>
      </div>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-start gap-4 p-4 border-2 border-brutal-black bg-white animate-pulse">
              <div className="w-9 h-9 bg-gray-200 border-2 border-brutal-black" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="p-6 border-2 border-dashed border-gray-300 text-center">
          <p className="text-gray-500 font-bold text-sm">No activity yet. Upload a resume to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => {
            const display = EVENT_DISPLAY[event.type] || { icon: Sparkles, color: 'bg-gray-100', label: event.type };
            const IconComp = display.icon;
            return (
              <div 
                key={event.id} 
                className="flex items-start gap-4 p-4 border-2 border-brutal-black bg-white hover:bg-slate-50 transition-colors"
              >
                <div className={`p-2 border-2 border-brutal-black ${display.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{event.metadata?.label || display.label}</h4>
                  <p className="text-gray-600 text-xs mt-1 font-medium">
                    {event.metadata?.icon} {event.targetType || ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                  {timeAgo(event.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <Button variant="outline" className="w-full text-xs font-bold uppercase tracking-widest border-dashed">
        View All Activity
      </Button>
    </div>
  );
}

/**
 * Maps workflow types to display configuration.
 */
const WORKFLOW_DISPLAY = {
  RESUME_OPTIMIZATION: { label: 'Resume Optimization', href: '/dashboard/tools/tailor', color: 'bg-brutal-yellow' },
  INTERVIEW_PREP: { label: 'Interview Preparation', href: '/dashboard/tools/mock-interview', color: 'bg-brutal-green' },
  ONBOARDING: { label: 'Getting Started', href: '/dashboard', color: 'bg-brutal-mint' },
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
      <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-8 animate-pulse">
        <CardContent className="p-6">
          <div className="h-5 bg-yellow-300 rounded w-24 mb-3" />
          <div className="h-6 bg-yellow-300 rounded w-3/4 mb-2" />
          <div className="h-4 bg-yellow-200 rounded w-full mb-6" />
          <div className="h-10 bg-white border-2 border-brutal-black rounded w-48" />
        </CardContent>
      </Card>
    );
  }

  if (!workflow) return null; // No active workflow — don't render anything

  const display = WORKFLOW_DISPLAY[workflow.type] || { label: workflow.type, href: '/dashboard', color: 'bg-brutal-yellow' };
  const totalSteps = 3; // Approximate from completionPercentage
  const currentStepNum = Math.max(1, Math.ceil((workflow.completionPercentage / 100) * totalSteps));

  return (
    <Card className={`${display.color} border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all mb-8`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-black text-white text-xs font-bold uppercase px-2 py-1">In Progress</span>
              <span className="text-sm font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {workflow.completionPercentage}% Complete
              </span>
            </div>
            <h3 className="text-2xl font-black mb-1">{display.label}</h3>
            <p className="font-medium text-black/80 mb-6">
              Current step: <span className="font-black">{workflow.currentStep.replace(/_/g, ' ')}</span>
              {workflow.metadata?.title && ` — ${workflow.metadata.title}`}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-black/10 border-2 border-brutal-black h-3 mb-6">
          <div 
            className="bg-black h-full transition-all duration-500" 
            style={{ width: `${workflow.completionPercentage}%` }} 
          />
        </div>

        <Link href={display.href}>
          <Button variant="brutal" className="bg-white text-black hover:bg-gray-100 flex items-center gap-2">
            Continue Workflow <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
