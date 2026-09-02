"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from "@/lib/formatDate";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { 
  FileText, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Coins, 
  FileCheck, 
  ClipboardCheck, 
  MessageSquare, 
  Map, 
  LayoutTemplate, 
  Code, 
  Users, 
  Briefcase, 
  FileEdit,
  Sparkles
} from 'lucide-react';

import { PageHeader, SectionHeader } from '@/components/ui/Headers';
import { DashboardCard, ToolCard } from '@/components/ui/BrutalCards';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/SkeletonState';
import { RecentActivityFeed, ContinueWorkflowCard } from '@/components/ui/RecentActivityFeed';
import { CreditUsageChart, ToolUsageChart } from '@/components/ui/DashboardCharts';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const [resumesRes, profileRes] = await Promise.all([
          api.get('/resumes'),
          api.get('/users/me').catch(() => ({ data: null }))
        ]);
        setResumes(Array.isArray(resumesRes?.data) ? resumesRes.data : []);
        if (profileRes.data) {
          const userObj = profileRes.data;
          const balance = userObj.creditBalance ?? userObj.credits ?? userObj.profile?.creditBalance ?? 0;
          setProfile({
            ...(userObj.profile || {}),
            creditBalance: balance,
            tier: userObj.tier || userObj.profile?.tier || 'FREE'
          });
        }
      } catch (error) {
        console.error("Error fetching resumes:", error.response?.data || error.message);
        setResumes([]);
        if (error.response?.status === 401) {
          toast.error('Session Expired', 'Please log in again.');
          await supabase.auth.signOut();
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, [router, toast]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-(--hairline) pb-6">
        <PageHeader 
          title="Overview" 
          subtitle="Welcome back. Here is your career progress." 
          className="mb-0 border-b-0 pb-0" 
        />
        <div className="flex gap-2.5 w-full md:w-auto">
          <Link href="/dashboard/studio" className="w-full sm:w-auto">
            <Button variant="secondary" size="sm" className="w-full">
              + Resume Studio
            </Button>
          </Link>
          <Link href="/dashboard/analyze" className="w-full sm:w-auto">
            <Button variant="default" size="sm" className="w-full">
              + New Analysis
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Resumes */}
        <div className="lg:col-span-2 space-y-10">
          {/* 2. Alive Dashboard Metrics */}
          <section>
            <SectionHeader title="Activity" icon={Activity} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DashboardCard 
                title="Analyzed" 
                value={loading ? '--' : resumes.length} 
                subtext="Total resumes" 
                icon={FileCheck} 
              />
              <DashboardCard 
                title="Avg ATS" 
                value={loading ? '--' : (resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / (resumes.filter(r => r.atsScore).length || 1)) : 0)} 
                subtext="Across all uploads" 
                icon={TrendingUp} 
              />
              <DashboardCard 
                title="Applications" 
                value="0" 
                subtext="Active job tracker entries" 
                icon={Briefcase} 
              />
              <DashboardCard 
                title="Credits" 
                value={loading ? '--' : (profile?.creditBalance || 0)} 
                subtext={profile?.tier === 'PRO' ? "Pro Plan Active" : "Available Credits"} 
                icon={Coins} 
              />
            </div>
          </section>

          {/* Analytics Visualization */}
          <section>
            <SectionHeader title="Analytics" icon={TrendingUp} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CreditUsageChart />
              <ToolUsageChart />
            </div>
          </section>

          {/* 3. Analyzed Resumes Feed */}
          <section>
            <SectionHeader title="Recent Resumes" icon={FileText} />
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : resumes.length === 0 ? (
              <EmptyState 
                title="No resumes analyzed yet"
                description="Upload your first resume to get detailed AI feedback."
                actionLabel="Upload Resume"
                actionHref="/dashboard/analyze"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumes.slice(0, 4).map(r => (
                  <div key={r.id} className="group rounded-2xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) hover:border-(--primary)/50 transition-all p-6 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary)">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-base text-(--ink) truncate" title={r.title}>
                            {r.title || 'Untitled Resume'}
                          </h3>
                          <p className="text-xs text-(--muted) mt-0.5">{formatDate(r.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-5">
                        <div className="rounded-xl border border-(--hairline-soft) bg-(--surface-soft)/60 p-3 text-center">
                          <p className="text-[10px] uppercase font-medium tracking-wider text-(--muted) mb-0.5">ATS Score</p>
                          <span className="text-2xl font-serif text-(--ink)">{r.atsScore ?? '--'}</span>
                        </div>
                        <div className="rounded-xl border border-(--hairline-soft) bg-(--surface-soft)/60 p-3 text-center">
                          <p className="text-[10px] uppercase font-medium tracking-wider text-(--muted) mb-0.5">Job Fit</p>
                          <span className="text-2xl font-serif text-(--ink)">{r.jobFitScore ?? '--'}</span>
                        </div>
                      </div>
                    </div>

                    <Link href={`/dashboard/analyze?outputId=${r.id}`} className="block w-full">
                      <Button variant="secondary" size="sm" className="w-full justify-between">
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Live Feed & Context */}
        <div className="space-y-6">
          <ContinueWorkflowCard />
          <RecentActivityFeed />
        </div>

      </div>

      {/* 4. Tools Grid */}
      <section className="pt-4">
        <SectionHeader title="Core Tools" icon={LayoutTemplate} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <ToolCard title="Resume Studio" description="Build & edit with live AI assistance." href="/dashboard/studio" icon={FileEdit} />
          <ToolCard title="DSA Tracker" description="Track coding stats across platforms." href="/dashboard/tools/dsa-tracker" icon={TrendingUp} />
          <ToolCard title="GitHub Analyst" description="Extract your developer archetype." href="/dashboard/tools/github" icon={Code} />
          <ToolCard title="Portfolio Gen" description="Wireframe a site from your resume." href="/dashboard/tools/portfolio" icon={LayoutTemplate} />
          <ToolCard title="AI Tailor" description="Match your resume to a Job Description." href="/dashboard/tools/tailor" icon={ClipboardCheck} />
          <ToolCard title="Job Tracker" description="Organized board for job applications." href="/dashboard/tracker" icon={Briefcase} />
          <ToolCard title="Cover Letter" description="Auto-generate targeted letters." href="/dashboard/tools/cover-letter" icon={FileText} />
          <ToolCard title="Mock Interview" description="Practice hard questions based on CV." href="/dashboard/tools/mock-interview" icon={MessageSquare} />
          <ToolCard title="Skill Roadmap" description="AI-generated path to your next role." href="/dashboard/tools/roadmap" icon={Map} />
          <ToolCard title="Community" description="Peer review and resume feedback." href="/dashboard/community" icon={Users} />
        </div>
      </section>

    </div>
  );
}
