"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, FileText, Target, MessageSquare, Briefcase, Map, Code2, 
  Shield, Zap, Star, CheckCircle, ArrowRight, Bot, Cpu, Volume2, 
  Award, Clock, Check, ChevronRight, Calculator, Flame, Trophy, 
  Users, Layers, ExternalLink, HelpCircle, Lock, BarChart3, Sliders
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES_DATA = [
  {
    id: "analyze",
    name: "ATS Resume Analysis",
    badge: "99.4% Accurate",
    color: "bg-brutal-yellow",
    icon: FileText,
    headline: "Multi-Domain ATS Scoring & Flaw Detection",
    desc: "Analyzes technical, MBA, engineering, design, finance, and medical resumes with deep keyword extraction, weakness auditing, and instant role-fit recommendations.",
    highlights: ["Simulated ATS Score & Job Fit", "Multi-Domain Detection (Non-CS Ready)", "Actionable Bullet Polish Recommendations"]
  },
  {
    id: "studio",
    name: "Resume Studio",
    badge: "4 Templates",
    color: "bg-brutal-pink",
    icon: Layers,
    headline: "Brutalist & Minimalist Resume Builder",
    desc: "Create, reorder, and live-edit ATS-friendly resumes across Classic, Modern, Minimal, and Brutalist designs with instant high-resolution PDF/DOCX downloads.",
    highlights: ["Live Real-Time Preview", "Custom Section Ordering & Icons", "1-Click PDF & DOCX Export"]
  },
  {
    id: "interview",
    name: "5-Round Mock Interview",
    badge: "Voice AI & Code",
    color: "bg-brutal-mint",
    icon: Briefcase,
    headline: "Gamified 5-Stage Simulation with Model Solutions",
    desc: "Practice with Aptitude, Core MCQs, Live Coding, Project Deep-Dive, and Behavioral stages. Includes live voice practice, countdown timers, progressive hints, and master model solution keys.",
    highlights: ["Speech-to-Text Voice Practice", "Instant MCQ & Code Editor Feedback", "Complete Model Solutions & Study Cheat Sheet"]
  },
  {
    id: "tailor",
    name: "Job Description Tailor",
    badge: "Instant Match",
    color: "bg-brutal-blue text-white",
    icon: Target,
    headline: "Match Any Job Description in 10 Seconds",
    desc: "Paste any job posting. The AI compares your experience, identifies critical keyword gaps, and rewrites bullet points to boost your ATS match score above 90%.",
    highlights: ["Keyword Match Score Gap Analysis", "Contextual Bullet Point Rewrites", "Zero-Hallucination Integrity"]
  },
  {
    id: "roadmap",
    name: "Career Roadmaps",
    badge: "Milestone Planner",
    color: "bg-purple-300",
    icon: Map,
    headline: "Targeted Skill-Gap Learning Milestones",
    desc: "Generate personalized, step-by-step technical roadmaps with curated project recommendations and resources to transition into higher-paying roles.",
    highlights: ["Current vs Target Skill Gap", "Step-by-Step Practical Milestones", "Curated Top-Tier Resources"]
  },
  {
    id: "github",
    name: "GitHub Portfolio & README",
    badge: "Developer Suite",
    color: "bg-orange-300",
    icon: Code2,
    headline: "Auto-Generate Portfolio & Profile README",
    desc: "Connect your GitHub username. Elevara analyzes your real public repositories, generates a developer archetype roast, and outputs a portfolio and Markdown README.",
    highlights: ["Live Public Repo Extraction", "Interactive Developer Archetype & Roast", "Copy-Ready Shields.io Profile README"]
  }
];

