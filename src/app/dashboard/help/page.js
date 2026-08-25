"use client";
import { useState, useMemo } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  HelpCircle, FileEdit, Zap, Mail, MessageSquare, Code, LayoutTemplate, Map,
  Briefcase, CreditCard, Bot, Keyboard, AlertTriangle, LifeBuoy, BookOpen,
  LayoutDashboard, ChevronRight, Search, Shield, Users, Mic, Trophy, Cpu,
  Flame, Award, Layers, Target, CheckCircle, Sparkles, Sliders, Brain, X
} from "lucide-react";

const SECTIONS = [
  { id: "start", label: "Getting Started", icon: BookOpen, color: "bg-brutal-yellow" },
  { id: "interview", label: "Mock Interview Guide", icon: MessageSquare, color: "bg-brutal-mint" },
  { id: "models", label: "AI Models & Routing", icon: Cpu, color: "bg-purple-300" },
  { id: "studio", label: "Resume Studio", icon: Layers, color: "bg-brutal-pink" },
  { id: "tools", label: "All Career Engines", icon: Zap, color: "bg-brutal-blue text-white" },
  { id: "tracker", label: "Application Tracker", icon: Briefcase, color: "bg-orange-300" },
  { id: "billing", label: "Account & Credits", icon: CreditCard, color: "bg-yellow-200" },
  { id: "copilot", label: "AI Copilot", icon: Bot, color: "bg-emerald-200" },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard, color: "bg-cyan-200" },
  { id: "troubleshoot", label: "Troubleshooting", icon: AlertTriangle, color: "bg-red-300" },
  { id: "support", label: "Support & Contact", icon: LifeBuoy, color: "bg-gray-200" },
];

const SEARCH_DATABASE = [
  { sectionId: "interview", title: "5-Round Mock Interview Stages", keywords: "mock interview aptitude mcq coding project behavioral questions voice practice rounds stages", content: "Comprehensive 5-stage simulation with Aptitude, Core MCQs, Live Coding, Project Deep-Dive, and Behavioral stages." },
  { sectionId: "interview", title: "Speech-to-Text Voice Dictation", keywords: "voice speech microphone speak dictate audio stt tts listen web speech api", content: "Practice speaking your answers aloud with browser Web Speech API speech-to-text dictation and text-to-speech question reading." },
  { sectionId: "interview", title: "Master Model Solutions & Cheat Sheet", keywords: "model solutions cheat sheet answer key derivations correct answer code solution", content: "Post-interview master solution key with step-by-step logic, Big-O targets, and printable cheat sheet." },
  { sectionId: "models", title: "AI Model Selection Matrix", keywords: "models gemini claude deepseek gemma nemotron openrouter smart router api", content: "Choose between Google Gemini 3.7 Flash, Claude Sonnet 5, DeepSeek V4, DeepSeek R1, or Free Tier models." },
  { sectionId: "studio", title: "Resume Studio Templates", keywords: "resume studio template classic modern minimal brutalist pdf docx export download", content: "Build and export resumes in Classic, Modern, Minimal, or Brutalist templates with real-time vector PDF and DOCX exports." },
  { sectionId: "start", title: "ATS Score & Multi-Domain Parsing", keywords: "ats resume score upload parse pdf docx domain engineering mba finance law medical", content: "Automatic extraction of candidate profile, portfolio links, and multi-domain tailored ATS scoring." },
  { sectionId: "tools", title: "Job Description AI Tailor", keywords: "tailor job description keyword match gap analysis bullet rewrite", content: "Paste any job posting to analyze keyword gaps and rewrite bullet points to exceed 90% ATS match." },
  { sectionId: "tracker", title: "Application Kanban Board", keywords: "tracker kanban applications jobs applied bookmark interview offer rejected", content: "Drag-and-drop job application tracking with deep-link URL sharing, linked tailored resumes, and salary tracking." },
  { sectionId: "billing", title: "Credits & Pay-As-You-Go Billing", keywords: "credits plans pricing razorpay upi basic pro refund validity", content: "50 free signup credits, lifetime validity, ₹99 Basic Pack (100 credits), ₹399 Pro Pack (500 credits)." },
  { sectionId: "shortcuts", title: "Global Keyboard Shortcuts", keywords: "keyboard shortcuts ctrl k command palette ctrl b sidebar ctrl s save", content: "Quick keyboard shortcuts including Ctrl+K Command Palette, Ctrl+B Sidebar Toggle, and Ctrl+S Save." },
  { sectionId: "troubleshoot", title: "Upload & Microphone Troubleshooting", keywords: "troubleshoot error failed mic microphone permissions pdf upload", content: "Fix common upload, PDF parsing, microphone permission, and credit balance issues." },
];

