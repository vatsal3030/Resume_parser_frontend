"use client";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from "@/lib/formatDate";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { FileText, ArrowRight, Activity, TrendingUp, Coins, FileCheck, ClipboardCheck, MessageSquare, Map, LayoutTemplate, Code, Users, Briefcase, FileEdit } from 'lucide-react';

// New Shared Components
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12">
      
      {/* 1. Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <PageHeader 
          title="Overview" 
          subtitle="Welcome back. Here is your career progress." 
          className="mb-0 border-b-0" 
        />
        <div className="flex gap-4 w-full md:w-auto border-b-4 border-brutal-black pb-2 md:border-b-0 md:pb-0">
          <Link href="/dashboard/studio" className="w-full sm:w-auto">
             <Button variant="brutal" className="w-full text-lg bg-brutal-blue text-black shadow-brutal-sm">+ Resume Studio</Button>
          </Link>
          <Link href="/dashboard/analyze" className="w-full sm:w-auto">
             <Button variant="mint" className="w-full text-lg shadow-brutal-sm">+ New Analysis</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Metrics & Resumes */}
        <div className="lg:col-span-2 space-y-12">
          {/* 2. Alive Dashboard Metrics */}
          <section>
            <SectionHeader title="Activity" icon={Activity} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <DashboardCard 
                title="Analyzed" 
                value={loading ? '--' : resumes.length} 
                subtext="Total resumes" 
                icon={FileCheck} 
                bgColor="bg-brutal-mint" 
              />
              <DashboardCard 
                title="Avg ATS" 
                value={loading ? '--' : (resumes.length > 0 ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / (resumes.filter(r => r.atsScore).length || 1)) : 0)} 
                subtext="Across all uploads" 
                icon={TrendingUp} 
                bgColor="bg-brutal-yellow" 
              />
              <DashboardCard 
                title="Applications" 
                value="0" 
                subtext="Pending integration" 
                icon={Briefcase} 
                bgColor="bg-brutal-pink" 
              />
              <DashboardCard 
                title="Credits" 
                value={loading ? '--' : (profile?.creditBalance || 0)} 
                subtext={profile?.tier === 'PRO' ? "Pro Plan Active" : "Free Plan"} 
                icon={Coins} 
                bgColor="bg-brutal-blue" 
                textColor="text-white" 
              />
            </div>
          </section>

          {/* Analytics Visualization */}
          <section>
            <SectionHeader title="Analytics" icon={TrendingUp} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <CreditUsageChart />
              <ToolUsageChart />
            </div>
          </section>

          {/* 3. Analyzed Resumes Feed */}
          <section>
            <SectionHeader title="Recent Resumes" icon={FileText} />
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <SkeletonCard />
                 <SkeletonCard />
              </div>
            ) : resumes.length === 0 ? (
              <EmptyState 
                title="No resumes analyzed yet"
                description="Upload your first resume to get detailed AI feedback."
                actionLabel="Upload Resume"
                actionHref="/"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resumes.slice(0, 4).map(r => (
                  <Card key={r.id} className="group bg-white hover:bg-slate-50 transition-colors border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-3 bg-brutal-blue border-3 border-brutal-black shadow-brutal-sm group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
                            <FileText className="w-8 h-8 text-brutal-black" />
                          </div>
                          <div className="pl-2">
                             <h3 className="font-black text-xl truncate w-32 md:w-40" title={r.title}>{r.title || 'Untitled Resume'}</h3>
                             <p className="text-sm font-bold opacity-80">{formatDate(r.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-brutal-bg border-3 border-brutal-black p-4 text-center">
                          <p className="text-xs font-black uppercase tracking-wider mb-1">ATS Score</p>
                          <span className="text-4xl font-black">{r.atsScore}</span>
                        </div>
                        <div className="bg-brutal-yellow border-3 border-brutal-black p-4 text-center">
                          <p className="text-xs font-black uppercase tracking-wider mb-1">Job Fit</p>
                          <span className="text-4xl font-black">{r.jobFitScore}</span>
                        </div>
                      </div>

                      <Link href={`/dashboard/analyze?outputId=${r.id}`} className="block w-full">
                        <Button variant="white" className="w-full text-lg justify-between border-3 bg-slate-100">
                          View Details
                          <ArrowRight className="w-5 h-5 transition group-hover:translate-x-2" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Live Feed & Context */}
        <div className="space-y-8">
          <ContinueWorkflowCard />
          <RecentActivityFeed />
        </div>

      </div>

      {/* 4. Tools Grid */}
      <section>
        <SectionHeader title="Core Tools" icon={LayoutTemplate} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ToolCard title="Resume Studio" description="Build & edit with live AI assistance." href="/dashboard/studio" bgColor="bg-brutal-blue" textColor="text-white" icon={FileEdit} />
          <ToolCard title="DSA Tracker" description="Track coding stats across platforms." href="/dashboard/tools/dsa-tracker" bgColor="bg-brutal-mint" icon={TrendingUp} />
          <ToolCard title="GitHub Analyst" description="Extract your developer archetype." href="/dashboard/tools/github" bgColor="bg-black" textColor="text-white" icon={Code} />
          <ToolCard title="Portfolio Gen" description="Wireframe a site from your resume." href="/dashboard/tools/portfolio" bgColor="bg-brutal-bg" icon={LayoutTemplate} />
          <ToolCard title="AI Tailor" description="Match your resume to a Job Description." href="/dashboard/tools/tailor" bgColor="bg-brutal-yellow" icon={ClipboardCheck} />
          <ToolCard title="Job Tracker" description="Drag-and-drop board for applications." href="/dashboard/tracker" bgColor="bg-brutal-blue" icon={Briefcase} />
          <ToolCard title="Cover Letter" description="Auto-generate a highly targeted letter." href="/dashboard/tools/cover-letter" bgColor="bg-brutal-pink" icon={FileText} />
          <ToolCard title="Mock Interview" description="Practice hard questions based on your CV." href="/dashboard/tools/mock-interview" bgColor="bg-brutal-green" icon={MessageSquare} />
          <ToolCard title="Skill Roadmap" description="AI generated path to your next role." href="/dashboard/tools/roadmap" icon={Map} />
          <ToolCard title="Community" description="Peer review and resume roasting." href="/dashboard/community" bgColor="bg-brutal-yellow" icon={Users} />
        </div>
      </section>

    </div>
  );
}
