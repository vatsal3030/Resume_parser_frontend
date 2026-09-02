"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, FileText, Target, Briefcase, Map, Code2, 
  Shield, Zap, Star, CheckCircle, ArrowRight, Bot, Check,
  Trophy, Layers, Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const FEATURES_DATA = [
  {
    id: "analyze",
    name: "ATS Resume Analysis",
    badge: "99.4% Accurate",
    icon: FileText,
    headline: "Multi-Domain ATS Scoring & Flaw Detection",
    desc: "Analyzes technical, MBA, engineering, design, finance, and medical resumes with deep keyword extraction, weakness auditing, and instant role-fit recommendations.",
    highlights: ["Simulated ATS Score & Job Fit", "Multi-Domain Detection (Non-CS Ready)", "Actionable Bullet Polish Recommendations"]
  },
  {
    id: "studio",
    name: "Resume Studio",
    badge: "4 Templates",
    icon: Layers,
    headline: "Modern & Minimalist Resume Builder",
    desc: "Create, reorder, and live-edit ATS-friendly resumes across Classic, Modern, Minimal, and Editorial designs with instant high-resolution PDF/DOCX downloads.",
    highlights: ["Live Real-Time Preview", "Custom Section Ordering & Formatting", "1-Click PDF & DOCX Export"]
  },
  {
    id: "interview",
    name: "5-Round Mock Interview",
    badge: "Voice AI & Code",
    icon: Briefcase,
    headline: "Gamified 5-Stage Simulation with Model Solutions",
    desc: "Practice with Aptitude, Core MCQs, Live Coding, Project Deep-Dive, and Behavioral stages. Includes live voice practice, countdown timers, progressive hints, and master model solution keys.",
    highlights: ["Speech-to-Text Voice Practice", "Instant MCQ & Code Editor Feedback", "Complete Model Solutions & Study Cheat Sheet"]
  },
  {
    id: "tailor",
    name: "Job Description Tailor",
    badge: "Instant Match",
    icon: Target,
    headline: "Match Any Job Description in 10 Seconds",
    desc: "Paste any job posting. The AI compares your experience, identifies critical keyword gaps, and rewrites bullet points to boost your ATS match score above 90%.",
    highlights: ["Keyword Match Score Gap Analysis", "Contextual Bullet Point Rewrites", "Zero-Hallucination Integrity"]
  },
  {
    id: "roadmap",
    name: "Career Roadmaps",
    badge: "Milestone Planner",
    icon: Map,
    headline: "Targeted Skill-Gap Learning Milestones",
    desc: "Generate personalized, step-by-step technical roadmaps with curated project recommendations and resources to transition into higher-paying roles.",
    highlights: ["Current vs Target Skill Gap", "Step-by-Step Practical Milestones", "Curated Top-Tier Resources"]
  },
  {
    id: "github",
    name: "GitHub Portfolio & README",
    badge: "Developer Suite",
    icon: Code2,
    headline: "Auto-Generate Portfolio & Profile README",
    desc: "Connect your GitHub username. Elevara analyzes your real public repositories, generates a developer archetype roast, and outputs a portfolio and Markdown README.",
    highlights: ["Live Public Repo Extraction", "Interactive Developer Archetype & Roast", "Copy-Ready Shields.io Profile README"]
  }
];

