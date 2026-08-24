"use client";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles, FileText, Target, MessageSquare, Briefcase, Map, Code2, Shield, Zap, Star } from "lucide-react";
import api from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

const FEATURES = [
  { icon: FileText, title: "AI Resume Analysis", desc: "Deep evaluation with ATS scoring, weakness detection, and actionable improvements.", color: "bg-brutal-yellow" },
  { icon: Target, title: "Resume Tailoring", desc: "Auto-optimize your resume for any job description with keyword matching.", color: "bg-brutal-blue text-white" },
  { icon: MessageSquare, title: "Cover Letters", desc: "Generate hyper-personalized cover letters in seconds, not hours.", color: "bg-brutal-pink" },
  { icon: Briefcase, title: "Mock Interviews", desc: "Practice with AI-generated behavioral and technical questions.", color: "bg-brutal-mint" },
  { icon: Map, title: "Career Roadmaps", desc: "Get a personalized skill-gap analysis and learning path.", color: "bg-purple-300" },
  { icon: Code2, title: "GitHub Portfolio", desc: "Generate a professional portfolio from your GitHub repositories.", color: "bg-orange-300" },
];

const TESTIMONIALS = [
  { quote: "Elevara landed me 3 interviews in a week after months of silence.", author: "Sarah J.", role: "Software Engineer" },
  { quote: "The AI mock interviews are scarily accurate. I felt completely prepared.", author: "Michael T.", role: "Product Manager" },
  { quote: "Best 99 bucks I've ever spent. The portfolio generator saved me hours.", author: "David K.", role: "Frontend Dev" },
];

const STATS = [
  { value: "50K+", label: "Resumes Analyzed" },
  { value: "94%", label: "Interview Rate" },
  { value: "6", label: "AI Tools" },
  { value: "< 30s", label: "Analysis Time" },
];