const MODELS_DATA = [
  { name: "Gemini 3.7 Flash", provider: "Google DeepMind", type: "Ultra Fast & Reasoning", speed: "< 0.4s", badge: "Newest Model", color: "bg-purple-200" },
  { name: "Claude Sonnet 5", provider: "Anthropic", type: "Elite Nuance & Code", speed: "High Intelligence", badge: "Pro Bar", color: "bg-red-200" },
  { name: "DeepSeek V4 Flash", provider: "DeepSeek", type: "Top Coding & Speed", speed: "Instant", badge: "Fast Coder", color: "bg-cyan-200" },
  { name: "DeepSeek R1", provider: "DeepSeek", type: "Chain-of-Thought Logic", speed: "Deep Reasoning", badge: "Reasoning CoT", color: "bg-amber-200" },
  { name: "Gemma 4 31B", provider: "Google Open", type: "Free Tier Powerhouse", speed: "Zero Cost", badge: "Free Tier", color: "bg-emerald-200" },
  { name: "Nemotron 3 Ultra", provider: "NVIDIA", type: "550B Architecture", speed: "Free Tier", badge: "Free Tier", color: "bg-pink-200" },
];

const COMPARISON_ROWS = [
  { feature: "AI Model Flexibility", elevara: "Multi-Model (Gemini 3.7, Claude 5, DeepSeek V4)", others: "Single locked legacy model" },
  { feature: "Mock Interview Depth", elevara: "5 Interactive Rounds (Voice AI + Code + Solutions)", others: "Generic text Q&A only" },
  { feature: "Pricing Structure", elevara: "Pay-As-You-Go (50 Free Credits, ₹99 packs)", others: "Expensive recurring monthly subscriptions" },
  { feature: "Domain Versatility", elevara: "All Fields (Tech, MBA, Mechanical, Design, Law)", others: "Tech / CSE only" },
  { feature: "Resume Studio & Templates", elevara: "4 Live Editable Styles with PDF/DOCX Export", others: "Watermarked or export paywalls" },
  { feature: "GitHub Portfolio Sync", elevara: "Real GitHub Repository Analyzer + Profile README", others: "Not available" },
];

const TESTIMONIALS = [
  { 
    quote: "The 5-round mock interview simulation with voice dictation and model solutions gave me the exact confidence I needed. Landed an L5 offer at Google!", 
    author: "Arjun Mehta", 
    role: "Senior Software Engineer", 
    company: "Google",
    domain: "Computer Science"
  },
  { 
    quote: "Most resume tools assume everyone is a coder. Elevara correctly detected my MBA Finance background and tailored my DCF analysis bullet points perfectly.", 
    author: "Priya Sharma", 
    role: "Investment Banking Analyst", 
    company: "Goldman Sachs",
    domain: "Finance & MBA"
  },
  { 
    quote: "The instant ATS bullet simulator took my resume score from 58 to 94. I got 4 recruiter interview invites within 5 days of updating my profile.", 
    author: "Rohan V.", 
    role: "Product Manager", 
    company: "Stripe",
    domain: "Product Management"
  },
];

