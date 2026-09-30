"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { 
  Sparkles, FileText, Target, Briefcase, Map, Code2, 
  Shield, Zap, Star, CheckCircle, ArrowRight, Bot, Check,
  Trophy, Layers, Lock, ChevronRight, Play, Globe, Cpu,
  Users, TrendingUp, Award, BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/* ─── Data Constants ─── */
const FEATURES_DATA = [
  {
    id: "analyze",
    name: "ATS Resume Analysis",
    badge: "99.4% Accurate",
    icon: FileText,
    headline: "Multi-Domain ATS Scoring & Flaw Detection",
    desc: "Analyzes technical, MBA, engineering, design, finance, and medical resumes with deep keyword extraction, weakness auditing, and instant role-fit recommendations.",
    highlights: ["Simulated ATS Score & Job Fit", "Multi-Domain Detection (Non-CS Ready)", "Actionable Bullet Polish Recommendations"],
    gradient: "from-blue-500/20 to-violet-500/20"
  },
  {
    id: "studio",
    name: "Resume Studio",
    badge: "4 Templates",
    icon: Layers,
    headline: "Modern & Minimalist Resume Builder",
    desc: "Create, reorder, and live-edit ATS-friendly resumes across Classic, Modern, Minimal, and Editorial designs with instant high-resolution PDF/DOCX downloads.",
    highlights: ["Live Real-Time Preview", "Custom Section Ordering & Formatting", "1-Click PDF & DOCX Export"],
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: "interview",
    name: "5-Round Mock Interview",
    badge: "Voice AI & Code",
    icon: Briefcase,
    headline: "Gamified 5-Stage Simulation with Model Solutions",
    desc: "Practice with Aptitude, Core MCQs, Live Coding, Project Deep-Dive, and Behavioral stages. Includes live voice practice, countdown timers, progressive hints, and master model solution keys.",
    highlights: ["Speech-to-Text Voice Practice", "Instant MCQ & Code Editor Feedback", "Complete Model Solutions & Study Cheat Sheet"],
    gradient: "from-orange-500/20 to-rose-500/20"
  },
  {
    id: "tailor",
    name: "Job Description Tailor",
    badge: "Instant Match",
    icon: Target,
    headline: "Match Any Job Description in 10 Seconds",
    desc: "Paste any job posting. The AI compares your experience, identifies critical keyword gaps, and rewrites bullet points to boost your ATS match score above 90%.",
    highlights: ["Keyword Match Score Gap Analysis", "Contextual Bullet Point Rewrites", "Zero-Hallucination Integrity"],
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: "roadmap",
    name: "Career Roadmaps",
    badge: "Milestone Planner",
    icon: Map,
    headline: "Targeted Skill-Gap Learning Milestones",
    desc: "Generate personalized, step-by-step technical roadmaps with curated project recommendations and resources to transition into higher-paying roles.",
    highlights: ["Current vs Target Skill Gap", "Step-by-Step Practical Milestones", "Curated Top-Tier Resources"],
    gradient: "from-violet-500/20 to-purple-500/20"
  },
  {
    id: "github",
    name: "GitHub Portfolio & README",
    badge: "Developer Suite",
    icon: Code2,
    headline: "Auto-Generate Portfolio & Profile README",
    desc: "Connect your GitHub username. Elevara analyzes your real public repositories, generates a developer archetype roast, and outputs a portfolio and Markdown README.",
    highlights: ["Live Public Repo Extraction", "Interactive Developer Archetype & Roast", "Copy-Ready Shields.io Profile README"],
    gradient: "from-pink-500/20 to-rose-500/20"
  }
];