export default function Home() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-brutal-bg">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-brutal-bg border-b-4 border-brutal-black px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black uppercase tracking-tighter">Elevara</Link>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard"><Button variant="brutal" className="text-sm">Dashboard →</Button></Link>
          ) : (
            <>
              <Link href="/login"><Button variant="outline" className="bg-white border-2 border-brutal-black text-sm font-bold">Sign In</Button></Link>
              <Link href="/register"><Button variant="brutal" className="bg-brutal-mint text-sm">Get Started</Button></Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1.5 mb-6 border-3 border-black bg-brutal-yellow font-black uppercase tracking-wider shadow-brutal-sm text-sm">
            Powered by Gemini 3.6 & Multi-Model AI
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-6">
            Your AI-Powered<br />
            <span className="bg-brutal-mint px-2 border-4 border-black shadow-brutal inline-block mt-2">Elevara</span>
          </h1>
          <p className="text-lg md:text-xl font-bold bg-white inline-block p-4 border-3 border-black shadow-brutal max-w-2xl mt-4">
            6 AI tools. One platform. From resume analysis to interview prep — everything you need to land your dream job.
          </p>
        </div>

        {/* TRUST BADGES */}
        <div className="flex flex-wrap justify-center gap-6 mb-12 opacity-70 grayscale">
          <div className="text-xl font-black flex items-center gap-2"><Shield /> TRUSTED SECURE</div>
          <div className="text-xl font-black flex items-center gap-2"><Star /> 4.9/5 RATING</div>
          <div className="text-xl font-black flex items-center gap-2"><Briefcase /> TOP RECRUITER APPROVED</div>
        </div>

        {/* PREMIUM SHOWCASE */}
        <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto gap-8 mt-12 relative z-10">
          <div className="w-full p-2 bg-white border-4 border-brutal-black shadow-[16px_16px_0_#000] rotate-1 hover:rotate-0 transition-all duration-300">
            <div className="bg-slate-100 border-2 border-dashed border-gray-300 w-full h-64 md:h-96 flex items-center justify-center relative overflow-hidden group cursor-pointer">
              {/* Dynamic Abstract Visuals */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brutal-pink via-brutal-blue to-transparent group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="text-center z-10 flex flex-col items-center justify-center">
                <Sparkles className="w-12 h-12 mb-4 text-brutal-black opacity-20 group-hover:opacity-100 group-hover:text-brutal-pink transition-all duration-300 group-hover:animate-pulse" />
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter opacity-20 group-hover:opacity-100 transition-opacity">Experience the Platform</h3>
                <p className="font-bold text-lg opacity-50 group-hover:opacity-100 mt-2">Get inside to see your future career OS</p>
              </div>
            </div>
          </div>
          
          <Link href={session ? "/dashboard" : "/register"} className="mt-8 group">
            <Button variant="default" size="lg" className="text-2xl px-12 py-8 bg-brutal-yellow text-brutal-black border-4 border-brutal-black shadow-[8px_8px_0_#000] group-hover:shadow-none group-hover:translate-x-2 group-hover:translate-y-2 transition-all">
              Launch Elevara Now
            </Button>
          </Link>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-brutal-black text-white border-y-4 border-brutal-black">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-gray-700">
          {STATS.map((s, i) => (
            <div key={i} className="p-6 text-center">
              <div className="text-3xl md:text-4xl font-black">{s.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-1 opacity-70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-tight">
            6 AI Tools.<br />
            <span className="bg-brutal-blue text-white px-4 py-2 border-4 border-black inline-block mt-4 shadow-[4px_4px_0_#000]">One Platform.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-y-1 transition-all group">
                <div className={`w-12 h-12 ${f.color} border-3 border-brutal-black flex items-center justify-center mb-4 shadow-[2px_2px_0_#000] group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg uppercase mb-2">{f.title}</h3>
                <p className="text-sm font-medium text-gray-600">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y-4 border-brutal-black px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-12">
            How It <span className="bg-brutal-pink px-2 border-4 border-black shadow-[4px_4px_0_#000] inline-block">Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload", desc: "Drop your resume PDF and pick an AI model." },
              { step: "02", title: "Analyze", desc: "AI evaluates your resume in under 30 seconds." },
              { step: "03", title: "Optimize", desc: "Use our 6 tools to tailor, rewrite, and prepare." },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="text-7xl font-black text-transparent [-webkit-text-stroke:2px_black] mb-4">{s.step}</div>
                <h3 className="text-xl font-black uppercase mb-2">{s.title}</h3>
                <p className="text-sm font-medium text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <h2 className="text-4xl font-black uppercase tracking-tighter text-center mb-12">
          Wall of <span className="bg-brutal-mint px-2 border-4 border-black">Love</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white border-4 border-brutal-black p-8 shadow-brutal flex flex-col justify-between hover:-translate-y-2 transition-transform">
              <div className="flex gap-1 mb-4 text-brutal-yellow">
                <Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" /><Star className="fill-current" />
              </div>
              <p className="font-bold text-lg mb-6 italic">&quot;{t.quote}&quot;</p>
              <div>
                <p className="font-black uppercase">{t.author}</p>
                <p className="text-sm font-bold text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section className="bg-brutal-blue border-y-4 border-brutal-black px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-6">Simple, Pay-As-You-Go Pricing</h2>
          <p className="text-xl font-bold text-white mb-12">No subscriptions. Buy credits only when you need them.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white border-4 border-brutal-black p-8 shadow-[8px_8px_0_rgba(0,0,0,1)]">
              <h3 className="text-3xl font-black uppercase mb-2">Basic Plan</h3>
              <div className="text-4xl font-black mb-6">₹99</div>
              <ul className="space-y-3 font-bold mb-8">
                <li>✓ 100 AI Generation Credits</li>
                <li>✓ All 6 AI Tools Included</li>
                <li>✓ Standard Support</li>
              </ul>
              <Link href="/register">
                <Button variant="brutal" className="w-full bg-brutal-yellow text-black text-xl py-6">Get Basic</Button>
              </Link>
            </div>
            
            <div className="bg-brutal-yellow border-4 border-brutal-black p-8 shadow-[8px_8px_0_rgba(0,0,0,1)] transform md:-rotate-2">
              <div className="bg-brutal-black text-white text-xs font-black uppercase px-2 py-1 inline-block mb-4">Most Popular</div>
              <h3 className="text-3xl font-black uppercase mb-2">Pro Plan</h3>
              <div className="text-4xl font-black mb-6">₹399</div>
              <ul className="space-y-3 font-bold mb-8">
                <li>✓ 500 AI Generation Credits</li>
                <li>✓ Priority Queue Processing</li>
                <li>✓ Premium Support</li>
              </ul>
              <Link href="/register">
                <Button variant="brutal" className="w-full bg-white text-black text-xl py-6">Get Pro</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 md:py-24 text-center">
        <div className="max-w-2xl mx-auto bg-brutal-yellow border-4 border-brutal-black p-10 shadow-brutal">
          <Sparkles className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Ready to Level Up?</h2>
          <p className="font-bold text-lg mb-6">Join thousands of job seekers using AI to land their dream roles.</p>
          <Link href="/register">
            <Button variant="brutal" size="lg" className="text-xl px-10 py-6 bg-brutal-black text-white hover:bg-gray-800">
              Get Started Free →
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brutal-black text-white border-t-4 border-brutal-black px-6 py-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black uppercase tracking-tighter">
            Elevara
          </div>
          <div className="flex gap-6 text-sm font-bold">
            <Link href="/login" className="hover:text-brutal-yellow">Sign In</Link>
            <Link href="/register" className="hover:text-brutal-yellow">Register</Link>
            <Link href="/dashboard" className="hover:text-brutal-yellow">Dashboard</Link>
          </div>
          <p className="text-xs opacity-50">© {new Date().getFullYear()} Elevara. Built with AI.</p>
        </div>
      </footer>
    </div>
  );
}
