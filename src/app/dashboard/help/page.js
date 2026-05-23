"use client";
import { useState } from "react";
import { PageShell } from "@/components/ui/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  HelpCircle, FileEdit, Zap, Mail, MessageSquare, Code, LayoutTemplate, Map,
  Briefcase, CreditCard, Bot, Keyboard, AlertTriangle, LifeBuoy, BookOpen,
  LayoutDashboard, ChevronRight, Search, Shield, Users
} from "lucide-react";

const SECTIONS = [
  { id: "start", label: "Getting Started", icon: BookOpen, color: "bg-brutal-yellow" },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brutal-blue" },
  { id: "tools", label: "Tools Reference", icon: Zap, color: "bg-brutal-mint" },
  { id: "billing", label: "Account & Billing", icon: CreditCard, color: "bg-brutal-pink" },
  { id: "copilot", label: "AI Copilot", icon: Bot, color: "bg-purple-300" },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard, color: "bg-orange-300" },
  { id: "troubleshoot", label: "Troubleshooting", icon: AlertTriangle, color: "bg-red-300" },
  { id: "support", label: "Contact & Support", icon: LifeBuoy, color: "bg-gray-200" },
];

const Kbd = ({ children }) => (
  <kbd className="bg-gray-200 border border-brutal-black px-1.5 py-0.5 mx-0.5 text-xs font-mono font-bold">{children}</kbd>
);

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState("start");

  return (
    <PageShell title="Help & Documentation" subtitle="Everything you need to master Elevara.">
      <div className="max-w-5xl mx-auto">
        {/* Intro Banner */}
        <div className="bg-brutal-yellow border-4 border-brutal-black p-8 shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-3 flex items-center gap-3">
            <HelpCircle className="w-8 h-8" /> Elevara Documentation
          </h2>
          <p className="text-lg font-bold">
            Elevara is an AI-powered career suite designed to help you land your dream job. From resume building to mock interviews, every tool is crafted to give you a competitive edge.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-3 bg-white border-4 border-brutal-black">
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-black uppercase tracking-wider border-2 transition-all ${activeSection === s.id ? `${s.color} border-brutal-black shadow-[2px_2px_0_#000]` : 'border-transparent hover:border-brutal-black hover:bg-gray-50'}`}>
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="bg-white border-4 border-brutal-black p-6 md:p-8 shadow-[4px_4px_0_rgba(0,0,0,1)]">

          {/* Getting Started */}
          {activeSection === "start" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Getting Started</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="s1"><AccordionTrigger className="text-base font-bold hover:no-underline">1. Create Your Account</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Visit the registration page and sign up with your email or Google account. After confirming your email, you&apos;ll be redirected to your dashboard.</p>
                    <p>You receive <strong>50 free credits</strong> on signup to explore all AI tools.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="s2"><AccordionTrigger className="text-base font-bold hover:no-underline">2. Complete Your Profile</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Navigate to <strong>Profile</strong> and fill in your personal details, education, career goals, and social links. A complete profile helps AI tools generate more personalized results.</p>
                    <p>Fields include: country, state, current status (student/professional), university (with auto-search), degree, skills, and target role.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="s3"><AccordionTrigger className="text-base font-bold hover:no-underline">3. Upload Your First Resume</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Go to the <strong>Dashboard</strong> and click &quot;Upload Resume&quot; or use the <strong>Resume Studio</strong> to build one from scratch. Supported formats: PDF, DOCX.</p>
                    <p>Once uploaded, the AI automatically parses and analyzes your resume, providing an ATS compatibility score.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="s4"><AccordionTrigger className="text-base font-bold hover:no-underline">4. Explore AI Tools</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Use the sidebar to navigate between tools. Each tool costs credits (typically 10 per generation). Start with the <strong>AI Tailor</strong> to optimize your resume for a specific job description.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Dashboard */}
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Dashboard Guide</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="d1"><AccordionTrigger className="text-base font-bold hover:no-underline">Overview Stats</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>The dashboard displays key metrics: <strong>Total Resumes</strong>, <strong>Average ATS Score</strong>, <strong>AI Generations Used</strong>, and <strong>Remaining Credits</strong>.</p>
                    <p>These update in real-time as you use tools and upload resumes.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="d2"><AccordionTrigger className="text-base font-bold hover:no-underline">Activity Feed</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>The activity feed shows your recent actions: resume uploads, AI generations, profile updates, and payment events. Click any item for details.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="d3"><AccordionTrigger className="text-base font-bold hover:no-underline">Workflows & Quick Actions</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>The &quot;Continue Where You Left Off&quot; card tracks multi-step workflows like resume optimization and interview prep. Quick action cards let you jump to any tool instantly.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Tools Reference */}
          {activeSection === "tools" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Tools Reference</h3>
              <Accordion type="multiple" className="w-full">
                <AccordionItem value="t1"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><FileEdit className="w-5 h-5 text-brutal-blue" /> Resume Studio</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> A powerful editor to build, customize, and polish your resume with real-time preview.</p>
                    <p><strong>Features:</strong> Drag-and-drop sections, multiple templates, auto-save, ATS score analysis, and multi-format export (PDF, DOCX, TXT, JSON).</p>
                    <p><strong>Tips:</strong> Use the &quot;Sections&quot; panel to reorder content. Keep bullet points concise (1-2 lines). Use action verbs to start each bullet.</p>
                    <p><strong>Cost:</strong> Free to edit. Export costs 0 credits.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t2"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><Zap className="w-5 h-5 text-brutal-yellow" /> AI Tailor</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Analyzes your resume against a job description and rewrites it to maximize ATS compatibility.</p>
                    <p><strong>How to use:</strong> Select a resume, paste the job description, and click &quot;Tailor&quot;. The AI identifies missing keywords, rewrites bullets, and reorders sections.</p>
                    <p><strong>Best practices:</strong> Paste the full job description (not just the title). Review AI suggestions before accepting — it&apos;s a starting point, not a final draft.</p>
                    <p><strong>Cost:</strong> 10 credits per generation.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t3"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><Mail className="w-5 h-5 text-brutal-pink" /> Cover Letter Generator</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Creates personalized cover letters targeting specific companies and roles using your resume data.</p>
                    <p><strong>How to use:</strong> Select your resume, enter the company name, role, and job description. Optionally adjust the tone (formal/conversational).</p>
                    <p><strong>Tips:</strong> Add the company&apos;s mission statement for hyper-personalized output. Edit the result to add personal anecdotes.</p>
                    <p><strong>Cost:</strong> 10 credits per generation.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t4"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-brutal-green" /> Mock Interviews</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Simulates behavioral and technical interviews with AI-powered questions and real-time feedback.</p>
                    <p><strong>How to use:</strong> Choose the interview type (behavioral, technical, HR), enter the target role, and start. Answer questions and receive instant scoring on clarity, relevance, and structure.</p>
                    <p><strong>Tips:</strong> Use the STAR method (Situation, Task, Action, Result) for behavioral questions. Practice at least 3 sessions before real interviews.</p>
                    <p><strong>Cost:</strong> 10 credits per session.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t5"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><Map className="w-5 h-5 text-purple-500" /> Career Roadmap</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Builds a step-by-step learning curriculum to bridge your skill gaps based on your current resume and target role.</p>
                    <p><strong>How to use:</strong> Select your resume, enter the target role, and generate. The AI creates a phased roadmap with resources, timelines, and milestones.</p>
                    <p><strong>Cost:</strong> 10 credits per generation.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t6"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><Code className="w-5 h-5 text-gray-700" /> GitHub Analyzer</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Scores your GitHub profile and provides actionable tips to make it recruiter-friendly.</p>
                    <p><strong>How to use:</strong> Enter your GitHub username and generate. The AI analyzes repositories, contribution history, README quality, and profile completeness.</p>
                    <p><strong>Cost:</strong> 10 credits per analysis.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t7"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-teal-500" /> Portfolio Generator</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> Generates a professional portfolio website from your resume data.</p>
                    <p><strong>How to use:</strong> Select a resume, choose a theme, and generate. Preview the result and download the code or deploy directly.</p>
                    <p><strong>Cost:</strong> 10 credits per generation.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="t8"><AccordionTrigger className="text-base font-bold hover:no-underline"><span className="flex items-center gap-2"><Briefcase className="w-5 h-5 text-orange-500" /> Job Tracker</span></AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>What it does:</strong> A Kanban-style board to track your job applications through stages: Bookmarked, Applied, Interview, Offer, Rejected.</p>
                    <p><strong>How to use:</strong> Add applications manually or use the browser extension to auto-capture job listings. Drag cards between columns to update status.</p>
                    <p><strong>Cost:</strong> Free (no credits required).</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Account & Billing */}
          {activeSection === "billing" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Account & Billing</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="b1"><AccordionTrigger className="text-base font-bold hover:no-underline">How Credits Work</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Credits are the currency for AI generations. Each AI tool costs <strong>10 credits</strong> per use. You receive 50 free credits on signup.</p>
                    <p>Credits never expire. You can purchase more anytime from the <strong>Credits &amp; Plans</strong> page.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b2"><AccordionTrigger className="text-base font-bold hover:no-underline">Available Plans</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p><strong>Basic (₹99)</strong> — 100 credits, standard support, all tools access.</p>
                    <p><strong>Pro (₹399)</strong> — 500 credits, priority support, early access features.</p>
                    <p><strong>Enterprise (₹999)</strong> — 1500 credits, dedicated support, bulk export &amp; API access.</p>
                    <p>All plans are one-time purchases, no recurring subscriptions.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b3"><AccordionTrigger className="text-base font-bold hover:no-underline">Payment Methods</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>We accept: <strong>UPI (Google Pay, PhonePe, Paytm)</strong>, <strong>QR Code scanning</strong>, <strong>Debit/Credit Cards</strong>, <strong>Net Banking</strong>, and <strong>Wallets</strong>.</p>
                    <p>All payments are securely processed by Razorpay. We never store your card details.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b4"><AccordionTrigger className="text-base font-bold hover:no-underline">Refund Policy</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>If a payment is deducted but credits are not added due to a technical issue, contact us at <strong>support@vixora.co.in</strong> with your payment ID. We will resolve it within 24-48 hours.</p>
                    <p>Credits already used for AI generations are non-refundable.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="b5"><AccordionTrigger className="text-base font-bold hover:no-underline">Change Password</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Go to <strong>Profile → Account tab → Security</strong>. Enter your new password and confirm it, then click &quot;Save Profile&quot;. Minimum 6 characters required.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* AI Copilot */}
          {activeSection === "copilot" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">AI Copilot Guide</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="c1"><AccordionTrigger className="text-base font-bold hover:no-underline">What is the AI Copilot?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>The AI Copilot is your intelligent assistant that lives in the sidebar. It can navigate you to any page, answer career questions, provide context-aware suggestions, and help automate multi-step tasks.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="c2"><AccordionTrigger className="text-base font-bold hover:no-underline">Navigation Commands</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Ask the Copilot to navigate: &quot;Go to Resume Studio&quot;, &quot;Open Cover Letter tool&quot;, &quot;Take me to Credits page&quot;, &quot;Show my profile&quot;.</p>
                    <p>It understands natural language — you don&apos;t need exact commands.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="c3"><AccordionTrigger className="text-base font-bold hover:no-underline">Task Automation</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>The Copilot can perform multi-step tasks: &quot;Tailor my resume for this job&quot;, &quot;Generate a cover letter for Google SWE role&quot;, &quot;Analyze my GitHub profile&quot;.</p>
                    <p>It will gather context from your current page and profile, then execute the appropriate tool with pre-filled inputs.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Keyboard Shortcuts */}
          {activeSection === "shortcuts" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Keyboard Shortcuts</h3>
              <div className="space-y-3">
                {[
                  { keys: ["Ctrl", "K"], desc: "Open Command Palette — jump to any page or tool instantly" },
                  { keys: ["Ctrl", "B"], desc: "Toggle sidebar collapse/expand" },
                  { keys: ["Ctrl", "S"], desc: "Save current work (in Resume Studio)" },
                  { keys: ["Esc"], desc: "Close modals, dropdowns, and the Copilot sidebar" },
                ].map((shortcut, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border-2 border-brutal-black bg-brutal-bg hover:bg-brutal-yellow/20 transition-colors">
                    <span className="font-bold text-sm">{shortcut.desc}</span>
                    <span className="flex items-center gap-1">{shortcut.keys.map((k, j) => <Kbd key={j}>{k}</Kbd>)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          {activeSection === "troubleshoot" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Troubleshooting</h3>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="tr1"><AccordionTrigger className="text-base font-bold hover:no-underline">&quot;Backend route not found&quot; or &quot;Server not running&quot;</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>This usually means the backend API server is unreachable. Check your internet connection and try refreshing the page. If the issue persists, the server may be temporarily down for maintenance.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tr2"><AccordionTrigger className="text-base font-bold hover:no-underline">&quot;Insufficient credits&quot;</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Each AI tool costs 10 credits. Check your balance in the sidebar or Credits page. Purchase more credits to continue using AI tools.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tr3"><AccordionTrigger className="text-base font-bold hover:no-underline">Resume upload fails or shows errors</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Ensure your file is a valid PDF or DOCX under 10MB. Scanned image PDFs may not parse correctly — use text-based PDFs for best results.</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tr4"><AccordionTrigger className="text-base font-bold hover:no-underline">Payment successful but credits not added</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Wait 1-2 minutes and refresh the page. If credits still don&apos;t appear, contact <strong>support@vixora.co.in</strong> with your Razorpay payment ID (available in your email receipt).</p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="tr5"><AccordionTrigger className="text-base font-bold hover:no-underline">Browser compatibility</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-700 font-medium space-y-2">
                    <p>Elevara works best on <strong>Chrome, Edge, Firefox, and Safari</strong> (latest versions). Disable browser extensions that block JavaScript if you experience issues.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Contact & Support */}
          {activeSection === "support" && (
            <div className="space-y-6">
              <h3 className="text-2xl font-black uppercase border-b-4 border-brutal-black pb-2">Contact & Support</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border-4 border-brutal-black bg-brutal-yellow shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <Mail className="w-8 h-8 mb-3" />
                  <h4 className="text-lg font-black uppercase mb-2">Email Support</h4>
                  <p className="font-medium text-sm mb-3">For bugs, billing issues, or general queries.</p>
                  <a href="mailto:support@vixora.co.in" className="font-black text-sm underline underline-offset-4 hover:text-brutal-blue">support@vixora.co.in</a>
                </div>
                <div className="p-6 border-4 border-brutal-black bg-brutal-mint shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <MessageSquare className="w-8 h-8 mb-3" />
                  <h4 className="text-lg font-black uppercase mb-2">Feature Requests</h4>
                  <p className="font-medium text-sm mb-3">Have an idea? We&apos;d love to hear it.</p>
                  <a href="mailto:support@vixora.co.in?subject=Feature%20Request" className="font-black text-sm underline underline-offset-4 hover:text-brutal-blue">Submit a Request</a>
                </div>
                <div className="p-6 border-4 border-brutal-black bg-brutal-pink shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <AlertTriangle className="w-8 h-8 mb-3" />
                  <h4 className="text-lg font-black uppercase mb-2">Bug Reports</h4>
                  <p className="font-medium text-sm mb-3">Found a bug? Help us improve.</p>
                  <a href="mailto:support@vixora.co.in?subject=Bug%20Report" className="font-black text-sm underline underline-offset-4 hover:text-brutal-blue">Report a Bug</a>
                </div>
                <div className="p-6 border-4 border-brutal-black bg-brutal-bg shadow-[4px_4px_0_rgba(0,0,0,1)]">
                  <Users className="w-8 h-8 mb-3" />
                  <h4 className="text-lg font-black uppercase mb-2">Community</h4>
                  <p className="font-medium text-sm mb-3">Join the Elevara community to share tips and connect with peers.</p>
                  <p className="font-black text-sm">Coming Soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