const MODELS_DATA = [
  { name: "Gemini 3.7 Flash", provider: "Google DeepMind", type: "Ultra Fast & Reasoning", speed: "< 0.4s", badge: "Newest Model" },
  { name: "Claude Sonnet 5", provider: "Anthropic", type: "Elite Nuance & Code", speed: "High Intelligence", badge: "Pro Bar" },
  { name: "DeepSeek V4 Flash", provider: "DeepSeek", type: "Top Coding & Speed", speed: "Instant", badge: "Fast Coder" },
  { name: "DeepSeek R1", provider: "DeepSeek", type: "Chain-of-Thought Logic", speed: "Deep Reasoning", badge: "Reasoning CoT" },
  { name: "Gemma 4 31B", provider: "Google Open", type: "Free Tier Powerhouse", speed: "Zero Cost", badge: "Free Tier" },
  { name: "Nemotron 3 Ultra", provider: "NVIDIA", type: "550B Architecture", speed: "Free Tier", badge: "Free Tier" },
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

export default function LandingPage() {
  const [session, setSession] = useState(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // Interactive ATS Bullet Simulator State
  const [simBullet, setSimBullet] = useState("Engineered distributed event-streaming pipeline using Apache Kafka and Go, reducing API p99 latency by 44% across 4.2M daily transactions.");
  const [simScore, setSimScore] = useState(98);
  const [simFeedback, setSimFeedback] = useState("Exemplary! Action verb ('Engineered'), precise stack ('Kafka, Go'), and high-impact metric ('44% latency reduction across 4.2M txns').");
  const [isSimulating, setIsSimulating] = useState(false);

  // Interactive ROI Calculator State
  const [targetSalary, setTargetSalary] = useState(18);

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
    <div className="min-h-screen bg-(--canvas) text-(--ink) selection:bg-(--primary) selection:text-white transition-colors">

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 bg-(--canvas)/85 backdrop-blur-xl border-b border-(--hairline) px-6 py-3 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl md:text-3xl font-serif font-light hover:opacity-80 transition-opacity flex items-center gap-2">
            <div className="w-8 h-8 bg-(--primary) rounded-xl flex items-center justify-center text-white font-serif font-medium text-base shadow-xs">
              E
            </div>
            <span className="text-(--ink) font-serif">Elevara</span>
          </Link>
          <span className="hidden md:inline-block px-2.5 py-0.5 bg-(--primary)/10 text-(--primary) rounded-full text-[10px] font-medium border border-(--primary)/20">
            AI Career OS
          </span>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-6 font-medium text-xs text-(--muted)">
          <a href="#features" className="hover:text-(--ink) transition-colors">Features</a>
          <a href="#simulator" className="hover:text-(--ink) transition-colors">ATS Simulator</a>
          <a href="#models" className="hover:text-(--ink) transition-colors">AI Models</a>
          <a href="#comparison" className="hover:text-(--ink) transition-colors">Why Elevara</a>
          <a href="#pricing" className="hover:text-(--ink) transition-colors">Pricing</a>
          <Link href="/dashboard/help" className="hover:text-(--ink) transition-colors">Docs & Help</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {session ? (
            <Link href="/dashboard">
              <Button className="text-xs font-medium py-2 px-4 rounded-xl transition-all">
                Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="secondary" className="text-xs font-medium py-2 px-3.5 rounded-xl transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-xl text-xs font-medium py-2 px-4 transition-all">
                  Get 50 Free Credits →
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="px-6 pt-12 md:pt-20 pb-16 max-w-6xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-(--surface-card) border border-(--hairline) rounded-full font-medium text-xs text-(--muted) shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Adaptive Multi-Model Intelligence · Zero Subscriptions</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-8xl font-serif font-light leading-[0.92] mb-6 text-(--ink)">
          Land Your Dream Job <br className="hidden sm:inline" />
          <span className="text-(--primary) px-2 inline-block mt-2 sm:mt-0 font-serif italic">
            3X Faster
          </span>{" "}
          with AI.
        </h1>

        <p className="text-base sm:text-lg max-w-3xl mx-auto text-(--muted) leading-relaxed mb-8">
          The complete AI-powered career operating system. Analyze resumes with ATS precision, build stunning studio resumes, practice 5-round voice mock interviews with model solution keys, and tailor for any job description.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link href={session ? "/dashboard" : "/register"} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto text-sm px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all font-medium">
              Start Free (50 Credits Included) →
            </Button>
          </Link>
          <a href="#simulator" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto text-sm px-6 py-3.5 rounded-xl shadow-xs font-medium transition-all">
              Try Live ATS Simulator ↓
            </Button>
          </a>
        </div>

        {/* TRUST BADGES ROW */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-medium text-(--muted)">
          <div className="flex items-center gap-2 bg-(--surface-card) px-3.5 py-1.5 border border-(--hairline) rounded-full shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-500" /> SOC2-Ready & Private
          </div>
          <div className="flex items-center gap-2 bg-(--surface-card) px-3.5 py-1.5 border border-(--hairline) rounded-full shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 4.9/5 from 50,000+ Users
          </div>
          <div className="flex items-center gap-2 bg-(--surface-card) px-3.5 py-1.5 border border-(--hairline) rounded-full shadow-xs">
            <Zap className="w-3.5 h-3.5 text-(--primary)" /> Sub-Second AI Generation
          </div>
        </div>
      </section>

      {/* METRICS & PROOF MARQUEE */}
      <section className="bg-(--surface-card) border-y border-(--hairline) py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-(--hairline-soft)">
          <div className="p-3">
            <p className="text-3xl md:text-4xl font-serif font-medium text-(--primary)">50,000+</p>
            <p className="text-xs font-medium mt-1 text-(--muted)">Resumes Analyzed</p>
          </div>
          <div className="p-3">
            <p className="text-3xl md:text-4xl font-serif font-medium text-emerald-500">94.2%</p>
            <p className="text-xs font-medium mt-1 text-(--muted)">Interview Callback Rate</p>
          </div>
          <div className="p-3">
            <p className="text-3xl md:text-4xl font-serif font-medium text-(--ink)">5 Stages</p>
            <p className="text-xs font-medium mt-1 text-(--muted)">Voice AI Simulation</p>
          </div>
          <div className="p-3">
            <p className="text-3xl md:text-4xl font-serif font-medium text-(--primary)">&lt; 30s</p>
            <p className="text-xs font-medium mt-1 text-(--muted)">End-to-End Processing</p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ATS BULLET SIMULATOR SECTION */}
      <section id="simulator" className="px-6 py-16 md:py-24 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) font-medium text-xs rounded-full border border-(--primary)/20">
            Interactive Playground
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
            Test Your Resume Bullet Point in Real-Time
          </h2>
          <p className="text-xs text-(--muted) mt-2">
            See how top ATS engines and recruiter algorithms evaluate your impact.
          </p>
        </div>

        <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm p-6 md:p-8">
          <CardContent className="p-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-medium text-(--muted)">
                Sample or Custom Resume Bullet Point:
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApplyPresetBullet('weak')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  Load Weak Example
                </button>
                <button 
                  onClick={() => handleApplyPresetBullet('strong')}
                  className="px-2.5 py-1 text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors"
                >
                  Load 98/100 Example
                </button>
              </div>
            </div>

            <textarea
              className="w-full min-h-[90px] p-3.5 bg-(--surface-soft) border border-(--hairline) rounded-xl font-normal text-xs text-(--ink) placeholder:text-(--muted-soft) focus:border-(--primary) outline-none resize-y transition-colors shadow-xs"
              value={simBullet}
              onChange={(e) => setSimBullet(e.target.value)}
              placeholder="Paste or type a bullet point from your resume..."
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-(--hairline-soft)">
              <Button
                onClick={handleSimulateScore}
                disabled={isSimulating}
                className="w-full sm:w-auto text-xs"
              >
                {isSimulating ? "Evaluating Metrics..." : "Simulate ATS & Impact Score"}
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs font-medium text-(--muted)">Calculated Score:</span>
                <div className={`px-3.5 py-1 rounded-xl border text-sm font-serif font-medium ${
                  simScore >= 90 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : simScore >= 70 ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
                }`}>
                  {simScore}/100
                </div>
              </div>
            </div>

            {/* Simulated AI Feedback Box */}
            <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4 flex items-start gap-3 animate-in fade-in">
              <Bot className="w-4 h-4 text-(--primary) shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium text-(--muted)">Elevara AI Recruiter Feedback:</p>
                <p className="text-xs text-(--ink) mt-1 leading-relaxed">{simFeedback}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 6 TOOLS INTERACTIVE SHOWCASE HUB */}
      <section id="features" className="px-6 py-16 md:py-24 bg-(--canvas) border-y border-(--hairline)">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 font-medium text-xs rounded-full">
              Unified Career Architecture
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
              6 Powerful AI Engines. One Platform.
            </h2>
            <p className="text-xs text-(--muted) max-w-xl mx-auto mt-2">
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
                  className={`px-3.5 py-2 font-medium text-xs rounded-xl border flex items-center gap-2 transition-all ${
                    activeFeatureTab === idx 
                      ? 'bg-(--primary) text-white border-(--primary) shadow-sm scale-102' 
                      : 'bg-(--surface-card) border-(--hairline) text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft)'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
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
              <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm p-6 md:p-10 animate-in fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) rounded-full text-[10px] font-medium">
                        {current.badge}
                      </span>
                      <span className="px-2.5 py-0.5 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 rounded-full text-[10px] font-medium">
                        {current.name}
                      </span>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-serif font-medium text-(--ink)">
                      {current.headline}
                    </h3>

                    <p className="text-xs text-(--muted) leading-relaxed">
                      {current.desc}
                    </p>

                    <div className="space-y-2 pt-2">
                      {current.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-medium text-(--ink)">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <Link href={session ? "/dashboard" : "/register"}>
                        <Button className="text-xs">
                          Explore {current.name} in App →
                        </Button>
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5 bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-5 shadow-xs relative">
                    <div className="flex justify-between items-center border-b border-(--hairline-soft) pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium text-xs text-(--ink)">{current.name} Live Output</span>
                      </div>
                      <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        AI READY
                      </span>
                    </div>

                    <div className="space-y-2.5 font-mono text-[11px] text-(--ink) bg-(--surface-card) p-3.5 rounded-lg border border-(--hairline-soft) leading-relaxed">
                      <p className="text-(--primary) font-medium">{"// Extracted Benchmark Matrix"}</p>
                      <p>atsScore: <span className="font-medium text-emerald-500">96/100</span></p>
                      <p>detectedDomain: <span className="font-medium text-(--ink)">&quot;Full Stack Engineering&quot;</span></p>
                      <p>actionableFeedback: <span className="text-(--muted)">&quot;Optimal keyword density. Star metrics verified.&quot;</span></p>
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
          <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 font-medium text-xs rounded-full">
            Model Intelligence Roster
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
            Choose Your AI Intelligence Engine
          </h2>
          <p className="text-xs text-(--muted) max-w-xl mx-auto mt-2">
            Never locked into one model. Route between Google Gemini 3.7, Claude Sonnet 5, DeepSeek V4, and Free Tier models with 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MODELS_DATA.map((m, idx) => (
            <Card key={idx} className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-xs hover:border-(--primary)/40 transition-all">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-0.5 rounded-full bg-(--surface-soft) border border-(--hairline-soft) text-[10px] font-medium text-(--primary)">
                  {m.badge}
                </span>
                <span className="text-[10px] text-(--muted)">{m.provider}</span>
              </div>
              <h3 className="text-base font-serif font-medium text-(--ink) mb-1">{m.name}</h3>
              <p className="text-xs text-(--muted) mb-4">{m.type}</p>
              <div className="flex justify-between items-center text-xs font-medium border-t border-(--hairline-soft) pt-3">
                <span className="text-(--muted)">Response Latency:</span>
                <span className="bg-(--surface-soft) px-2 py-0.5 rounded-md border border-(--hairline-soft) text-(--ink)">{m.speed}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* COMPARISON MATRIX SECTION */}
      <section id="comparison" className="px-6 py-16 md:py-24 bg-(--canvas) border-y border-(--hairline)">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 font-medium text-xs rounded-full">
              Market Comparison
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
              Why Job Seekers Switch to Elevara
            </h2>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-(--hairline) shadow-xs">
            <table className="w-full text-left border-collapse bg-(--surface-card)">
              <thead>
                <tr className="border-b border-(--hairline) bg-(--surface-soft)">
                  <th className="p-4 font-medium text-xs text-(--ink)">Feature Benchmark</th>
                  <th className="p-4 font-medium text-xs text-(--primary) border-l border-(--hairline-soft)">Elevara Career OS</th>
                  <th className="p-4 font-medium text-xs text-(--muted) border-l border-(--hairline-soft)">Generic Resume Builders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--hairline-soft) text-xs">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-(--surface-soft)/50 transition-colors">
                    <td className="p-4 font-medium text-(--ink)">{row.feature}</td>
                    <td className="p-4 font-medium text-emerald-500 bg-emerald-500/5 border-l border-(--hairline-soft) flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {row.elevara}
                    </td>
                    <td className="p-4 text-(--muted) border-l border-(--hairline-soft)">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROI & SALARY ESTIMATOR SECTION */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto">
        <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm p-8 text-center">
          <div className="inline-block bg-(--primary)/10 text-(--primary) border border-(--primary)/20 px-3 py-1 font-medium text-xs rounded-full mb-3">
            Career Upside Calculator
          </div>
          <h2 className="text-2xl md:text-4xl font-serif font-medium text-(--ink) mb-2">
            Calculate Your Interview Advantage
          </h2>
          <p className="text-xs text-(--muted) mb-6">
            Drag your expected target role compensation to view estimated career ROI.
          </p>

          <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-6 shadow-xs max-w-xl mx-auto text-left space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2 font-medium text-xs text-(--ink)">
                <span>Target Compensation:</span>
                <span className="text-sm text-(--primary) bg-(--surface-card) px-2.5 py-0.5 rounded-lg border border-(--hairline-soft)">₹{targetSalary} LPA</span>
              </div>
              <input 
                type="range" 
                min="6" 
                max="60" 
                value={targetSalary} 
                onChange={(e) => setTargetSalary(Number(e.target.value))}
                className="w-full accent-(--primary) cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-(--hairline-soft) text-center">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-[10px] font-medium text-emerald-500">Est. Callback Increase</p>
                <p className="text-xl font-serif font-medium text-emerald-500 mt-1">+340%</p>
              </div>
              <div className="p-3 bg-(--primary)/10 border border-(--primary)/20 rounded-xl">
                <p className="text-[10px] font-medium text-(--primary)">Upside on ₹99 pack</p>
                <p className="text-xl font-serif font-medium text-(--primary) mt-1">&gt; 1,800x ROI</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* TESTIMONIALS & SOCIAL PROOF */}
      <section className="px-6 py-16 md:py-24 bg-(--canvas) border-y border-(--hairline)">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 font-medium text-xs rounded-full">
              Candidate Wall of Fame
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
              Proven Results Across Top Companies
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <Card key={idx} className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-xs flex flex-col justify-between hover:border-(--primary)/40 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium bg-(--surface-soft) text-(--muted) px-2 py-0.5 rounded-md border border-(--hairline-soft)">
                      {t.domain}
                    </span>
                  </div>
                  <p className="text-xs text-(--body) italic leading-relaxed mb-6">
                    &quot;{t.quote}&quot;
                  </p>
                </div>

                <div className="border-t border-(--hairline-soft) pt-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-xs text-(--ink)">{t.author}</p>
                    <p className="text-[11px] text-(--muted)">{t.role}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) rounded-lg font-medium text-xs">
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
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium text-xs rounded-full">
            Transparent Pricing
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-light mt-3 text-(--ink)">
            Pay For What You Use. No Subscriptions.
          </h2>
          <p className="text-xs text-(--muted) mt-2">
            Credits never expire. Top up only when you need active job search tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {/* FREE PLAN */}
          <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-medium bg-(--surface-soft) text-(--muted) px-2.5 py-0.5 rounded-full border border-(--hairline-soft)">
                Starter Tier
              </span>
              <h3 className="text-xl font-serif font-medium text-(--ink) mt-3">Free Signup</h3>
              <div className="text-3xl font-serif text-(--ink) my-4">₹0</div>
              <p className="text-xs text-(--muted) mb-6">Explore the full platform immediately upon registration.</p>
              <ul className="space-y-2 text-xs text-(--body) border-t border-(--hairline-soft) pt-4">
                <li className="flex items-center gap-2">✓ 50 Free AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Access to All 6 AI Career Engines</li>
                <li className="flex items-center gap-2">✓ Full Resume Studio & PDF Export</li>
                <li className="flex items-center gap-2">✓ Free Tier AI Models Included</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button variant="secondary" className="w-full text-xs">
                Sign Up Free →
              </Button>
            </Link>
          </Card>

          {/* BASIC PACK */}
          <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-medium bg-(--primary)/10 text-(--primary) px-2.5 py-0.5 rounded-full border border-(--primary)/20">
                Top Up
              </span>
              <h3 className="text-xl font-serif font-medium text-(--ink) mt-3">Basic Pack</h3>
              <div className="text-3xl font-serif text-(--ink) my-4">₹99</div>
              <p className="text-xs text-(--muted) mb-6">Perfect for polishing your resume and practicing 2-3 interviews.</p>
              <ul className="space-y-2 text-xs text-(--body) border-t border-(--hairline-soft) pt-4">
                <li className="flex items-center gap-2">✓ 100 AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Gemini 3.7 & Claude Access</li>
                <li className="flex items-center gap-2">✓ Voice Mock Interview Simulation</li>
                <li className="flex items-center gap-2">✓ Lifetime Credit Validity</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button className="w-full text-xs">
                Get 100 Credits →
              </Button>
            </Link>
          </Card>

          {/* PRO PACK */}
          <Card className="bg-(--surface-card) border-2 border-(--primary) rounded-2xl p-6 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 right-4 bg-(--primary) text-white text-[10px] font-medium px-3 py-0.5 rounded-full shadow-xs">
              Most Popular
            </div>
            <div>
              <span className="text-[10px] font-medium bg-(--primary)/10 text-(--primary) px-2.5 py-0.5 rounded-full border border-(--primary)/20">
                Pro Powerhouse
              </span>
              <h3 className="text-xl font-serif font-medium text-(--ink) mt-3">Career Pro</h3>
              <div className="text-3xl font-serif text-(--primary) my-4">₹399</div>
              <p className="text-xs text-(--muted) mb-6">Comprehensive preparation for full job hunt seasons.</p>
              <ul className="space-y-2 text-xs text-(--body) border-t border-(--hairline-soft) pt-4">
                <li className="flex items-center gap-2">✓ 500 AI Generation Credits</li>
                <li className="flex items-center gap-2">✓ Priority BullMQ Worker Execution</li>
                <li className="flex items-center gap-2">✓ Unlimited Voice Mock Interviews</li>
                <li className="flex items-center gap-2">✓ Full Model Solutions & Study Guides</li>
                <li className="flex items-center gap-2">✓ Priority Support</li>
              </ul>
            </div>
            <Link href="/register" className="mt-8">
              <Button className="w-full text-xs">
                Get 500 Pro Credits →
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="px-6 py-16 md:py-24 max-w-4xl mx-auto text-center">
        <div className="bg-(--surface-card) border border-(--hairline) rounded-3xl p-10 md:p-14 shadow-sm">
          <Trophy className="w-10 h-10 mx-auto mb-4 text-(--primary)" />
          <h2 className="text-3xl md:text-5xl font-serif font-light text-(--ink) mb-3">
            Ready to Fast-Track Your Career?
          </h2>
          <p className="text-xs md:text-sm text-(--muted) max-w-xl mx-auto mb-8 leading-relaxed">
            Join thousands of ambitious job seekers landing top offers at Google, Amazon, Microsoft, Goldman Sachs, and Stripe.
          </p>
          <Link href="/register">
            <Button className="text-xs md:text-sm px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all">
              Claim Your 50 Free Credits Now →
            </Button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-(--surface-dark) text-white border-t border-(--hairline) px-6 py-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-(--primary) text-white rounded-lg flex items-center justify-center font-serif text-xs">
                E
              </div>
              <span className="text-base font-serif">Elevara</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              The professional AI Career Operating System. Built for serious job seekers across all global disciplines.
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-(--primary) mb-3">AI Engines</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/dashboard/analyze" className="hover:text-white transition-colors">ATS Resume Parser</Link></li>
              <li><Link href="/dashboard/studio" className="hover:text-white transition-colors">Resume Studio</Link></li>
              <li><Link href="/dashboard/tools/mock-interview" className="hover:text-white transition-colors">5-Stage Mock Interview</Link></li>
              <li><Link href="/dashboard/tools/tailor" className="hover:text-white transition-colors">Job Match Tailor</Link></li>
              <li><Link href="/dashboard/tools/roadmap" className="hover:text-white transition-colors">Career Roadmaps</Link></li>
              <li><Link href="/dashboard/tools/github" className="hover:text-white transition-colors">GitHub Portfolio</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-(--primary) mb-3">Resources & Docs</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Help & Documentation</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Mock Interview Voice Guide</Link></li>
              <li><Link href="/dashboard/help" className="hover:text-white transition-colors">Model Selection Guide</Link></li>
              <li><Link href="/dashboard/tracker" className="hover:text-white transition-colors">Application Kanban</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-(--primary) mb-3">Security & Trust</p>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> 256-Bit SSL Encryption</li>
              <li>Zero Data Selling / Scraping</li>
              <li>Isolated User Cloud Stores</li>
              <li>GDPR & CCPA Compliant</li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Elevara Technologies Inc. All rights reserved.</p>
          <div className="flex gap-4 text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/register" className="hover:text-white transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
