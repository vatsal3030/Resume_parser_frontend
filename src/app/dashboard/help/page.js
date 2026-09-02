"use client";
import { useState, useMemo } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  HelpCircle, Zap, Mail, MessageSquare, Code, Map,
  Briefcase, CreditCard, Bot, Keyboard, AlertTriangle, LifeBuoy, BookOpen,
  Search, Shield, Cpu, Layers, Target, Brain, X
} from "lucide-react";

const SECTIONS = [
  { id: "start", label: "Getting Started", icon: BookOpen },
  { id: "interview", label: "Mock Interview Guide", icon: MessageSquare },
  { id: "models", label: "AI Models & Routing", icon: Cpu },
  { id: "studio", label: "Resume Studio", icon: Layers },
  { id: "tools", label: "All Career Engines", icon: Zap },
  { id: "tracker", label: "Application Tracker", icon: Briefcase },
  { id: "billing", label: "Account & Credits", icon: CreditCard },
  { id: "copilot", label: "AI Copilot", icon: Bot },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "troubleshoot", label: "Troubleshooting", icon: AlertTriangle },
  { id: "support", label: "Support & Contact", icon: LifeBuoy },
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
  <kbd className="bg-(--surface-card) border border-(--hairline) px-2 py-0.5 mx-0.5 text-xs font-mono font-medium text-(--ink) rounded shadow-xs">{children}</kbd>
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
        <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 md:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-medium flex items-center gap-2.5 text-(--ink)">
                <HelpCircle className="w-7 h-7 text-(--primary)" /> Elevara Knowledge Base
              </h2>
              <p className="text-xs md:text-sm text-(--muted) mt-1">
                Everything you need to master ATS resume parsing, 5-round voice simulations, multi-model AI routing, and job applications.
              </p>
            </div>
            <span className="px-3 py-1 bg-(--surface-soft) text-(--muted) border border-(--hairline-soft) text-xs font-medium rounded-full shrink-0">
              v2.5 Documentation
            </span>
          </div>

          {/* SEARCH BOX */}
          <div className="relative mt-4">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)" />
            <input 
              type="text"
              className="w-full bg-(--surface-soft) border border-(--hairline) rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-(--ink) placeholder:text-(--muted-soft) shadow-xs outline-none focus:border-(--primary) transition-all"
              placeholder="Search documentation (e.g. 'voice interview', 'model selection', 'export pdf', 'credits')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-(--muted) hover:text-(--ink)"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* SEARCH RESULTS DROPDOWN / LIST */}
        {searchQuery.trim().length > 0 && (
          <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-5 shadow-md animate-in fade-in space-y-3">
            <div className="flex justify-between items-center border-b border-(--hairline-soft) pb-2">
              <span className="font-medium text-xs text-(--muted)">
                Found {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
              </span>
              <button onClick={() => setSearchQuery("")} className="text-xs font-medium text-(--primary) hover:underline">
                Clear Search
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2 pt-1">
                {searchResults.map((res, i) => (
                  <div 
                    key={i}
                    onClick={() => handleSelectSearchResult(res.sectionId)}
                    className="p-3 rounded-xl border border-(--hairline-soft) bg-(--surface-soft) hover:bg-(--surface-card) hover:border-(--hairline) cursor-pointer transition-colors flex justify-between items-center group shadow-xs"
                  >
                    <div>
                      <p className="font-medium text-xs text-(--ink) group-hover:text-(--primary)">{res.title}</p>
                      <p className="text-[11px] text-(--muted) mt-0.5">{res.content}</p>
                    </div>
                    <span className="text-xs font-medium text-(--primary) group-hover:translate-x-1 transition-transform ml-4 shrink-0">
                      View Section →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-(--muted) py-2">
                No matching topics found. Try searching for &quot;interview&quot;, &quot;models&quot;, &quot;studio&quot;, or &quot;credits&quot;.
              </p>
            )}
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-2xl bg-(--surface-card) border border-(--hairline) shadow-xs">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const isActive = activeSection === s.id && !searchQuery;
            return (
              <button 
                key={s.id} 
                onClick={() => { setActiveSection(s.id); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-(--primary) text-white border-(--primary) shadow-xs' 
                    : 'border-transparent hover:border-(--hairline) hover:bg-(--surface-soft) text-(--muted) hover:text-(--ink)'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {s.label}
              </button>
            );
          })}
        </div>

        {/* MAIN DOCUMENTATION CONTENT */}
        <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 md:p-8 shadow-sm space-y-6">

          {/* 1. GETTING STARTED */}
          {activeSection === "start" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
                <h3 className="text-xl font-serif font-medium text-(--ink)">Getting Started with Elevara</h3>
                <span className="text-xs font-medium bg-(--surface-soft) text-(--muted) px-2.5 py-0.5 rounded-full border border-(--hairline-soft)">Core Onboarding</span>
              </div>

              <Accordion type="single" collapsible className="w-full" defaultValue="s1">
                <AccordionItem value="s1">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    1. Account Creation & 50 Free Signup Credits
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2 leading-relaxed">
                    <p>When you register with your email or Google OAuth, your account is immediately credited with <strong>50 free AI generation credits</strong>.</p>
                    <p>There are no recurring subscription locks or credit card requirements. Credits never expire and give you full access to all career engines and the Resume Studio.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="s2">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    2. Multi-Domain ATS Resume Upload & Parsing
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2 leading-relaxed">
                    <p>Upload your existing resume in <strong>PDF or DOCX</strong> format from the Dashboard. The backend worker automatically extracts candidate details, calculates keyword scores, and provides actionable recommendations.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="s3">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    3. Recommended Workflow for Job Applications
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2 leading-relaxed">
                    <ol className="list-decimal pl-5 space-y-1.5">
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
              <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
                <h3 className="text-xl font-serif font-medium text-(--ink) flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-(--primary)" /> 5-Round Mock Interview Simulator
                </h3>
                <span className="text-xs font-medium bg-(--surface-soft) text-(--muted) px-2.5 py-0.5 rounded-full border border-(--hairline-soft)">Voice AI Active</span>
              </div>

              <p className="text-xs text-(--muted) leading-relaxed">
                Elevara features a complete 5-stage simulation designed to mirror real technical screenings, coding rounds, and hiring manager loops.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink) mb-1 flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-(--primary)" /> Round 1: Aptitude & Quantitative Logic
                  </p>
                  <p className="text-xs text-(--muted) leading-relaxed">
                    Tests logical reasoning, probability, pattern recognition, and quantitative problem-solving.
                  </p>
                </div>

                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink) mb-1 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-(--primary)" /> Round 2: Core Domain MCQs
                  </p>
                  <p className="text-xs text-(--muted) leading-relaxed">
                    Domain-specific multiple-choice questions with instant feedback and distractor explanations.
                  </p>
                </div>

                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink) mb-1 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-(--primary)" /> Round 3: Coding & Problem Solving
                  </p>
                  <p className="text-xs text-(--muted) leading-relaxed">
                    Real coding problems with starter code, monospace editor, and Big-O targets.
                  </p>
                </div>

                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink) mb-1 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-(--primary)" /> Round 4: Project Deep-Dive
                  </p>
                  <p className="text-xs text-(--muted) leading-relaxed">
                    Probes architecture choices, scalability, and trade-offs extracted from your resume.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full" defaultValue="mi1">
                <AccordionItem value="mi1">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    🎙️ Voice Practice (Speech-to-Text Dictation & Audio Narration)
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2 leading-relaxed">
                    <p>Click <em>&quot;Dictate by Voice&quot;</em> to speak your answers aloud. The browser Web Speech API transcribes your speech in real time.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mi2">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    📚 Master Solutions Key & Printable Study Cheat Sheet
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2 leading-relaxed">
                    <p>Toggle to the <strong>&quot;Model Solutions&quot;</strong> tab to view textbook ideal answers, step-by-step logic derivations, and Big-O targets.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 3. AI MODELS & ROUTING */}
          {activeSection === "models" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
                <h3 className="text-xl font-serif font-medium text-(--ink) flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-(--primary)" /> Multi-Model AI Engine Roster
                </h3>
                <span className="text-xs font-medium bg-(--surface-soft) text-(--muted) px-2.5 py-0.5 rounded-full border border-(--hairline-soft)">Model Matrix</span>
              </div>

              <p className="text-xs text-(--muted)">
                Select specific models for each tool or use the Smart Router to automatically pick the optimal engine.
              </p>

              <div className="border border-(--hairline) rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-(--surface-soft) text-(--ink) border-b border-(--hairline) font-medium">
                      <th className="p-3">Model Name</th>
                      <th className="p-3">Provider</th>
                      <th className="p-3">Best Used For</th>
                      <th className="p-3">Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--hairline-soft) font-medium">
                    <tr className="hover:bg-(--surface-soft)/50 transition-colors">
                      <td className="p-3 text-(--ink)">Smart Router (Auto)</td>
                      <td className="p-3 text-(--muted)">Adaptive</td>
                      <td className="p-3 text-(--body)">Fastest routing with automatic zero-downtime failover</td>
                      <td className="p-3"><span className="bg-(--primary)/10 text-(--primary) border border-(--primary)/20 px-2 py-0.5 rounded-full text-[10px]">Recommended</span></td>
                    </tr>
                    <tr className="hover:bg-(--surface-soft)/50 transition-colors">
                      <td className="p-3 text-(--ink)">Gemini 3.7 Flash</td>
                      <td className="p-3 text-(--muted)">Google Direct</td>
                      <td className="p-3 text-(--body)">Ultra-fast sub-second generation &amp; deep reasoning</td>
                      <td className="p-3"><span className="bg-(--surface-soft) text-(--muted) border border-(--hairline-soft) px-2 py-0.5 rounded-full text-[10px]">Latest</span></td>
                    </tr>
                    <tr className="hover:bg-(--surface-soft)/50 transition-colors">
                      <td className="p-3 text-(--ink)">Claude Sonnet 5</td>
                      <td className="p-3 text-(--muted)">Anthropic</td>
                      <td className="p-3 text-(--body)">Highest quality prose, nuanced cover letters &amp; complex code</td>
                      <td className="p-3"><span className="bg-(--primary)/10 text-(--primary) border border-(--primary)/20 px-2 py-0.5 rounded-full text-[10px]">Pro Quality</span></td>
                    </tr>
                    <tr className="hover:bg-(--surface-soft)/50 transition-colors">
                      <td className="p-3 text-(--ink)">DeepSeek V4 Flash</td>
                      <td className="p-3 text-(--muted)">DeepSeek</td>
                      <td className="p-3 text-(--body)">High-speed algorithmic problem solving &amp; code analysis</td>
                      <td className="p-3"><span className="bg-(--surface-soft) text-(--muted) border border-(--hairline-soft) px-2 py-0.5 rounded-full text-[10px]">Top Coder</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. RESUME STUDIO */}
          {activeSection === "studio" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
                <h3 className="text-xl font-serif font-medium text-(--ink) flex items-center gap-2">
                  <Layers className="w-5 h-5 text-(--primary)" /> Resume Studio &amp; Template Guide
                </h3>
                <span className="text-xs font-medium bg-(--surface-soft) text-(--muted) px-2.5 py-0.5 rounded-full border border-(--hairline-soft)">Builder Guide</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink)">1. Classic Template</p>
                  <p className="text-xs text-(--muted) mt-1">Traditional serif headers, clean horizontal dividing lines.</p>
                </div>
                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink)">2. Modern Template</p>
                  <p className="text-xs text-(--muted) mt-1">Sleek typography, compact pill badges for skills.</p>
                </div>
                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink)">3. Minimal Template</p>
                  <p className="text-xs text-(--muted) mt-1">Whitespace-rich, single-column design with maximum readability.</p>
                </div>
                <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4">
                  <p className="font-medium text-xs text-(--ink)">4. Brutalist Template</p>
                  <p className="text-xs text-(--muted) mt-1">Bold high-contrast borders and monospaced badges.</p>
                </div>
              </div>
            </div>
          )}

          {/* 5. ALL CAREER ENGINES */}
          {activeSection === "tools" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">All Career AI Engines</h3>
              <Accordion type="multiple" className="w-full" defaultValue={["t1","t2"]}>
                <AccordionItem value="t1">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    <span className="flex items-center gap-2"><Target className="w-4 h-4 text-(--primary)" /> Job Match AI Tailor</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Compares your resume text against any raw job description. Identifies missing keywords and provides revised bullet points that incorporate job requirements.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t2">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    <span className="flex items-center gap-2"><Mail className="w-4 h-4 text-(--primary)" /> Cover Letter Generator</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Creates tailored cover letters matching your background to the target role with clean, exportable Markdown and PDF.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t3">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    <span className="flex items-center gap-2"><Map className="w-4 h-4 text-(--primary)" /> Career Roadmaps</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Identifies exact skill gaps between your current resume and an aspirational role. Generates step-by-step milestones with project assignments.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="t4">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">
                    <span className="flex items-center gap-2"><Code className="w-4 h-4 text-(--primary)" /> GitHub Portfolio &amp; Profile README</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Fetches real public repositories from any GitHub username and outputs a deployable personal website and Markdown README.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 6. APPLICATION TRACKER */}
          {activeSection === "tracker" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">Application Kanban Board</h3>
              <p className="text-xs text-(--muted)">
                Track every job application through 5 pipeline stages: <strong>Saved</strong>, <strong>Applied</strong>, <strong>Interview</strong>, <strong>Offer</strong>, and <strong>Rejected</strong>.
              </p>
              <div className="space-y-2.5 text-xs text-(--body)">
                <div className="p-3.5 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <span><strong>Deep-Link URL Sync:</strong> Click any job card to open a sharable URL.</span>
                </div>
                <div className="p-3.5 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <span><strong>Linked Resumes:</strong> Attach the specific tailored resume used for that company.</span>
                </div>
                <div className="p-3.5 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <span><strong>Salary &amp; Location Tracking:</strong> Log compensation ranges and remote/hybrid work policies.</span>
                </div>
              </div>
            </div>
          )}

          {/* 7. ACCOUNT & CREDITS */}
          {activeSection === "billing" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">Account &amp; Credits</h3>
              <Accordion type="single" collapsible className="w-full" defaultValue="b1">
                <AccordionItem value="b1">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">How Credits &amp; Validity Work</AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Elevara uses a <strong>zero-subscription, pay-as-you-go credit system</strong>. You get 50 free credits on registration. Purchased credits never expire.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 8. AI COPILOT */}
          {activeSection === "copilot" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">AI Copilot Companion</h3>
              <p className="text-xs text-(--muted)">
                The AI Copilot lives in your right sidebar and can assist with career Q&amp;A, tool navigation, and multi-step task execution.
              </p>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 rounded-xl bg-(--surface-soft) border border-(--hairline-soft)">
                  <p className="font-medium text-(--primary)">{"// Example Navigation Prompt:"}</p>
                  <p className="text-(--muted) mt-1">&quot;Take me to Mock Interview for Senior Full Stack role&quot;</p>
                </div>
                <div className="p-3 rounded-xl bg-(--surface-soft) border border-(--hairline-soft)">
                  <p className="font-medium text-(--primary)">{"// Example Career Advice Prompt:"}</p>
                  <p className="text-(--muted) mt-1">&quot;What are the top 3 high-yield questions Google asks in system design screenings?&quot;</p>
                </div>
              </div>
            </div>
          )}

          {/* 9. KEYBOARD SHORTCUTS */}
          {activeSection === "shortcuts" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">Keyboard Shortcuts</h3>
              <div className="space-y-2">
                {[
                  { keys: ["Ctrl","K"], desc: "Open Global Command Palette to jump to any page or tool" },
                  { keys: ["Ctrl","B"], desc: "Toggle navigation sidebar collapse/expand" },
                  { keys: ["Ctrl","S"], desc: "Save current resume draft in Resume Studio" },
                  { keys: ["Esc"], desc: "Close open modals, dropdowns, and Copilot sidebar" },
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                    <span className="text-xs font-medium text-(--ink)">{shortcut.desc}</span>
                    <span className="flex items-center gap-1">{shortcut.keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 10. TROUBLESHOOTING */}
          {activeSection === "troubleshoot" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">Troubleshooting</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tr1">
                  <AccordionTrigger className="text-sm font-medium text-(--ink) hover:no-underline">Resume Upload or Parsing Issues</AccordionTrigger>
                  <AccordionContent className="text-xs text-(--body) space-y-2">
                    <p>Ensure your file is a text-based PDF or DOCX under 10MB.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* 11. SUPPORT & CONTACT */}
          {activeSection === "support" && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-serif font-medium text-(--ink) border-b border-(--hairline-soft) pb-3">Support &amp; Feedback</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <Mail className="w-5 h-5 mb-2 text-(--primary)" />
                  <h4 className="font-serif font-medium text-sm text-(--ink)">Email Helpdesk</h4>
                  <p className="text-xs text-(--muted) mt-0.5">support@vixora.co.in</p>
                </div>
                <div className="p-4 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <MessageSquare className="w-5 h-5 mb-2 text-(--primary)" />
                  <h4 className="font-serif font-medium text-sm text-(--ink)">Feature Suggestions</h4>
                  <p className="text-xs text-(--muted) mt-0.5">24-hour turnaround</p>
                </div>
                <div className="p-4 rounded-xl border border-(--hairline-soft) bg-(--surface-soft)">
                  <Shield className="w-5 h-5 mb-2 text-(--primary)" />
                  <h4 className="font-serif font-medium text-sm text-(--ink)">Security &amp; Privacy</h4>
                  <p className="text-xs text-(--muted) mt-0.5">Zero data retention</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PageShell>
  );
}