const Kbd = ({ children }) => (
  <kbd className="bg-gray-200 border border-brutal-black px-2 py-0.5 mx-0.5 text-xs font-mono font-black shadow-[1px_1px_0_#000]">{children}</kbd>
);

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState("start");
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return SEARCH_DATABASE.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.keywords.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectSearchResult = (sectionId) => {
    setActiveSection(sectionId);
    setSearchQuery("");
  };

  return (
    <PageShell title="Documentation & Knowledge Base" subtitle="Comprehensive guides, model reference, voice mock interview tutorials, and FAQs.">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HERO BANNER & INSTANT SEARCH */}
        <div className="bg-brutal-yellow border-4 border-brutal-black p-6 md:p-8 shadow-[8px_8px_0_rgba(0,0,0,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight flex items-center gap-3">
                <HelpCircle className="w-8 h-8" /> Elevara Knowledge Base
              </h2>
              <p className="font-bold text-sm md:text-base text-gray-900 mt-1">
                Everything you need to master ATS resume parsing, 5-round voice simulations, multi-model AI routing, and job applications.
              </p>
            </div>
            <span className="px-3 py-1 bg-black text-white text-xs font-black uppercase shadow-[2px_2px_0_#fff] flex-shrink-0">
              v2.5 Documentation
            </span>
          </div>

          {/* SEARCH BOX */}
          <div className="relative mt-4">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-700" />
            <input 
              type="text"
              className="w-full bg-white border-3 border-black pl-11 pr-10 py-3 font-bold text-sm placeholder:text-gray-500 shadow-[3px_3px_0_#000] outline-none focus:bg-yellow-50"
              placeholder="Search documentation (e.g. 'voice interview', 'model selection', 'export pdf', 'credits', 'STAR method')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black font-black"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH RESULTS DROPDOWN / LIST */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-white border-4 border-brutal-black p-6 shadow-[6px_6px_0_#000] animate-in fade-in space-y-3">
            <div className="flex justify-between items-center border-b-2 border-gray-200 pb-2">
              <span className="font-black text-xs uppercase text-gray-600">
                Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
              </span>
              <button onClick={() => setSearchQuery("")} className="text-xs font-black text-red-600 hover:underline">
                Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-3 pt-1">
                {searchResults.map((res, i) => (
                  <div 
                    key={i}
                    onClick={() => handleSelectSearchResult(res.sectionId)}
                    className="p-3.5 border-2 border-black hover:bg-yellow-50 cursor-pointer transition-colors flex justify-between items-center group shadow-[2px_2px_0_#000]"
                  >
                    <div>
                      <p className="font-black text-sm text-black group-hover:text-brutal-blue">{res.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{res.content}</p>
                    </div>
                    <span className="text-xs font-black text-black group-hover:translate-x-1 transition-transform ml-4">
                      View Section →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm font-bold text-gray-500 py-2">
                No matching topics found. Try searching for &quot;interview&quot;, &quot;models&quot;, &quot;studio&quot;, or &quot;credits&quot;.
              </p>
            )}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-2 p-3 bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            return (
              <button 
                key={s.id} 
                onClick={() => { setActiveSection(s.id); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                  activeSection === s.id && !searchQuery
                    ? `${s.color} border-brutal-black shadow-[3px_3px_0_#000] scale-[1.02]` 
                    : 'border-transparent hover:border-brutal-black hover:bg-gray-100 text-gray-700 hover:text-black'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* MAIN DOCUMENTATION CONTENT */}
        <div className="bg-white border-4 border-brutal-black p-6 md:p-8 shadow-[6px_6px_0_rgba(0,0,0,1)]">

          {/* 1. GETTING STARTED */}
          {activeSection === "start" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b-4 border-brutal-black pb-3">
                <h3 className="text-2xl font-black uppercase">Getting Started with Elevara</h3>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 border border-black uppercase">Core Onboarding</span>
              </div>

              <Accordion type="single" collapsible className="w-full" defaultValue="s1">
                <AccordionItem value="s1">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    1. Account Creation & 50 Free Signup Credits
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <p>When you register with your email or Google OAuth, your account is immediately credited with <strong>50 free AI generation credits</strong>.</p>
                    <p>There are no recurring subscription locks or credit card requirements. Credits never expire and give you full access to all 6 career engines and the Resume Studio.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="s2">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    2. Multi-Domain ATS Resume Upload & Parsing
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <p>Upload your existing resume in <strong>PDF or DOCX</strong> format from the Dashboard. The backend worker automatically extracts:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Candidate Profile</strong>: Full Name, Email, Phone, LinkedIn, GitHub, and Portfolio / Personal website URL.</li>
                      <li><strong>ATS Compatibility Score</strong>: Real-world keyword score out of 100.</li>
                      <li><strong>Domain Detection</strong>: Automatically detects whether your background is Computer Science, Mechanical Engineering, Civil Engineering, MBA / Finance, Marketing, Medical, Law, or Design.</li>
                      <li><strong>Actionable Strengths & Weaknesses</strong>: Bullet-by-bullet improvement tips.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="s3">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    3. Recommended Workflow for Job Applications
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <ol className="list-decimal pl-5 space-y-1.5 font-bold text-gray-900">
                      <li><strong>Analyze Resume</strong> → Benchmark your starting ATS baseline.</li>
                      <li><strong>Tailor to Job Description</strong> → Paste JD keywords and auto-rewrite weak bullets.</li>
                      <li><strong>Practice 5-Round Mock Interview</strong> → Simulate technical, coding, and behavioral stages with live voice practice.</li>
                      <li><strong>Track Application in Kanban</strong> → Bookmark the role, add notes, and log interview progress.</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 2. MOCK INTERVIEW GUIDE */}
          {activeSection === "interview" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b-4 border-brutal-black pb-3">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-brutal-mint" /> 5-Round Gamified Mock Interview Simulator
                </h3>
                <span className="text-xs font-black bg-brutal-mint px-2 py-1 border border-black uppercase">Voice AI Active</span>
              </div>

              <p className="font-bold text-sm text-gray-700">
                Elevara features a complete 5-stage simulation designed to mirror real technical screenings, coding rounds, and hiring manager loops.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-yellow-50 border-3 border-black p-4">
                  <p className="font-black text-xs uppercase text-amber-900 mb-1 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" /> Round 1: Aptitude & Quantitative Logic
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    Tests logical reasoning, probability, pattern recognition, and quantitative problem-solving universal across all industries.
                  </p>
                </div>

                <div className="bg-blue-50 border-3 border-black p-4">
                  <p className="font-black text-xs uppercase text-blue-900 mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4" /> Round 2: Core Domain MCQs
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    Domain-specific multiple-choice questions with 4 options. Includes instant &quot;Check Answer&quot; feedback and distractor explanations.
                  </p>
                </div>

                <div className="bg-emerald-50 border-3 border-black p-4">
                  <p className="font-black text-xs uppercase text-emerald-900 mb-1 flex items-center gap-1.5">
                    <Code className="w-4 h-4" /> Round 3: Coding & Technical Problem Solving
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    For CS/IT: Real coding problems with starter code, monospace editor, and Big-O targets. For Non-CS: Structured engineering/case analysis.
                  </p>
                </div>

                <div className="bg-orange-50 border-3 border-black p-4">
                  <p className="font-black text-xs uppercase text-orange-900 mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> Round 4: Project Deep-Dive & Architecture
                  </p>
                  <p className="text-xs text-gray-700 font-medium">
                    Probes specific projects extracted from your resume — architecture choices, scalability, trade-offs, and handling interviewer pushbacks.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full" defaultValue="mi1">
                <AccordionItem value="mi1">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    🎙️ Voice Practice (Speech-to-Text Dictation & Audio Narration)
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <p><strong>Speech-to-Text (STT):</strong> Click <em>&quot;Dictate by Voice&quot;</em> to speak your answers aloud. The browser Web Speech API transcribes your speech in real time with animated waveform visualizers.</p>
                    <p><strong>Text-to-Speech (TTS):</strong> Click <em>&quot;Read Question&quot;</em> to have the AI interviewer read the question and context aloud, simulating a live audio interview.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mi2">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    🏆 Gamification, XP, Streaks & Achievement Badges
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <p>Earn <strong>+50 XP</strong> per answered question, <strong>+20 XP Speed Demon</strong> bonus for finishing before 50% time elapsed, and <strong>Streak Multipliers</strong> for consecutive correct answers.</p>
                    <p>Unlockable Badges: ⚡ <em>Speed Demon</em>, 🎯 <em>Sharpshooter</em>, 💻 <em>Code Warrior</em>, 🎙️ <em>Voice Pioneer</em>, 🏆 <em>Interview Finisher</em>.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mi3">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    📚 Master Solutions Key & Printable Study Cheat Sheet
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2 leading-relaxed">
                    <p>After completing the interview, toggle to the <strong>&quot;Model Solutions&quot;</strong> tab to view textbook ideal answers, step-by-step logic derivations, and Big-O targets with 1-click &quot;Copy Solution&quot;.</p>
                    <p>Toggle to the <strong>&quot;Interview Cheat Sheet&quot;</strong> tab to view a consolidated summary of key takeaways and evaluation benchmarks from all 5 rounds with a 1-click <strong>&quot;Print / Save PDF&quot;</strong> layout.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 3. AI MODELS & ROUTING */}
          {activeSection === "models" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b-4 border-brutal-black pb-3">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                  <Cpu className="w-6 h-6 text-purple-600" /> Multi-Model AI Engine (2026 Roster)
                </h3>
                <span className="text-xs font-bold bg-purple-100 px-2 py-1 border border-black uppercase">Model Matrix</span>
              </div>

              <p className="font-bold text-sm text-gray-700">
                Elevara allows you to select specific cutting-edge models for each tool or use the Smart Router to automatically pick the fastest, most capable engine.
              </p>

              <div className="border-3 border-brutal-black overflow-x-auto shadow-[4px_4px_0_#000]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-black text-white border-b-2 border-black font-black uppercase">
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Best Used For</th>
                      <th className="p-3">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 font-medium">
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">Smart Router (Auto)</td>
                      <td className="p-3 text-gray-600">Adaptive</td>
                      <td className="p-3 font-bold">Fastest routing with automatic zero-downtime failover</td>
                      <td className="p-3"><span className="bg-emerald-200 px-1.5 py-0.5 border border-black font-bold">Recommended</span></td>
                    </tr>
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">Gemini 3.7 Flash</td>
                      <td className="p-3 text-gray-600">Google Direct</td>
                      <td className="p-3">Ultra-fast sub-second generation &amp; deep reasoning</td>
                      <td className="p-3"><span className="bg-purple-200 px-1.5 py-0.5 border border-black font-bold">Latest</span></td>
                    </tr>
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">Claude Sonnet 5</td>
                      <td className="p-3 text-gray-600">Anthropic</td>
                      <td className="p-3">Highest quality prose, nuanced cover letters &amp; complex code</td>
                      <td className="p-3"><span className="bg-red-200 px-1.5 py-0.5 border border-black font-bold">Pro Quality</span></td>
                    </tr>
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">DeepSeek V4 Flash</td>
                      <td className="p-3 text-gray-600">DeepSeek</td>
                      <td className="p-3">High-speed algorithmic problem solving &amp; code analysis</td>
                      <td className="p-3"><span className="bg-cyan-200 px-1.5 py-0.5 border border-black font-bold">Top Coder</span></td>
                    </tr>
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">DeepSeek R1</td>
                      <td className="p-3 text-gray-600">DeepSeek</td>
                      <td className="p-3">Chain-of-Thought step-by-step logic derivation</td>
                      <td className="p-3"><span className="bg-amber-200 px-1.5 py-0.5 border border-black font-bold">Reasoning</span></td>
                    </tr>
                    <tr className="hover:bg-yellow-50">
                      <td className="p-3 font-black">Gemma 4 31B (Free)</td>
                      <td className="p-3 text-gray-600">Google Open</td>
                      <td className="p-3">High parameter density open model for daily tasks</td>
                      <td className="p-3"><span className="bg-emerald-100 px-1.5 py-0.5 border border-black font-bold">Free Tier</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. RESUME STUDIO */}
          {activeSection === "studio" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b-4 border-brutal-black pb-3">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                  <Layers className="w-6 h-6 text-brutal-pink" /> Resume Studio &amp; Template Guide
                </h3>
                <span className="text-xs font-bold bg-pink-100 px-2 py-1 border border-black uppercase">Builder Guide</span>
              </div>

              <p className="font-bold text-sm text-gray-700">
                Resume Studio offers 4 distinctive templates built to pass ATS parsing filters while looking visually stunning to human recruiters.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0_#000]">
                  <p className="font-black text-sm uppercase">1. Classic Template</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Traditional serif headers, clean horizontal dividing lines. Best for Investment Banking, Law, and Consulting.</p>
                </div>
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0_#000]">
                  <p className="font-black text-sm uppercase">2. Modern Template</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Sleek sans-serif typography, compact pill badges for skills. Best for Tech, Startups, and Product Management.</p>
                </div>
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0_#000]">
                  <p className="font-black text-sm uppercase">3. Minimal Template</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Whitespace-rich, single-column design with maximum readability. Preferred by top Silicon Valley recruiters.</p>
                </div>
                <div className="bg-white border-3 border-black p-4 shadow-[3px_3px_0_#000]">
                  <p className="font-black text-sm uppercase">4. Brutalist Template</p>
                  <p className="text-xs text-gray-600 font-medium mt-1">Bold high-contrast borders, solid shadow blocks, and monospaced badges. Stand out for Creative, Design, and Web3 roles.</p>
                </div>
              </div>

              <div className="bg-yellow-50 border-3 border-black p-4">
                <p className="font-black text-xs uppercase text-amber-900 mb-1">💡 Export Tips:</p>
                <p className="text-xs font-medium text-gray-800">
                  You can download high-resolution vector PDF exports for online job applications or raw DOCX files for editable recruiter submissions.
                </p>
              </div>
            </div>
          )}

          {/* 5. ALL CAREER ENGINES */}
          {activeSection === "tools" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">All Career AI Engines</h3>
              <Accordion type="multiple" className="w-full" defaultValue={["t1", "t2"]}>
                <AccordionItem value="t1">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    <span className="flex items-center gap-2"><Target className="w-4 h-4 text-brutal-blue" /> Job Match AI Tailor</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Compares your resume text against any raw job description. Identifies missing high-yield keywords, calculates an ATS match percentage, and provides revised bullet points that incorporate job requirements without hallucination.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t2">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-brutal-pink" /> Cover Letter Generator</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Creates tailored, modern cover letters matching the candidate&apos;s real background to the target company. Outputs clean, ready-to-copy Markdown.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t3">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-purple-600" /> Career Roadmaps</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Identifies exact skill gaps between your current resume and an aspirational role. Generates step-by-step learning milestones with practical project assignments and curated resources.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t4">
                  <AccordionTrigger className="text-base font-black hover:no-underline">
                    <span className="flex items-center gap-2"><Code className="w-4 h-4 text-orange-600" /> GitHub Portfolio &amp; Profile README</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Fetches real public repositories from any GitHub username, analyzes coding patterns and top languages, provides a witty developer archetype roast, and outputs a deployable portfolio structure and Markdown README with shields.io badges.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 6. APPLICATION TRACKER */}
          {activeSection === "tracker" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">Application Kanban Board</h3>
              <p className="font-bold text-sm text-gray-700">
                Track every job application through 5 pipeline stages: <strong>Bookmarked</strong>, <strong>Applied</strong>, <strong>Interview</strong>, <strong>Offer</strong>, and <strong>Rejected</strong>.
              </p>
              <div className="space-y-3 font-medium text-xs text-gray-800">
                <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                  <span><strong>Deep-Link URL Sync:</strong> Click any job card to open a sharable URL (e.g. <code className="bg-white px-1 border">/dashboard/tracker?appId=...</code>).</span>
                </div>
                <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                  <span><strong>Linked Resumes:</strong> Attach the specific tailored resume used for that company to recall what you submitted during interviews.</span>
                </div>
                <div className="p-3 border-2 border-black bg-gray-50 flex items-center justify-between">
                  <span><strong>Salary &amp; Location Tracking:</strong> Log compensation ranges and remote/hybrid work policies.</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. ACCOUNT & CREDITS */}
          {activeSection === "billing" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">Account &amp; Credits</h3>
              <Accordion type="single" collapsible className="w-full" defaultValue="b1">
                <AccordionItem value="b1">
                  <AccordionTrigger className="text-base font-black hover:no-underline">How Credits &amp; Validity Work</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Elevara uses a <strong>zero-subscription, pay-as-you-go credit system</strong>. You get 50 free credits on registration. Purchased credits never expire.</p>
                    <p>AI generation costs 4–10 credits depending on the engine. Resume Studio editing and PDF exports are completely free.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b2">
                  <AccordionTrigger className="text-base font-black hover:no-underline">Payment Security &amp; Invoicing</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>All payments are securely processed through Razorpay with 256-bit SSL encryption. We support UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, NetBanking, and Wallets.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 8. AI COPILOT */}
          {activeSection === "copilot" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">AI Copilot Companion</h3>
              <p className="font-bold text-sm text-gray-700">
                The AI Copilot lives in your right sidebar and can assist with career Q&amp;A, tool navigation, and multi-step task execution.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-gray-50 border-2 border-black">
                  <p className="font-bold text-blue-900">// Example Navigation Prompt:</p>
                  <p className="text-gray-700 mt-1">&quot;Take me to Mock Interview for Senior Full Stack role&quot;</p>
                </div>
                <div className="p-3 bg-gray-50 border-2 border-black">
                  <p className="font-bold text-purple-900">// Example Career Advice Prompt:</p>
                  <p className="text-gray-700 mt-1">&quot;What are the top 3 high-yield questions Google asks in system design screenings?&quot;</p>
                </div>
              </div>
            </div>
          )}

          {/* 9. KEYBOARD SHORTCUTS */}
          {activeSection === "shortcuts" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                {[
                  { keys: ["Ctrl", "K"], desc: "Open Global Command Palette to jump to any page or tool" },
                  { keys: ["Ctrl", "B"], desc: "Toggle navigation sidebar collapse/expand" },
                  { keys: ["Ctrl", "S"], desc: "Save current resume draft in Resume Studio" },
                  { keys: ["Esc"], desc: "Close open modals, dropdowns, and Copilot sidebar" },
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-2 border-brutal-black bg-slate-50 hover:bg-yellow-50 transition-colors">
                    <span className="font-bold text-xs">{shortcut.desc}</span>
                    <span className="flex items-center gap-1">{shortcut.keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. TROUBLESHOOTING */}
          {activeSection === "troubleshoot" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">Troubleshooting</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tr1">
                  <AccordionTrigger className="text-base font-black hover:no-underline">Resume Upload or Parsing Issues</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Ensure your file is a text-based PDF or DOCX under 10MB. If you uploaded a scanned image photo of a resume, convert it to a searchable text PDF for optimal parsing.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tr2">
                  <AccordionTrigger className="text-base font-black hover:no-underline">Microphone Voice Input In Mock Interview</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-800 font-medium space-y-2">
                    <p>Speech-to-Text uses the standard Web Speech API supported in Google Chrome, Microsoft Edge, and Safari. Ensure microphone permissions are allowed for the site.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 11. SUPPORT & CONTACT */}
          {activeSection === "support" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-3">Support &amp; Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 border-3 border-brutal-black bg-brutal-yellow shadow-[4px_4px_0_#000]">
                  <Mail className="w-6 h-6 mb-2" />
                  <h4 className="font-black text-sm uppercase">Email Helpdesk</h4>
                  <p className="text-xs font-medium mt-1">support@vixora.co.in</p>
                </div>
                <div className="p-5 border-3 border-brutal-black bg-brutal-mint shadow-[4px_4px_0_#000]">
                  <MessageSquare className="w-6 h-6 mb-2" />
                  <h4 className="font-black text-sm uppercase">Feature Suggestions</h4>
                  <p className="text-xs font-medium mt-1">24-hour turnaround</p>
                </div>
                <div className="p-5 border-3 border-brutal-black bg-purple-200 shadow-[4px_4px_0_#000]">
                  <Shield className="w-6 h-6 mb-2" />
                  <h4 className="font-black text-sm uppercase">Security &amp; Privacy</h4>
                  <p className="text-xs font-medium mt-1">Zero data retention</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