const MODELS_DATA = [
  { name: "Gemini 3.7 Flash", provider: "Google DeepMind", type: "Ultra Fast & Reasoning", speed: "< 0.4s", badge: "Newest Model", color: "from-blue-500 to-cyan-500" },
  { name: "Claude Sonnet 5", provider: "Anthropic", type: "Elite Nuance & Code", speed: "High Intelligence", badge: "Pro Tier", color: "from-orange-500 to-amber-500" },
  { name: "DeepSeek V4 Flash", provider: "DeepSeek", type: "Top Coding & Speed", speed: "Instant", badge: "Fast Coder", color: "from-emerald-500 to-green-500" },
  { name: "DeepSeek R1", provider: "DeepSeek", type: "Chain-of-Thought Logic", speed: "Deep Reasoning", badge: "Reasoning CoT", color: "from-violet-500 to-purple-500" },
  { name: "Gemma 4 31B", provider: "Google Open", type: "Free Tier Powerhouse", speed: "Zero Cost", badge: "Free Tier", color: "from-teal-500 to-cyan-500" },
  { name: "Nemotron 3 Ultra", provider: "NVIDIA", type: "550B Architecture", speed: "Free Tier", badge: "Free Tier", color: "from-lime-500 to-emerald-500" },
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
    domain: "Software Engineering"
  },
  { 
    quote: "The Job Description Tailor helped me identify 6 missing keywords and rephrased my bullet points. My ATS callback rate jumped from 5% to over 40%.", 
    author: "Priya Sharma", 
    role: "Product Manager", 
    company: "Razorpay",
    domain: "Product Management"
  },
  { 
    quote: "Resume Studio saved me hours. The clean typography and ATS validation gave me a flawless resume that passed every enterprise scanner effortlessly.", 
    author: "David Chen", 
    role: "Data Architect", 
    company: "Amazon",
    domain: "Data & Cloud"
  },
];

/* ─── Animated Counter Hook ─── */
function useCountUp(end, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [hasStarted, end, duration]);

  return { count, ref };
}

/* ─── Scroll Reveal Hook ─── */
function useScrollReveal() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