export default function Home() {
  const [session, setSession] = useState(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // Interactive ATS Bullet Score Simulator
  const [simBullet, setSimBullet] = useState("Assisted the engineering team with bug fixes and helped build backend features.");
  const [simScore, setSimScore] = useState(62);
  const [simFeedback, setSimFeedback] = useState("Weak action verb. Missing quantified business impact and specific tech stack.");
  const [isSimulating, setIsSimulating] = useState(false);

  // Interactive ROI Calculator State
  const [targetSalary, setTargetSalary] = useState(18); // in Lakhs/year or k$

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleSimulateScore = () => {
    setIsSimulating(true);
    setTimeout(() => {
      if (simBullet.toLowerCase().includes("%") || simBullet.toLowerCase().includes("architected") || simBullet.toLowerCase().includes("engineered") || simBullet.toLowerCase().includes("reduced") || simBullet.toLowerCase().includes("kafka") || simBullet.toLowerCase().includes("scale")) {
        setSimScore(96);
        setSimFeedback("Outstanding! Strong action verb, quantifiable business impact, and clear architecture metrics.");
      } else {
        setSimScore(78);
        setSimFeedback("Improved, but add specific metrics (e.g., 'reduced latency by 35%') for a 95+ score.");
      }
      setIsSimulating(false);
    }, 400);
  };

  const handleApplyPresetBullet = (type) => {
    if (type === 'weak') {
      setSimBullet("Responsible for writing code and attending sprint meetings.");
      setSimScore(48);
      setSimFeedback("Passive phrasing ('Responsible for'). Lacks quantified metrics, scale, and technical depth.");
    } else {
      setSimBullet("Engineered distributed event-streaming pipeline using Apache Kafka and Go, reducing API p99 latency by 44% across 4.2M daily transactions.");
      setSimScore(98);
      setSimFeedback("Exemplary! Action verb ('Engineered'), precise stack ('Kafka, Go'), and high-impact metric ('44% latency reduction across 4.2M txns').");
    }
  };

  return (
    <div className="min-h-screen bg-brutal-bg text-black selection:bg-brutal-yellow selection:text-black">
      {/* TOP ANNOUNCEMENT TICKER */}
      <div className="bg-brutal-black text-white px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center justify-between border-b-2 border-black overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-brutal-yellow" />
          <span>NEW: Gemini 3.7 Flash & 5-Round Voice AI Mock Interviews with Live Model Solutions Active!</span>
          <Sparkles className="w-3.5 h-3.5 text-brutal-yellow" />
        </div>
      </div>

      {/* STICKY BRUTALIST NAV */}
      <nav className="sticky top-0 z-50 bg-brutal-bg/95 backdrop-blur-md border-b-4 border-brutal-black px-6 py-3.5 flex items-center justify-between shadow-[0_4px_0_#000]">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-black uppercase tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="w-8 h-8 bg-brutal-yellow border-2 border-black flex items-center justify-center font-black text-base shadow-[2px_2px_0_#000]">
              E
            </div>
            <span>Elevara</span>
          </Link>
          <span className="hidden md:inline-block px-2 py-0.5 bg-brutal-mint border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0_#000]">
            AI Career OS
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6 font-black text-xs uppercase tracking-tight">
          <a href="#features" className="hover:text-brutal-blue transition-colors">Features</a>
          <a href="#simulator" className="hover:text-brutal-blue transition-colors">ATS Simulator</a>
          <a href="#models" className="hover:text-brutal-blue transition-colors">AI Models</a>
          <a href="#comparison" className="hover:text-brutal-blue transition-colors">Why Elevara</a>
          <a href="#pricing" className="hover:text-brutal-blue transition-colors">Pricing</a>
          <Link href="/dashboard/help" className="hover:text-brutal-blue transition-colors">Docs & Help</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard">
              <Button className="text-xs font-black py-2.5 px-4 bg-brutal-yellow text-black border-2 border-black hover:bg-amber-300 shadow-[3px_3px_0_#000] transition-all">
                Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button className="bg-white border-2 border-brutal-black text-xs font-black py-2 px-3 text-black hover:bg-black hover:text-white shadow-[2px_2px_0_#000] transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-brutal-green text-black border-2 border-black text-xs font-black py-2.5 px-4 shadow-[3px_3px_0_#000] hover:bg-emerald-400 hover:-translate-y-0.5 transition-all">
                  Get 50 Free Credits →
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-12 md:pt-20 pb-16 max-w-6xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 border-3 border-black bg-white font-black uppercase text-xs shadow-[3px_3px_0_#000] rotate-[-1deg]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Adaptive Multi-Model Intelligence · Zero Subscriptions</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
          Land Your Dream Job <br className="hidden sm:inline" />
          <span className="bg-brutal-yellow px-3 py-1 border-4 border-black shadow-[6px_6px_0_#000] inline-block mt-2 sm:mt-0">
            3X Faster
          </span>{" "}
          with AI.
        </h1>

        <p className="text-base sm:text-lg md:text-xl font-bold max-w-3xl mx-auto bg-white p-4 sm:p-5 border-3 border-black shadow-[4px_4px_0_#000] leading-relaxed mb-8">
          The complete AI-powered career operating system. Analyze resumes with ATS precision, build stunning studio resumes, practice 5-round voice mock interviews with model solution keys, and tailor for any job description.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href={session ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-base sm:text-xl px-8 py-7 bg-brutal-green text-black border-4 border-brutal-black shadow-[6px_6px_0_#000] hover:bg-emerald-400 hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all font-black uppercase">
              Start Free (50 Credits Included) →
            </Button>
          </Link>
          <a href="#simulator" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-base px-6 py-7 bg-white text-black border-4 border-brutal-black shadow-[4px_4px_0_#000] hover:bg-black hover:text-white font-black uppercase transition-all">
              Try Live ATS Simulator ↓
            </Button>
          </a>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-black uppercase tracking-wider text-gray-700">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000]">
            <Shield className="w-4 h-4 text-emerald-600" /> SOC2-Ready & Private
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000]">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9/5 from 50,000+ Users
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_#000]">
            <Zap className="w-4 h-4 text-purple-600" /> Sub-Second AI Generation
          </div>
        </div>
      </section>

      {/* METRICS & PROOF MARQUEE */}
      <section className="bg-brutal-black text-white border-y-4 border-brutal-black py-6">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y-2 md:divide-y-0 md:divide-x-2 divide-gray-800">
          <div className="p-3">
            <p className="text-4xl md:text-5xl font-black text-brutal-yellow">50,000+</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 text-gray-400">Resumes Analyzed</p>
          </div>
          <div className="p-3">
            <p className="text-4xl md:text-5xl font-black text-brutal-mint">94.2%</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 text-gray-400">Interview Callback Rate</p>
          </div>
          <div className="p-3">
            <p className="text-4xl md:text-5xl font-black text-brutal-pink">5 Stages</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 text-gray-400">Voice AI Simulation</p>
          </div>
          <div className="p-3">
            <p className="text-4xl md:text-5xl font-black text-purple-400">&lt; 30s</p>
            <p className="text-xs font-black uppercase tracking-widest mt-1 text-gray-400">End-to-End Processing</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ATS BULLET SIMULATOR SECTION */}
      <section id="simulator" className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="px-3 py-1 bg-brutal-yellow border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
            Interactive Playground
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3">
            Test Your Resume Bullet Point in Real-Time
          </h2>
          <p className="font-bold text-sm text-gray-600 mt-2">
            See how top ATS engines and recruiter algorithms evaluate your impact.
          </p>
        </div>

        <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_#000] p-6 md:p-8">
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="font-black text-xs uppercase tracking-wider text-gray-600">
                Sample or Custom Resume Bullet Point:
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApplyPresetBullet('weak')}
                  className="px-2.5 py-1 text-[11px] font-black uppercase bg-red-100 border-2 border-black hover:bg-red-200 transition-colors"
                >
                  Load Weak Example
                </button>
                <button 
                  onClick={() => handleApplyPresetBullet('strong')}
                  className="px-2.5 py-1 text-[11px] font-black uppercase bg-green-100 border-2 border-black hover:bg-green-200 transition-colors"
                >
                  Load 98/100 Example
                </button>
              </div>
            </div>

            <textarea
              className="w-full min-h-[90px] p-4 border-3 border-brutal-black font-medium text-sm focus:bg-yellow-50/40 outline-none resize-y"
              value={simBullet}
              onChange={(e) => setSimBullet(e.target.value)}
              placeholder="Paste or type a bullet point from your resume..."
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t-2 border-gray-200">
              <Button
                onClick={handleSimulateScore}
                disabled={isSimulating}
                className="w-full sm:w-auto px-6 py-3 border-3 border-brutal-black bg-brutal-yellow text-black font-black uppercase text-xs shadow-[3px_3px_0_#000] hover:bg-amber-300"
              >
                {isSimulating ? "Evaluating Metrics..." : "Simulate ATS & Impact Score"}
              </Button>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-black uppercase text-gray-500">Calculated Score:</span>
                <div className={`px-4 py-1.5 border-3 border-black font-black text-xl shadow-[2px_2px_0_#000] ${
                  simScore >= 90 ? 'bg-brutal-green text-black' : simScore >= 70 ? 'bg-brutal-yellow text-black' : 'bg-red-200 text-black'
                }`}>
                  {simScore}/100
                </div>
              </div>
            </div>

            {/* Simulated AI Feedback Box */}
            <div className="bg-slate-50 border-3 border-brutal-black p-4 flex items-start gap-3 animate-in fade-in">
              <Bot className="w-5 h-5 text-brutal-blue flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Elevara AI Recruiter Feedback:</p>
                <p className="font-bold text-xs text-gray-900 mt-1">{simFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6 TOOLS INTERACTIVE SHOWCASE HUB */}
      <section id="features" className="px-6 py-16 md:py-24 bg-white border-y-4 border-brutal-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-brutal-mint border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
              Unified Career Architecture
            </span>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mt-3">
              6 Powerful AI Engines. One Platform.
            </h2>
            <p className="font-bold text-sm text-gray-600 max-w-xl mx-auto mt-2">
              Everything from resume parsing and custom studio layouts to 5-stage voice mock interviews and GitHub portfolios.
            </p>
          </div>

          {/* TAB BUTTONS */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {FEATURES_DATA.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveFeatureTab(idx)}
                  className={`px-4 py-2.5 font-black text-xs uppercase border-3 border-brutal-black flex items-center gap-2 transition-all ${
                    activeFeatureTab === idx 
                      ? 'bg-brutal-yellow shadow-[4px_4px_0_#000] scale-105' 
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{feat.name}</span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE TAB DISPLAY CARD */}
          {(() => {
            const current = FEATURES_DATA[activeFeatureTab];
            const Icon = current.icon;
            return (
              <Card className="bg-slate-50 border-4 border-brutal-black shadow-[8px_8px_0_#000] p-6 md:p-10 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-black uppercase">
                        {current.badge}
                      </span>
                      <span className={`px-2 py-0.5 border border-black font-black text-[10px] uppercase ${current.color}`}>
                        {current.name}
                      </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                      {current.headline}
                    </h3>

                    <p className="font-medium text-sm text-gray-700 leading-relaxed">
                      {current.desc}
                    </p>

                    <div className="space-y-2 pt-2">
                      {current.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 font-bold text-xs">
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link href={session ? "/dashboard" : "/register"}>
                        <Button className="px-6 py-3 border-3 border-brutal-black bg-brutal-black text-white font-black text-xs uppercase hover:bg-gray-800 shadow-[3px_3px_0_#000]">
                          Explore {current.name} in App →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-white border-3 border-brutal-black p-6 shadow-[4px_4px_0_#000] relative">
                    <div className="flex justify-between items-center border-b-2 border-gray-200 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 ${current.color} border-2 border-black flex items-center justify-center shadow-[1px_1px_0_#000]`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-xs uppercase">{current.name} Live Output</span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 border border-emerald-500">
                        AI READY
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-[11px] text-gray-800 bg-gray-50 p-4 border border-gray-200 leading-relaxed">
                      <p className="font-bold text-blue-900">// Extracted Benchmark Matrix</p>
                      <p>atsScore: <span className="font-bold text-emerald-700">96/100</span></p>
                      <p>detectedDomain: <span className="font-bold text-purple-700">&quot;Full Stack Engineering&quot;</span></p>
                      <p>actionableFeedback: <span className="font-bold text-gray-900">&quot;Optimal keyword density. Star metrics verified.&quot;</span></p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      </section>

      {/* MULTI-MODEL AI SHOWCASE SECTION */}
      <section id="models" className="px-6 py-16 md:py-24 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-purple-200 border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
            Model Intelligence Roster
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3">
            Choose Your AI Intelligence Engine
          </h2>
          <p className="font-bold text-sm text-gray-600 max-w-xl mx-auto mt-2">
            Never locked into one model. Route between Google Gemini 3.7, Claude Sonnet 5, DeepSeek V4, and Free Tier models with 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODELS_DATA.map((m, idx) => (
            <Card key={idx} className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000] hover:-translate-y-1 transition-transform">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-0.5 border border-black font-black text-[10px] uppercase ${m.color}`}>
                  {m.badge}
                </span>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{m.provider}</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-1">{m.name}</h3>
              <p className="text-xs font-bold text-gray-600 mb-4">{m.type}</p>
              <div className="flex justify-between items-center text-xs font-black border-t-2 border-gray-200 pt-3">
                <span className="text-gray-500 uppercase">Response Latency:</span>
                <span className="bg-gray-100 px-2 py-0.5 border border-black">{m.speed}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* COMPARISON MATRIX SECTION */}
      <section id="comparison" className="px-6 py-16 md:py-24 bg-white border-y-4 border-brutal-black">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-brutal-yellow border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
              Market Comparison
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3">
              Why Job Seekers Switch to Elevara
            </h2>
          </div>

          <div className="overflow-x-auto border-4 border-brutal-black shadow-[6px_6px_0_#000]">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="border-b-4 border-brutal-black bg-black text-white">
                  <th className="p-4 font-black text-xs uppercase tracking-wider">Feature Benchmark</th>
                  <th className="p-4 font-black text-xs uppercase tracking-wider bg-brutal-yellow text-black border-l-4 border-black">Elevara Career OS</th>
                  <th className="p-4 font-black text-xs uppercase tracking-wider text-gray-300 border-l-2 border-gray-700">Generic Resume Builders</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200 font-medium text-xs">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-4 font-black uppercase text-gray-900">{row.feature}</td>
                    <td className="p-4 font-black text-emerald-900 bg-emerald-50/70 border-l-4 border-black flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-700 flex-shrink-0" /> {row.elevara}
                    </td>
                    <td className="p-4 text-gray-500 border-l-2 border-gray-200">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI & SALARY ESTIMATOR SECTION */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto">
        <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[8px_8px_0_#000] p-8 text-center">
          <div className="inline-block bg-white border-2 border-black px-3 py-1 font-black text-xs uppercase mb-3 shadow-[2px_2px_0_#000]">
            Career Upside Calculator
          </div>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
            Calculate Your Interview Advantage
          </h2>
          <p className="font-bold text-sm text-gray-800 mb-6">
            Drag your expected target role compensation to view estimated career ROI.
          </p>

          <div className="bg-white border-3 border-black p-6 shadow-[4px_4px_0_#000] max-w-xl mx-auto text-left space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 font-black text-xs uppercase">
                <span>Target Compensation:</span>
                <span className="text-base text-brutal-blue bg-black px-2 py-0.5">₹{targetSalary} LPA</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="60" 
                value={targetSalary} 
                onChange={(e) => setTargetSalary(Number(e.target.value))}
                className="w-full accent-brutal-black cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-200 text-center">
              <div className="p-3 bg-emerald-50 border-2 border-emerald-600">
                <p className="text-[10px] font-black uppercase text-emerald-800">Est. Callback Increase</p>
                <p className="text-2xl font-black text-emerald-900 mt-1">+340%</p>
              </div>
              <div className="p-3 bg-blue-50 border-2 border-blue-600">
                <p className="text-[10px] font-black uppercase text-blue-800">Upside on ₹99 pack</p>
                <p className="text-2xl font-black text-blue-900 mt-1">&gt; 1,800x ROI</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* TESTIMONIALS & SOCIAL PROOF */}
      <section className="px-6 py-16 md:py-24 bg-slate-100 border-y-4 border-brutal-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-brutal-pink border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
              Candidate Wall of Fame
            </span>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3">
              Proven Results Across Top Companies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Card key={idx} className="bg-white border-4 border-brutal-black p-6 shadow-[6px_6px_0_#000] flex flex-col justify-between hover:-translate-y-1.5 transition-transform">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black bg-gray-100 px-2 py-0.5 border border-black uppercase">
                      {t.domain}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-gray-900 italic leading-relaxed mb-6">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="border-t-2 border-gray-200 pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-black text-sm uppercase">{t.author}</p>
                    <p className="text-xs font-bold text-gray-500">{t.role}</p>
                  </div>
                  <span className="px-2 py-1 bg-black text-white font-black text-xs tracking-tight">
                    {t.company}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="px-3 py-1 bg-brutal-green border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0_#000]">
            Transparent Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mt-3">
            Pay For What You Use. No Subscriptions.
          </h2>
          <p className="font-bold text-sm text-gray-600 mt-2">
            Credits never expire. Top up only when you need active job search tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* FREE PLAN */}
          <Card className="bg-white border-4 border-brutal-black p-6 shadow-[6px_6px_0_#000] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase bg-gray-200 px-2 py-0.5 border border-black">
                Starter Tier
              </span>
              <h3 className="text-2xl font-black uppercase mt-2">Free Signup</h3>
              <div className="text-4xl font-black my-4">₹0</div>
              <p className="text-xs font-bold text-gray-600 mb-6">Explore the full platform immediately upon registration.</p>
              <ul className="space-y-2.5 font-bold text-xs border-t-2 border-gray-200 pt-4">
                <li className="flex items-center gap-2">✓ 50 Free AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Access to All 6 AI Career Engines</li>
                <li className="flex items-center gap-2">✓ Full Resume Studio & PDF Export</li>
                <li className="flex items-center gap-2">✓ Free Tier AI Models Included</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button className="w-full py-3 border-3 border-brutal-black bg-white text-black font-black text-xs uppercase hover:bg-gray-100 shadow-[2px_2px_0_#000]">
                Sign Up Free →
              </Button>
            </Link>
          </Card>

          {/* BASIC PACK */}
          <Card className="bg-white border-4 border-brutal-black p-6 shadow-[6px_6px_0_#000] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase bg-blue-200 px-2 py-0.5 border border-black">
                Top Up
              </span>
              <h3 className="text-2xl font-black uppercase mt-2">Basic Pack</h3>
              <div className="text-4xl font-black my-4">₹99</div>
              <p className="text-xs font-bold text-gray-600 mb-6">Perfect for polishing your resume and practicing 2-3 interviews.</p>
              <ul className="space-y-2.5 font-bold text-xs border-t-2 border-gray-200 pt-4">
                <li className="flex items-center gap-2">✓ 100 AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Gemini 3.7 & Claude Access</li>
                <li className="flex items-center gap-2">✓ Voice Mock Interview Simulation</li>
                <li className="flex items-center gap-2">✓ Lifetime Credit Validity</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button className="w-full py-3 border-3 border-brutal-black bg-brutal-yellow text-black font-black text-xs uppercase hover:bg-amber-300 shadow-[3px_3px_0_#000]">
                Get 100 Credits →
              </Button>
            </Link>
          </Card>

          {/* PRO PACK */}
          <Card className="bg-brutal-yellow border-4 border-brutal-black p-6 shadow-[8px_8px_0_#000] flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 right-4 bg-black text-white text-[10px] font-black uppercase px-3 py-1 border border-black shadow-[2px_2px_0_#fff]">
              Most Popular
            </div>
            <div>
              <span className="text-[10px] font-black uppercase bg-white px-2 py-0.5 border border-black">
                Pro Powerhouse
              </span>
              <h3 className="text-2xl font-black uppercase mt-2">Career Pro</h3>
              <div className="text-4xl font-black my-4">₹399</div>
              <p className="text-xs font-bold text-gray-900 mb-6">Comprehensive preparation for full job hunt seasons.</p>
              <ul className="space-y-2.5 font-bold text-xs border-t-2 border-black/20 pt-4 text-gray-950">
                <li className="flex items-center gap-2">✓ 500 AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Priority BullMQ Worker Execution</li>
                <li className="flex items-center gap-2">✓ Unlimited Voice Mock Interviews</li>
                <li className="flex items-center gap-2">✓ Full Model Solutions & Study Guides</li>
                <li className="flex items-center gap-2">✓ Priority Developer Support</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button className="w-full py-3 border-3 border-brutal-black bg-black text-white font-black text-xs uppercase hover:bg-gray-800 shadow-[3px_3px_0_#fff]">
                Get 500 Pro Credits →
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <div className="bg-brutal-mint border-4 border-brutal-black p-10 md:p-14 shadow-[8px_8px_0_#000]">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-black animate-bounce" />
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">
            Ready to Fast-Track Your Career?
          </h2>
          <p className="font-bold text-sm md:text-base text-gray-800 max-w-xl mx-auto mb-8">
            Join thousands of ambitious job seekers landing top offers at Google, Amazon, Microsoft, Goldman Sachs, and Stripe.
          </p>
          <Link href="/register">
            <Button className="text-base sm:text-xl px-10 py-7 border-4 border-brutal-black bg-brutal-black text-white font-black uppercase hover:bg-gray-800 shadow-[6px_6px_0_#000] hover:shadow-none hover:translate-x-1.5 hover:translate-y-1.5 transition-all">
              Claim Your 50 Free Credits Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* BRUTALIST FOOTER */}
      <footer className="bg-brutal-black text-white border-t-4 border-brutal-black px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-brutal-yellow text-black border border-white flex items-center justify-center font-black text-xs">
                E
              </div>
              <span className="text-xl font-black uppercase tracking-tight">Elevara</span>
            </div>
            <p className="text-xs text-gray-400 font-medium">
              The professional AI Career Operating System. Built for serious job seekers across all global disciplines.
            </p>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brutal-yellow mb-3">AI Engines</p>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/dashboard/analyze" className="hover:text-white">ATS Resume Parser</Link></li>
              <li><Link href="/dashboard/studio" className="hover:text-white">Resume Studio</Link></li>
              <li><Link href="/dashboard/tools/mock-interview" className="hover:text-white">5-Stage Mock Interview</Link></li>
              <li><Link href="/dashboard/tools/tailor" className="hover:text-white">Job Match Tailor</Link></li>
              <li><Link href="/dashboard/tools/roadmap" className="hover:text-white">Career Roadmaps</Link></li>
              <li><Link href="/dashboard/tools/github" className="hover:text-white">GitHub Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brutal-mint mb-3">Resources & Docs</p>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li><Link href="/dashboard/help" className="hover:text-white">Help & Documentation</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white">Mock Interview Voice Guide</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white">Model Selection Guide</Link></li>
              <li><Link href="/dashboard/tracker" className="hover:text-white">Application Kanban</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-wider text-brutal-pink mb-3">Security & Trust</p>
            <ul className="space-y-2 text-xs font-bold text-gray-300">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encryption</li>
              <li>Zero Data Selling / Scraping</li>
              <li>Isolated User Cloud Stores</li>
              <li>GDPR & CCPA Compliant</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-medium text-gray-500">
          <p>© {new Date().getFullYear()} Elevara Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4 font-bold text-gray-400">
            <Link href="/login" className="hover:text-white">Sign In</Link>
            <Link href="/register" className="hover:text-white">Register</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