/* ─── Reveal Wrapper ─── */
function Reveal({ children, className = "", delay = 0 }) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [session, setSession] = useState(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  // Interactive ATS Bullet Simulator State
  const [simBullet, setSimBullet] = useState("Engineered distributed event-streaming pipeline using Apache Kafka and Go, reducing API p99 latency by 44% across 4.2M daily transactions.");
  const [simScore, setSimScore] = useState(98);
  const [simFeedback, setSimFeedback] = useState("Exemplary! Action verb ('Engineered'), precise stack ('Kafka, Go'), and high-impact metric ('44% latency reduction across 4.2M txns').");
  const [isSimulating, setIsSimulating] = useState(false);

  // Interactive ROI Calculator State
  const [targetSalary, setTargetSalary] = useState(18);

  // Animated counters
  const resumeCounter = useCountUp(50000, 2000);
  const callbackCounter = useCountUp(94, 1800);
  const processingCounter = useCountUp(30, 1500);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-cycle features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeatureTab(prev => (prev + 1) % FEATURES_DATA.length);
    }, 5000);
    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-(--canvas) text-(--ink) selection:bg-(--primary) selection:text-white transition-colors overflow-x-hidden">

      {/* ═══════ STICKY GLASSMORPHISM NAV ═══════ */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-3 flex items-center justify-between transition-all duration-500 ${
          navScrolled 
            ? 'bg-(--canvas)/80 backdrop-blur-2xl shadow-[0_1px_0_var(--hairline),0_8px_30px_-8px_rgba(0,0,0,0.08)]' 
            : 'bg-transparent'
        }`}
      >
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:opacity-80 transition-opacity flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-(--primary) to-(--primary-active) rounded-xl flex items-center justify-center text-white font-serif font-medium text-base shadow-md group-hover:shadow-lg transition-shadow">
              E
            </div>
            <span className="text-xl font-serif font-medium text-(--ink) tracking-tight">Elevara</span>
          </Link>
          <span className="hidden md:inline-block px-3 py-1 bg-(--primary)/8 text-(--primary) rounded-full text-[11px] font-semibold tracking-wide border border-(--primary)/15">
            AI Career OS
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8 font-medium text-sm text-(--muted)">
          <a href="#features" className="hover:text-(--ink) transition-colors relative group">
            Features
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-(--primary) rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#simulator" className="hover:text-(--ink) transition-colors relative group">
            Demo
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-(--primary) rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#models" className="hover:text-(--ink) transition-colors relative group">
            AI Models
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-(--primary) rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>
          <a href="#pricing" className="hover:text-(--ink) transition-colors relative group">
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-(--primary) rounded-full group-hover:w-full transition-all duration-300"></span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard">
              <Button className="text-sm font-semibold py-2.5 px-5 rounded-xl transition-all shadow-md hover:shadow-lg">
                Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden sm:inline-block">
                <Button variant="secondary" className="text-sm font-medium py-2.5 px-4 rounded-xl transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl text-sm font-semibold py-2.5 px-5 transition-all shadow-md hover:shadow-lg">
                  Start Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative pt-28 md:pt-36 pb-20 md:pb-28 px-6 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-(--primary)/15 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-500/8 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-500/6 to-transparent blur-3xl animate-pulse" style={{ animationDuration: '7s', animationDelay: '4s' }} />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--ink) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Status pill */}
          <Reveal>
            <div className="inline-flex items-center gap-2.5 px-5 py-2 mb-8 bg-(--glass-card) backdrop-blur-xl border border-(--glass-border) rounded-full font-medium text-sm text-(--muted) shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>Adaptive Multi-Model Intelligence · Zero Subscriptions</span>
            </div>
          </Reveal>

          {/* Main heading */}
          <Reveal delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-light leading-[0.95] mb-8 text-(--ink) tracking-tight">
              Land Your Dream Job{" "}
              <br className="hidden sm:inline" />
              <span className="relative inline-block mt-2 sm:mt-0">
                <span className="bg-gradient-to-r from-(--primary) via-(--primary-hover) to-(--accent-amber) bg-clip-text text-transparent font-serif italic">
                  3× Faster
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                  <path d="M2 6C50 2 150 2 198 6" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
                </svg>
              </span>{" "}
              with AI.
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={0.2}>
            <p className="text-lg sm:text-xl max-w-3xl mx-auto text-(--muted) leading-relaxed mb-10 font-light">
              The complete AI-powered career operating system. Analyze resumes with ATS precision, 
              build stunning studio resumes, practice 5-round voice mock interviews, and tailor for any job.
            </p>
          </Reveal>

          {/* CTA BUTTONS */}
          <Reveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href={session ? "/dashboard" : "/register"} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto text-base px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold group">
                  Start Free — 50 Credits Included
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="#simulator" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto text-base px-6 py-4 rounded-2xl shadow-sm font-medium transition-all group">
                  <Play className="w-4 h-4 mr-2" />
                  Try Live Demo
                </Button>
              </a>
            </div>
          </Reveal>

          {/* TRUST BADGES */}
          <Reveal delay={0.4}>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium text-(--muted)">
              <div className="flex items-center gap-2 px-4 py-2 bg-(--glass-card) backdrop-blur-sm border border-(--glass-border) rounded-full">
                <Shield className="w-4 h-4 text-emerald-500" /> SOC2-Ready & Private
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-(--glass-card) backdrop-blur-sm border border-(--glass-border) rounded-full">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 4.9/5 from 50,000+ Users
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-(--glass-card) backdrop-blur-sm border border-(--glass-border) rounded-full">
                <Zap className="w-4 h-4 text-(--primary)" /> Sub-Second AI Responses
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ ANIMATED SOCIAL PROOF METRICS ═══════ */}
      <Reveal>
        <section className="relative px-6 py-16 border-y border-(--hairline)">
          <div className="absolute inset-0 bg-gradient-to-r from-(--primary)/3 via-transparent to-(--primary)/3" />
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            <div ref={resumeCounter.ref} className="group">
              <p className="text-4xl md:text-5xl font-serif font-medium bg-gradient-to-br from-(--primary) to-(--accent-amber) bg-clip-text text-transparent">
                {resumeCounter.count.toLocaleString()}+
              </p>
              <p className="text-sm font-medium mt-2 text-(--muted) group-hover:text-(--ink) transition-colors">Resumes Analyzed</p>
            </div>
            <div ref={callbackCounter.ref} className="group">
              <p className="text-4xl md:text-5xl font-serif font-medium text-emerald-500">
                {callbackCounter.count}%
              </p>
              <p className="text-sm font-medium mt-2 text-(--muted) group-hover:text-(--ink) transition-colors">Interview Callback Rate</p>
            </div>
            <div className="group">
              <p className="text-4xl md:text-5xl font-serif font-medium text-(--ink)">5 Stages</p>
              <p className="text-sm font-medium mt-2 text-(--muted) group-hover:text-(--ink) transition-colors">Voice AI Mock Interview</p>
            </div>
            <div ref={processingCounter.ref} className="group">
              <p className="text-4xl md:text-5xl font-serif font-medium bg-gradient-to-br from-(--primary) to-violet-500 bg-clip-text text-transparent">
                &lt; {processingCounter.count}s
              </p>
              <p className="text-sm font-medium mt-2 text-(--muted) group-hover:text-(--ink) transition-colors">End-to-End Processing</p>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════ ATS BULLET SIMULATOR ═══════ */}
      <section id="simulator" className="px-6 py-20 md:py-28 max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--primary)/8 text-(--primary) font-semibold text-sm rounded-full border border-(--primary)/15">
              <Sparkles className="w-4 h-4" /> Interactive Playground
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
              Test Your Resume Bullet Point
            </h2>
            <p className="text-base text-(--muted) mt-3 max-w-xl mx-auto">
              See how top ATS engines and recruiter algorithms evaluate your impact in real-time.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl shadow-lg p-6 md:p-10 relative overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-(--primary)/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-6 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-semibold text-(--ink)">
                  Sample or Custom Resume Bullet Point
                </label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleApplyPresetBullet('weak')}
                    className="px-3 py-1.5 text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                  >
                    Load Weak Example
                  </button>
                  <button 
                    onClick={() => handleApplyPresetBullet('strong')}
                    className="px-3 py-1.5 text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all"
                  >
                    Load 98/100 Example
                  </button>
                </div>
              </div>

              <textarea
                className="w-full min-h-[100px] p-4 bg-(--surface-soft) border border-(--hairline) rounded-2xl text-base text-(--ink) placeholder:text-(--muted-soft) focus:border-(--primary) focus:ring-2 focus:ring-(--primary)/10 outline-none resize-y transition-all"
                value={simBullet}
                onChange={(e) => setSimBullet(e.target.value)}
                placeholder="Paste or type a bullet point from your resume..."
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-(--hairline-soft)">
                <Button
                  onClick={handleSimulateScore}
                  disabled={isSimulating}
                  className="w-full sm:w-auto text-sm py-3 px-6 rounded-xl"
                >
                  {isSimulating ? "Evaluating Metrics..." : "Simulate ATS & Impact Score"}
                </Button>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="text-sm font-medium text-(--muted)">Score:</span>
                  <div className={`px-5 py-2 rounded-2xl border text-lg font-serif font-semibold transition-all ${
                    simScore >= 90 ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-500' : simScore >= 70 ? 'bg-amber-500/10 border-amber-500/25 text-amber-500' : 'bg-red-500/10 border-red-500/25 text-red-500'
                  }`}>
                    {simScore}/100
                  </div>
                </div>
              </div>

              {/* AI Feedback Box */}
              <div className="bg-gradient-to-r from-(--primary)/5 to-transparent border border-(--primary)/15 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-(--primary)/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-(--primary)" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-(--primary) mb-1">Elevara AI Recruiter Feedback</p>
                  <p className="text-base text-(--ink) leading-relaxed">{simFeedback}</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════ 6 TOOLS BENTO SHOWCASE ═══════ */}
      <section id="features" className="px-6 py-20 md:py-28 border-y border-(--hairline)">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--primary)/8 text-(--primary) border border-(--primary)/15 font-semibold text-sm rounded-full">
                <Cpu className="w-4 h-4" /> Unified Career Architecture
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
                6 Powerful AI Engines. One Platform.
              </h2>
              <p className="text-base text-(--muted) max-w-xl mx-auto mt-3">
                Everything from resume parsing and custom studio layouts to 5-stage voice mock interviews and GitHub portfolios.
              </p>
            </div>
          </Reveal>

          {/* TAB BUTTONS */}
          <Reveal delay={0.1}>
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {FEATURES_DATA.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`px-4 py-2.5 font-medium text-sm rounded-xl border flex items-center gap-2 transition-all duration-300 ${
                      activeFeatureTab === idx 
                        ? 'bg-(--primary) text-white border-(--primary) shadow-md scale-[1.03]' 
                        : 'bg-(--surface-card) border-(--hairline) text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) hover:border-(--hairline-soft)'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{feat.name}</span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ACTIVE TAB DISPLAY CARD */}
          <Reveal delay={0.2}>
            {(() => {
              const current = FEATURES_DATA[activeFeatureTab];
              const Icon = current.icon;
              return (
                <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl shadow-lg p-8 md:p-12 relative overflow-hidden transition-all duration-500">
                  {/* Background gradient accent */}
                  <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${current.gradient} rounded-full blur-3xl opacity-60 pointer-events-none transition-all duration-700`} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) rounded-full text-sm font-medium">
                          {current.badge}
                        </span>
                        <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 rounded-full text-sm font-semibold">
                          {current.name}
                        </span>
                      </div>

                      <h3 className="text-2xl md:text-4xl font-serif font-medium text-(--ink) leading-tight tracking-tight">
                        {current.headline}
                      </h3>

                      <p className="text-base text-(--muted) leading-relaxed">
                        {current.desc}
                      </p>

                      <div className="space-y-3 pt-2">
                        {current.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-3 text-base font-medium text-(--ink)">
                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4">
                        <Link href={session ? "/dashboard" : "/register"}>
                          <Button className="text-sm py-3 px-6 rounded-xl group">
                            Explore {current.name}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="lg:col-span-5 bg-(--surface-soft) border border-(--hairline-soft) rounded-2xl p-6 shadow-sm relative">
                      <div className="flex justify-between items-center border-b border-(--hairline-soft) pb-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-semibold text-sm text-(--ink)">{current.name}</span>
                        </div>
                        <span className="text-sm font-medium bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          LIVE
                        </span>
                      </div>

                      <div className="space-y-2.5 font-mono text-sm text-(--ink) bg-(--surface-card) p-4 rounded-xl border border-(--hairline-soft) leading-relaxed">
                        <p className="text-(--primary) font-medium">{"// Extracted Benchmark Matrix"}</p>
                        <p>atsScore: <span className="font-medium text-emerald-500">96/100</span></p>
                        <p>detectedDomain: <span className="font-medium text-(--ink)">&quot;Full Stack Engineering&quot;</span></p>
                        <p>actionableFeedback: <span className="text-(--muted)">&quot;Optimal keyword density.&quot;</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </Reveal>
        </div>
      </section>

      {/* ═══════ MULTI-MODEL AI SHOWCASE ═══════ */}
      <section id="models" className="px-6 py-20 md:py-28 max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--primary)/8 text-(--primary) border border-(--primary)/15 font-semibold text-sm rounded-full">
              <Globe className="w-4 h-4" /> Model Intelligence Roster
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
              Choose Your AI Engine
            </h2>
            <p className="text-base text-(--muted) max-w-xl mx-auto mt-3">
              Never locked into one model. Route between Google Gemini, Claude, DeepSeek, and Free Tier models.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODELS_DATA.map((m, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-(--primary)/30 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden h-full">
                {/* Gradient glow on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl`} />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${m.color} text-white`}>
                      {m.badge}
                    </span>
                    <span className="text-sm text-(--muted)">{m.provider}</span>
                  </div>
                  <h3 className="text-xl font-serif font-medium text-(--ink) mb-1">{m.name}</h3>
                  <p className="text-sm text-(--muted) mb-5">{m.type}</p>
                  <div className="flex justify-between items-center text-sm font-medium border-t border-(--hairline-soft) pt-4">
                    <span className="text-(--muted)">Response Speed</span>
                    <span className="bg-(--surface-soft) px-3 py-1 rounded-lg border border-(--hairline-soft) text-(--ink)">{m.speed}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════ COMPARISON MATRIX ═══════ */}
      <section id="comparison" className="px-6 py-20 md:py-28 border-y border-(--hairline)">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--primary)/8 text-(--primary) border border-(--primary)/15 font-semibold text-sm rounded-full">
                <BarChart3 className="w-4 h-4" /> Market Comparison
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
                Why Job Seekers Switch to Elevara
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="overflow-x-auto rounded-3xl border border-(--hairline) shadow-lg">
              <table className="w-full text-left border-collapse bg-(--surface-card)">
                <thead>
                  <tr className="border-b border-(--hairline) bg-(--surface-soft)">
                    <th className="p-5 font-semibold text-sm text-(--ink)">Feature Benchmark</th>
                    <th className="p-5 font-semibold text-sm text-(--primary) border-l border-(--hairline-soft)">Elevara Career OS</th>
                    <th className="p-5 font-semibold text-sm text-(--muted) border-l border-(--hairline-soft)">Generic Resume Builders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--hairline-soft) text-sm">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-(--surface-soft)/50 transition-colors">
                      <td className="p-5 font-medium text-(--ink)">{row.feature}</td>
                      <td className="p-5 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 border-l border-(--hairline-soft)">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> {row.elevara}
                        </div>
                      </td>
                      <td className="p-5 text-(--muted) border-l border-(--hairline-soft)">{row.others}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ ROI CALCULATOR ═══════ */}
      <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto">
        <Reveal>
          <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl shadow-lg p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-(--primary) via-(--accent-amber) to-(--primary)" />
            
            <div className="inline-flex items-center gap-2 bg-(--primary)/8 text-(--primary) border border-(--primary)/15 px-4 py-1.5 font-semibold text-sm rounded-full mb-5">
              <TrendingUp className="w-4 h-4" /> Career Upside Calculator
            </div>
            <h2 className="text-2xl md:text-4xl font-serif font-medium text-(--ink) mb-3 tracking-tight">
              Calculate Your Interview Advantage
            </h2>
            <p className="text-base text-(--muted) mb-8 max-w-lg mx-auto">
              Drag your expected target role compensation to view estimated career ROI.
            </p>

            <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-2xl p-6 md:p-8 shadow-sm max-w-xl mx-auto text-left space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3 font-medium text-sm text-(--ink)">
                  <span>Target Compensation:</span>
                  <span className="text-lg text-(--primary) bg-(--surface-card) px-4 py-1 rounded-xl border border-(--hairline-soft) font-serif font-semibold">₹{targetSalary} LPA</span>
                </div>
                <input 
                  type="range" 
                  min="6" 
                  max="60" 
                  value={targetSalary} 
                  onChange={(e) => setTargetSalary(Number(e.target.value))}
                  className="w-full accent-(--primary) cursor-pointer h-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-(--hairline-soft) text-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <p className="text-sm font-medium text-emerald-500">Est. Callback Increase</p>
                  <p className="text-3xl font-serif font-semibold text-emerald-500 mt-2">+340%</p>
                </div>
                <div className="p-4 bg-(--primary)/10 border border-(--primary)/20 rounded-2xl">
                  <p className="text-sm font-medium text-(--primary)">ROI on ₹99 pack</p>
                  <p className="text-3xl font-serif font-semibold text-(--primary) mt-2">&gt; 1,800×</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="px-6 py-20 md:py-28 border-y border-(--hairline)">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-(--primary)/8 text-(--primary) border border-(--primary)/15 font-semibold text-sm rounded-full">
                <Award className="w-4 h-4" /> Candidate Wall of Fame
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
                Proven Results Across Top Companies
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={idx} delay={idx * 0.1}>
                <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-7 shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-(--primary)/25 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex text-amber-500 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm font-medium bg-(--surface-soft) text-(--muted) px-3 py-1 rounded-lg border border-(--hairline-soft)">
                        {t.domain}
                      </span>
                    </div>
                    <p className="text-base text-(--body) italic leading-relaxed mb-8">
                      &quot;{t.quote}&quot;
                    </p>
                  </div>

                  <div className="border-t border-(--hairline-soft) pt-5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm text-(--ink)">{t.author}</p>
                      <p className="text-sm text-(--muted)">{t.role}</p>
                    </div>
                    <span className="px-3 py-1.5 bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) rounded-xl font-semibold text-sm">
                      {t.company}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ PRICING PLANS ═══════ */}
      <section id="pricing" className="px-6 py-20 md:py-28 max-w-5xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15 font-semibold text-sm rounded-full">
              <CheckCircle className="w-4 h-4" /> Transparent Pricing
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-4 text-(--ink) tracking-tight">
              Pay For What You Use. No Subscriptions.
            </h2>
            <p className="text-base text-(--muted) mt-3">
              Credits never expire. Top up only when you need active job search tools.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* FREE PLAN */}
          <Reveal delay={0}>
            <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl p-7 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 h-full">
              <div>
                <span className="text-sm font-medium bg-(--surface-soft) text-(--muted) px-3 py-1 rounded-full border border-(--hairline-soft)">
                  Starter Tier
                </span>
                <h3 className="text-2xl font-serif font-medium text-(--ink) mt-4">Free Signup</h3>
                <div className="text-4xl font-serif font-medium text-(--ink) my-5">₹0</div>
                <p className="text-sm text-(--muted) mb-6">Explore the full platform upon registration.</p>
                <ul className="space-y-3 text-sm text-(--body) border-t border-(--hairline-soft) pt-5">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 50 Free AI Credits</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> All 6 AI Career Engines</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Full Resume Studio & Export</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Free Tier AI Models</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button variant="secondary" className="w-full text-sm py-3 rounded-xl">
                  Sign Up Free <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* BASIC PACK */}
          <Reveal delay={0.1}>
            <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl p-7 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all duration-300 h-full">
              <div>
                <span className="text-sm font-semibold bg-(--primary)/10 text-(--primary) px-3 py-1 rounded-full border border-(--primary)/20">
                  Top Up
                </span>
                <h3 className="text-2xl font-serif font-medium text-(--ink) mt-4">Basic Pack</h3>
                <div className="text-4xl font-serif font-medium text-(--ink) my-5">₹99</div>
                <p className="text-sm text-(--muted) mb-6">Perfect for polishing resumes and practicing 2-3 interviews.</p>
                <ul className="space-y-3 text-sm text-(--body) border-t border-(--hairline-soft) pt-5">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 100 AI Credits</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Gemini 3.7 & Claude Access</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Voice Mock Interviews</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Lifetime Credit Validity</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full text-sm py-3 rounded-xl">
                  Get 100 Credits <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Reveal>

          {/* PRO PACK */}
          <Reveal delay={0.2}>
            <div className="bg-(--surface-card) border-2 border-(--primary) rounded-3xl p-7 shadow-lg flex flex-col justify-between relative h-full">
              <div className="absolute -top-3.5 right-5 bg-gradient-to-r from-(--primary) to-(--primary-active) text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>
              <div>
                <span className="text-sm font-semibold bg-(--primary)/10 text-(--primary) px-3 py-1 rounded-full border border-(--primary)/20">
                  Pro Powerhouse
                </span>
                <h3 className="text-2xl font-serif font-medium text-(--ink) mt-4">Career Pro</h3>
                <div className="text-4xl font-serif font-medium text-(--primary) my-5">₹399</div>
                <p className="text-sm text-(--muted) mb-6">Comprehensive preparation for full job hunt seasons.</p>
                <ul className="space-y-3 text-sm text-(--body) border-t border-(--hairline-soft) pt-5">
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> 500 AI Credits</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Priority Execution</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited Voice Interviews</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Full Model Solutions</li>
                  <li className="flex items-center gap-2.5"><CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> Priority Support</li>
                </ul>
              </div>
              <Link href="/register" className="mt-8">
                <Button className="w-full text-sm py-3 rounded-xl shadow-md">
                  Get 500 Pro Credits <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <Reveal>
        <section className="px-6 py-20 md:py-28 max-w-4xl mx-auto text-center">
          <div className="relative bg-(--surface-card) border border-(--hairline) rounded-[2rem] p-12 md:p-16 shadow-xl overflow-hidden">
            {/* Glowing orbs */}
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-(--primary)/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-(--primary)/20 to-(--primary)/5 rounded-2xl flex items-center justify-center border border-(--primary)/15">
                <Trophy className="w-8 h-8 text-(--primary)" />
              </div>
              <h2 className="text-3xl md:text-5xl font-serif font-light text-(--ink) mb-4 tracking-tight">
                Ready to Fast-Track Your Career?
              </h2>
              <p className="text-base md:text-lg text-(--muted) max-w-xl mx-auto mb-10 leading-relaxed">
                Join thousands of ambitious job seekers landing top offers at Google, Amazon, Microsoft, and Stripe.
              </p>
              <Link href="/register">
                <Button className="text-base md:text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold group">
                  Claim Your 50 Free Credits Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="bg-(--surface-dark) text-white border-t border-(--hairline) px-6 py-14">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-(--primary) to-(--primary-active) text-white rounded-xl flex items-center justify-center font-serif text-sm shadow-md">
                E
              </div>
              <span className="text-lg font-serif font-medium">Elevara</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              The professional AI Career Operating System. Built for serious job seekers across all global disciplines.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--primary) mb-4">AI Engines</p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/dashboard/analyze" className="hover:text-white transition-colors">ATS Resume Parser</Link></li>
              <li><Link href="/dashboard/studio" className="hover:text-white transition-colors">Resume Studio</Link></li>
              <li><Link href="/dashboard/tools/mock-interview" className="hover:text-white transition-colors">5-Stage Mock Interview</Link></li>
              <li><Link href="/dashboard/tools/tailor" className="hover:text-white transition-colors">Job Match Tailor</Link></li>
              <li><Link href="/dashboard/tools/roadmap" className="hover:text-white transition-colors">Career Roadmaps</Link></li>
              <li><Link href="/dashboard/tools/github" className="hover:text-white transition-colors">GitHub Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--primary) mb-4">Resources & Docs</p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Help & Documentation</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Mock Interview Voice Guide</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Model Selection Guide</Link></li>
              <li><Link href="/dashboard/tracker" className="hover:text-white transition-colors">Application Kanban</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-(--primary) mb-4">Security & Trust</p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-400" /> 256-Bit SSL Encryption</li>
              <li>Zero Data Selling / Scraping</li>
              <li>Isolated User Cloud Stores</li>
              <li>GDPR & CCPA Compliant</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Elevara Technologies Inc. All rights reserved.</p>
          <div className="flex gap-6 text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
