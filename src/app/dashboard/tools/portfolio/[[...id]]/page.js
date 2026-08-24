"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Laptop, 
  Github, 
  Code, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Eye, 
  Layout, 
  Sparkles,
  Terminal,
  Globe,
  Maximize2,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  CheckCircle,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Select } from '@/components/ui/Select';
import { PORTFOLIO_TEMPLATES } from '@/components/portfolio-templates';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { SkeletonPage } from '@/components/ui/Skeleton';
import { RegenerateBlock } from '@/components/ui/RegenerateBlock';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';
import { useResumes } from '@/hooks/useResumes';

// Helper to generate index.html code for the selected template
const generateTemplateHTML = (data, templateId) => {
  if (!data) return '';
  const name = data.header?.name || "Jane Doe";
  const title = data.header?.title || "Full Stack Engineer";
  const tagline = data.header?.tagline || "Building beautiful high-performance web applications.";
  const about = data.about || "Passionate software engineer and open source contributor.";
  const skillsList = data.skills?.map(s => `<li>${s}</li>`).join('\n        ') || '';
  const projectsList = data.projects?.map(p => `
      <div class="project-card">
        <div class="project-header">
          <h3>${p.name}</h3>
          ${p.liveUrl ? `<span class="project-star">★</span>` : ''}
        </div>
        <p>${p.description}</p>
        <div class="tech-tags">
          ${p.techStack?.map(t => `<span class="tag">${t}</span>`).join('\n          ') || ''}
        </div>
        ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="project-link">View Project &rarr;</a>` : ''}
      </div>
  `).join('\n') || '';
  const contact = data.contact || {};

  let styles = '';
  if (templateId === 'BRUTALIST') {
    styles = `
      :root { --bg: #f3f4f6; --fg: #000000; --accent: #facc15; --pink: #f472b6; }
      body { font-family: 'Courier New', Courier, monospace; background-color: var(--bg); color: var(--fg); padding: 2rem; margin: 0; line-height: 1.5; }
      .container { max-width: 800px; margin: 0 auto; border: 4px solid var(--fg); background: #ffffff; padding: 2rem; box-shadow: 8px 8px 0 var(--fg); }
      header { border-bottom: 4px solid var(--fg); padding-bottom: 2rem; margin-bottom: 2rem; }
      h1 { font-size: 3.5rem; font-weight: 900; margin: 0 0 0.5rem 0; text-transform: uppercase; letter-spacing: -2px; }
      .title { font-size: 1.5rem; font-weight: bold; background: var(--accent); display: inline-block; padding: 0.25rem 0.75rem; border: 2px solid var(--fg); box-shadow: 2px 2px 0 var(--fg); }
      .tagline { margin-top: 1rem; font-style: italic; color: #555; }
      h2 { font-size: 2rem; font-weight: 900; text-transform: uppercase; border-bottom: 4px solid var(--fg); padding-bottom: 0.5rem; margin-top: 2rem; }
      .skills ul { display: flex; flex-wrap: wrap; gap: 0.75rem; list-style: none; padding: 0; }
      .skills li { background: var(--pink); border: 2px solid var(--fg); padding: 0.5rem 1rem; font-weight: bold; box-shadow: 3px 3px 0 var(--fg); }
      .project-card { border: 3px solid var(--fg); margin-bottom: 1.5rem; padding: 1.5rem; background: #ffffff; box-shadow: 4px 4px 0 var(--fg); transition: all 0.2s; }
      .project-card:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--fg); }
      .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
      .project-header h3 { margin: 0; font-size: 1.5rem; font-weight: 900; }
      .project-star { background: var(--accent); border: 2px solid var(--fg); padding: 0.2rem 0.5rem; font-size: 0.8rem; font-weight: bold; }
      .tag { background: var(--fg); color: #fff; padding: 0.25rem 0.5rem; font-size: 0.8rem; font-weight: bold; margin-right: 0.35rem; display: inline-block; }
      .project-link { display: inline-block; margin-top: 1rem; color: var(--fg); font-weight: bold; text-decoration: underline; }
      footer a { color: var(--fg); font-weight: bold; text-decoration: underline; }
    `;
  } else if (templateId === 'DEVELOPER') {
    styles = `
      body { font-family: 'Courier New', monospace; background-color: #0d1117; color: #c9d1d9; padding: 2rem; margin: 0; line-height: 1.6; }
      .container { max-width: 850px; margin: 0 auto; background: #161b22; border: 2px solid #30363d; padding: 2.5rem; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); }
      header { border-bottom: 2px solid #30363d; padding-bottom: 2rem; margin-bottom: 2rem; }
      h1 { color: #58a6ff; font-size: 2.5rem; margin: 0 0 0.5rem 0; }
      .title { color: #8b949e; font-size: 1.25rem; font-weight: bold; }
      .tagline { margin-top: 0.75rem; color: #8b949e; font-style: italic; }
      h2 { color: #58a6ff; font-size: 1.75rem; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; margin-top: 2.5rem; }
      .skills ul { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; padding: 0; }
      .skills li { background: #21262d; border: 1px solid #30363d; color: #58a6ff; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: bold; }
      .project-card { border: 1px solid #30363d; padding: 1.5rem; background: #0d1117; border-radius: 6px; margin-bottom: 1.5rem; }
      .project-header h3 { margin: 0; color: #ff7b72; font-size: 1.35rem; }
      .tag { background: #21262d; color: #8b949e; padding: 0.2rem 0.5rem; font-size: 0.75rem; border-radius: 3px; margin-right: 0.35rem; display: inline-block; border: 1px solid #30363d; }
      .project-link { color: #58a6ff; text-decoration: none; display: inline-block; margin-top: 1rem; font-weight: bold; }
      .project-link:hover { text-decoration: underline; }
      footer a { color: #58a6ff; text-decoration: none; }
      footer a:hover { text-decoration: underline; }
    `;
  } else {
    // Elegant / Minimal Theme
    styles = `
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #fafafa; color: #171717; padding: 4rem 1.5rem; margin: 0; line-height: 1.6; }
      .container { max-width: 650px; margin: 0 auto; }
      header { margin-bottom: 3rem; }
      h1 { font-size: 3rem; font-weight: 800; tracking: -0.05em; margin: 0 0 0.5rem 0; letter-spacing: -1px; }
      .title { color: #666; font-size: 1.25rem; font-weight: 500; }
      .tagline { margin-top: 1rem; color: #888; font-size: 1.1rem; }
      h2 { font-size: 1.75rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1rem; border-bottom: 1px solid #eaeaea; padding-bottom: 0.5rem; }
      .skills ul { display: flex; flex-wrap: wrap; gap: 0.5rem; list-style: none; padding: 0; }
      .skills li { background: #f4f4f5; color: #27272a; padding: 0.4rem 0.8rem; font-size: 0.9rem; border-radius: 6px; font-weight: 500; border: 1px solid #e4e4e7; }
      .project-card { margin-top: 2rem; border-top: 1px solid #eaeaea; padding-top: 2rem; }
      .project-header h3 { margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700; }
      .tag { font-size: 0.8rem; color: #71717a; margin-right: 0.5rem; font-weight: bold; background: #f4f4f5; border: 1px solid #e4e4e7; padding: 0.15rem 0.4rem; border-radius: 4px; display: inline-block; }
      .project-link { color: #2563eb; text-decoration: none; font-weight: 600; display: inline-block; margin-top: 0.75rem; }
      .project-link:hover { text-decoration: underline; }
      footer a { color: #2563eb; text-decoration: none; font-weight: bold; }
      footer a:hover { text-decoration: underline; }
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Portfolio</title>
  <style>
    ${styles}
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${name}</h1>
      <p class="title">${title}</p>
      <p class="tagline">"${tagline}"</p>
    </header>

    <section class="about">
      <h2>About Me</h2>
      <p>${about}</p>
    </section>

    <section class="skills">
      <h2>Skills & Technologies</h2>
      <ul>
        ${skillsList}
      </ul>
    </section>

    <section class="projects">
      <h2>Featured Work</h2>
      ${projectsList}
    </section>

    <footer style="margin-top: 4rem; border-top: 1px solid #eaeaea; padding-top: 2rem; font-size: 0.95rem; color: #555;">
      <h2>Let's Connect</h2>
      <p>Email: <a href="mailto:${contact.email || ''}">${contact.email || ''}</a></p>
      ${contact.linkedin ? `<p>LinkedIn: <a href="${contact.linkedin}" target="_blank">${contact.linkedin}</a></p>` : ''}
      ${contact.github ? `<p>GitHub: <a href="${contact.github}" target="_blank">${contact.github}</a></p>` : ''}
    </footer>
  </div>
</body>
</html>`;
};

export default function PortfolioGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState('BRUTALIST');
  const [copied, setCopied] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Tab Switcher and Deploy simulation state
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'html'
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployStep, setDeployStep] = useState(0); // 0: Idle form, 1: Connecting, 2: Writing, 3: Deploying, 4: Success
  const [wizardStep, setWizardStep] = useState(0); // 0: Download HTML, 1: Create Repo, 2: Upload, 3: Settings, 4: Simulate Deploy
  const [githubUser, setGithubUser] = useState('');
  const [repoName, setRepoName] = useState('portfolio-site');
  const [htmlCopied, setHtmlCopied] = useState(false);
  const { resumes, isLoading: resumesLoading } = useResumes();
  const [selectedResume, setSelectedResume] = useState('');
  const [modelId, setModelId] = useState('default');
  const [historyResult, setHistoryResult] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop'); // desktop, tablet, mobile
  const toast = useToast();

  const {
    status,
    progress,
    stage,
    message,
    result,
    error,
    startJob,
    monitorJob,
    cancelJob,
    resetJob,
    jobId
  } = useAsyncJob();

  // Handle Full Screen Esc Key and Body Scroll Lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };
    if (isFullScreen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullScreen]);

  const handleGenerate = () => {
    if (!selectedResume) {
      toast.warning('Missing Info', 'Please select a resume first.');
      return;
    }
    setHistoryResult(null);
    startJob('/career/portfolio', { resumeId: selectedResume, modelId });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);
  
  // Use history result if loaded, otherwise use live result
  const activeResult = historyResult || result;
  
  // Parse payload from history if needed
  let displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : activeResult;

  if (displayResult) {
    displayResult = { ...displayResult }; // Clone so we can mutate safely

    // 1. Fallback for Skills
    if (!displayResult.skills || !Array.isArray(displayResult.skills) || displayResult.skills.length === 0) {
      displayResult.skills = ["JavaScript", "React", "Node.js", "HTML", "CSS", "Git", "SQL"];
    } else {
      // Flatten skills
      let flatSkills = [];
      displayResult.skills.forEach(item => {
        if (typeof item === 'string') {
          flatSkills.push(item);
        } else if (typeof item === 'object' && item !== null) {
          if (Array.isArray(item.skills)) {
            flatSkills = [...flatSkills, ...item.skills];
          } else if (item.name) {
            flatSkills.push(item.name);
          } else if (item.skill) {
            flatSkills.push(item.skill);
          }
        }
      });
      displayResult.skills = flatSkills.length > 0 ? flatSkills : ["JavaScript", "React", "Node.js"];
    }

    // 2. Fallback for Projects
    if (!displayResult.projects || !Array.isArray(displayResult.projects) || displayResult.projects.length === 0) {
      displayResult.projects = [
        { name: "Portfolio V1", description: "First iteration of my personal portfolio showcasing my projects and skills.", techStack: ["React", "CSS"], liveUrl: "#" },
        { name: "Full Stack App", description: "A comprehensive web application with authentication and database integration.", techStack: ["Node.js", "Express", "MongoDB"], liveUrl: "#" }
      ];
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(displayResult, null, 2));
    setCopied(true);
    toast.success('Copied!', 'Portfolio JSON copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyHtmlToClipboard = () => {
    const html = generateTemplateHTML(displayResult, selectedTemplate);
    navigator.clipboard.writeText(html);
    setHtmlCopied(true);
    toast.success('Copied!', 'Static index.html copied to clipboard.');
    setTimeout(() => setHtmlCopied(false), 2000);
  };

  const downloadHtmlFile = () => {
    const html = generateTemplateHTML(displayResult, selectedTemplate);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded index.html!', 'Save it and open in any browser or host it on GitHub Pages.');
  };

  // Simulate deployment steps
  const startDeployment = () => {
    if (!githubUser.trim()) {
      toast.warning('Input Required', 'Please enter your GitHub Username.');
      return;
    }
    setDeployStep(1);
    setTimeout(() => {
      setDeployStep(2);
      setTimeout(() => {
        setDeployStep(3);
        setTimeout(() => {
          setDeployStep(4);
          toast.success('Deployed!', 'Your portfolio is now live on GitHub Pages.');
        }, 1500);
      }, 1200);
    }, 1000);
  };

  return (
    <ToolPageLayout
      title="Portfolio Gen"
      subtitle="One-click personal website architecture."
      subtitleColor="bg-brutal-blue text-black"
      toolType="PORTFOLIO"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      activeResult={activeResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >
      {/* INPUTS — Full-width compact bar */}
      <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">1. Resume Context</label>
              <Select 
                value={selectedResume}
                onChange={setSelectedResume}
                disabled={isGenerating}
                placeholder="-- Select Resume --"
                options={resumes.map(r => ({
                  value: r.id,
                  label: r.title || r.originalName || 'Untitled Resume'
                }))}
              />
            </div>

            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">2. Theme</label>
              <Select
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                disabled={isGenerating}
                options={Object.values(PORTFOLIO_TEMPLATES).map(t => ({ value: t.id, label: t.name }))}
              />
            </div>

            <div>
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} compact />
            </div>

            <div>
              <Button 
                variant="brutal" 
                className="w-full text-base py-3 bg-brutal-pink text-black hover:bg-pink-400 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Layout className="w-4 h-4" /> Designing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Generate Portfolio
                   </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RESULTS — Full-width below */}
      <div className="space-y-6 mb-8">
          {status === JOB_STATUS.IDLE && !historyResult && (
            <div className="border-4 border-dashed border-brutal-black flex items-center justify-center p-12 text-center opacity-50">
               <p className="font-bold text-xl">Generate a full portfolio data structure ready for React/Next.js.</p>
            </div>
          )}
          
          <ProcessingPipeline 
            status={status}
            progress={progress}
            stage={stage}
            message={message}
            error={error}
            onRetry={handleGenerate}
            onCancel={cancelJob}
          />

          {(status === JOB_STATUS.COMPLETED || historyResult) && displayResult && (
            <div className="animate-in fade-in slide-in-from-bottom-8 space-y-6">
              <BranchingNavigation 
                activeResult={activeResult} 
                toolType="PORTFOLIO" 
                onSelect={(selected) => setHistoryResult(selected)} 
              />
              <div className="flex justify-end">
                <ResultActions 
                  resultId={activeResult?.id || activeResult?.aiJobId || jobId}
                  isPinned={activeResult?.isPinned}
                  onDelete={() => { setHistoryResult(null); resetJob(); }}
                  resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
                  className="mb-4"
                />
              </div>

              {/* Result Suite */}
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-brutal-black pb-4 gap-4">
                   <div>
                     <h2 className="text-3xl font-black">Design Suite</h2>
                     <p className="font-bold text-gray-600">A complete wireframe and deployment.</p>
                   </div>
                   
                   <div className="flex flex-wrap items-center gap-4 z-50">
                     {/* Preview/HTML Tabs */}
                     <div className="flex border-2 border-brutal-black font-black text-sm bg-white shadow-[2px_2px_0_#000]">
                       <button 
                         onClick={() => setActiveTab('preview')}
                         className={`px-4 py-2 border-r-2 border-brutal-black uppercase transition-colors ${activeTab === 'preview' ? 'bg-brutal-yellow' : 'hover:bg-gray-100'}`}
                       >
                         <span className="flex items-center gap-1"><Laptop className="w-4 h-4" /> Live Preview</span>
                       </button>
                       <button 
                         onClick={() => setActiveTab('html')}
                         className={`px-4 py-2 uppercase transition-colors ${activeTab === 'html' ? 'bg-brutal-pink' : 'hover:bg-gray-100'}`}
                       >
                         <span className="flex items-center gap-1"><Terminal className="w-4 h-4" /> Export HTML</span>
                       </button>
                     </div>

                     {/* Deploy to Pages Button */}
                     {displayResult && !isGenerating && (
                       <Button 
                         variant="brutal" 
                         onClick={() => { setShowDeployModal(true); setDeployStep(0); setWizardStep(0); }}
                         className="bg-brutal-blue text-black font-black uppercase text-sm h-10"
                       >
                         <Globe className="w-4 h-4 mr-2" /> Deploy
                       </Button>
                     )}

                     {/* Template Selector */}
                     <div className="w-48 relative z-50">
                       <Select
                         value={selectedTemplate}
                         onChange={setSelectedTemplate}
                         disabled={isGenerating}
                         options={Object.values(PORTFOLIO_TEMPLATES).map(t => ({ value: t.id, label: t.name }))}
                       />
                     </div>
                     
                     {/* Export Dropdown */}
                     <div className="relative z-50">
                       {displayResult && !isGenerating && (
                         <ExportDropdown data={displayResult} templateId={selectedTemplate} />
                       )}
                     </div>
                     
                     {/* Full Screen Toggle */}
                     {displayResult && !isGenerating && (
                       <Button variant="outline" className="border-brutal-black border-2 border-b-4 border-r-4 hover:bg-gray-100 rounded-none h-10 px-3" onClick={() => setIsFullScreen(true)}>
                         <Maximize2 className="w-5 h-5" />
                       </Button>
                     )}
                   </div>
                </div>

                {/* DYNAMIC PORTFOLIO PREVIEW / HTML VIEWER */}
                <div className="mt-8">
                  {isGenerating ? (
                    <SkeletonPage type="portfolio" />
                  ) : activeTab === 'html' ? (
                    <div className="border-4 border-brutal-black shadow-[4px_4px_0_#000] bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-none relative font-mono text-sm max-h-[600px] overflow-y-auto">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button variant="outline" className="bg-white border-2 border-brutal-black text-black font-bold h-8 text-xs hover:bg-gray-100 rounded-none" onClick={copyHtmlToClipboard}>
                          {htmlCopied ? <Check className="w-4 h-4 mr-1 text-green-600" /> : <Copy className="w-4 h-4 mr-1" />}
                          {htmlCopied ? "Copied!" : "Copy Code"}
                        </Button>
                        <Button variant="outline" className="bg-white border-2 border-brutal-black text-black font-bold h-8 text-xs hover:bg-gray-100 rounded-none" onClick={downloadHtmlFile}>
                          <Download className="w-4 h-4 mr-1" /> Download index.html
                        </Button>
                      </div>
                      <h4 className="text-sm font-black uppercase text-brutal-pink tracking-wider mb-4 border-b border-gray-700 pb-2">&lt;index.html&gt; for {PORTFOLIO_TEMPLATES[selectedTemplate]?.name}</h4>
                      <pre className="whitespace-pre-wrap select-all">
                        {generateTemplateHTML(displayResult, selectedTemplate)}
                      </pre>
                    </div>
                  ) : displayResult ? (
                    React.createElement(PORTFOLIO_TEMPLATES[selectedTemplate]?.component || PORTFOLIO_TEMPLATES.BRUTALIST.component, { data: displayResult })
                  ) : null}
                </div>
                
                {!isGenerating && displayResult && (
                  <RegenerateBlock 
                    isGenerating={isGenerating} 
                    currentModelId={modelId} 
                    onRegenerate={(newModelId) => {
                      setModelId(newModelId);
                      setHistoryResult(null);
                      const targetResumeId = historyResult?.inputSummary?.resumeId || selectedResume;
                      startJob('/career/portfolio', { resumeId: targetResumeId, modelId: newModelId });
                    }} 
                  />
                )}
              </div>
            </div>
          )}
        </div>
      {/* Full Screen Overlay using Portal */}
      {isFullScreen && displayResult && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-9999 bg-white overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="sticky top-6 right-6 flex justify-end z-10000 px-6 pointer-events-none">
            <Button variant="brutal" className="bg-brutal-yellow pointer-events-auto shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] transition-all" onClick={() => setIsFullScreen(false)}>
              <X className="w-5 h-5 mr-2" /> Exit Full Screen (Esc)
            </Button>
          </div>
          <div className="w-full min-h-screen -mt-16">
            {React.createElement(PORTFOLIO_TEMPLATES[selectedTemplate]?.component || PORTFOLIO_TEMPLATES.BRUTALIST.component, { data: displayResult })}
          </div>
        </div>,
        document.body
      )}

      {/* DEPLOYMENT MODAL */}
      {showDeployModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-99999 p-4 animate-in fade-in">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-lg w-full p-8 relative animate-in zoom-in-95 duration-200">
            <button className="absolute top-4 right-4 text-black hover:text-red-600 transition-colors" onClick={() => setShowDeployModal(false)}>
              <X className="w-6 h-6" />
            </button>
            
            {/* Header */}
            {deployStep === 0 && (
              <div className="mb-6">
                <h3 className="text-2xl font-black uppercase flex items-center gap-2">
                  <Globe className="w-6 h-6 text-brutal-blue" /> GitHub Pages Deploy
                </h3>
                <p className="text-xs font-bold text-gray-500 mt-1">Host your custom portfolio on GitHub Pages in 5 easy steps.</p>
              </div>
            )}

            {/* Stepper Tracker */}
            {deployStep === 0 && (
              <div className="flex justify-between items-center mb-6 border-b-4 border-brutal-black pb-4 overflow-x-auto gap-4 scrollbar-none">
                {[
                  { title: "Get Code" },
                  { title: "Create Repo" },
                  { title: "Upload" },
                  { title: "Pages Setup" },
                  { title: "Go Live" }
                ].map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 shrink-0">
                    <div className={`w-7 h-7 rounded-none border-2 border-brutal-black flex items-center justify-center font-black text-xs transition-colors ${
                      wizardStep === idx ? 'bg-brutal-yellow' : wizardStep > idx ? 'bg-[#c3e88d]' : 'bg-gray-100'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-black uppercase hidden sm:inline ${wizardStep === idx ? 'text-black font-extrabold' : 'text-gray-400'}`}>
                      {s.title}
                    </span>
                    {idx < 4 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 hidden sm:block ml-0.5" />}
                  </div>
                ))}
              </div>
            )}

            {/* Wizard Steps */}
            {deployStep === 0 && (
              <div className="min-h-[220px] flex flex-col justify-between">
                <div>
                  {wizardStep === 0 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black uppercase flex items-center gap-2">
                        <Download className="w-5 h-5 text-brutal-pink" /> Step 1: Download Website Code
                      </h4>
                      <p className="font-bold text-gray-600 text-sm leading-snug">
                        Download your fully compiled, responsive portfolio HTML file configured with the **{PORTFOLIO_TEMPLATES[selectedTemplate]?.name}** layout.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button variant="brutal" className="flex-1 bg-brutal-yellow py-3 text-xs" onClick={downloadHtmlFile}>
                          <Download className="w-4 h-4 mr-2" /> Download index.html
                        </Button>
                        <Button variant="outline" className="flex-1 border-2 border-brutal-black font-black py-3 text-xs bg-white" onClick={copyHtmlToClipboard}>
                          {htmlCopied ? <Check className="w-4 h-4 mr-2 text-green-600" /> : <Copy className="w-4 h-4 mr-2" />}
                          {htmlCopied ? "Copied!" : "Copy Code"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {wizardStep === 1 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black uppercase flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-brutal-blue" /> Step 2: Create a GitHub Repository
                      </h4>
                      <p className="font-bold text-gray-600 text-sm leading-snug">
                        Go to <a href="https://github.com/new" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-black">github.com/new</a> and create a public repository.
                      </p>
                      <div className="bg-brutal-bg p-3 border-2 border-brutal-black space-y-2 text-xs font-bold text-gray-700">
                        <p>
                          <span className="font-black text-brutal-blue">A.</span> Name it <code className="bg-white border px-1 font-mono">username.github.io</code> (matching your username) to publish to your root URL.
                        </p>
                        <p>
                          <span className="font-black text-brutal-blue">B.</span> Set visibility to <strong className="uppercase">Public</strong> so GitHub Pages can host it.
                        </p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 2 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black uppercase flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-brutal-pink" /> Step 3: Add index.html to Repository
                      </h4>
                      <p className="font-bold text-gray-600 text-sm leading-snug">
                        Upload the <code className="bg-gray-100 border px-1 font-mono">index.html</code> file you downloaded into the root directory of your repository.
                      </p>
                      <div className="bg-brutal-bg p-3 border-2 border-brutal-black text-xs font-bold text-gray-700 space-y-1.5">
                        <p>Click <strong>&quot;uploading an existing file&quot;</strong> on GitHub, drag &amp; drop your downloaded file, and click <strong>&quot;Commit changes&quot;</strong>.</p>
                        <p className="text-[10px] text-gray-500 italic">
                          Or run: <code className="bg-[#1e1e1e] text-[#c3e88d] px-1.5 py-0.5 rounded font-mono">git commit -m &quot;Add portfolio&quot; && git push</code>
                        </p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 3 && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-black uppercase flex items-center gap-2">
                        <Globe className="w-5 h-5 text-brutal-blue" /> Step 4: Enable GitHub Pages Settings
                      </h4>
                      <p className="font-bold text-gray-600 text-sm leading-snug">
                        Tell GitHub to serve your repository statically on the web.
                      </p>
                      <div className="bg-brutal-bg p-3 border-2 border-brutal-black text-xs font-bold text-gray-700 space-y-1.5">
                        <p>1. Open your repository&apos;s <strong>Settings</strong> tab.</p>
                        <p>2. Select <strong>Pages</strong> in the left sidebar menu.</p>
                        <p>3. Select Build Source: <strong>Deploy from a branch</strong>.</p>
                        <p>4. Set branch: <strong>main</strong> / directory: <strong>/ (root)</strong> and click <strong>Save</strong>.</p>
                      </div>
                    </div>
                  )}

                  {wizardStep === 4 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-black uppercase flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-brutal-yellow animate-pulse" /> Step 5: Run Simulator & Live Link
                      </h4>
                      <p className="font-bold text-gray-600 text-xs leading-snug mb-2">
                        Enter details below to run our pipeline simulator. We&apos;ll verify your production links and generate a shareable QR Code.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-black text-[10px] uppercase mb-1">GitHub Username</label>
                          <input 
                            type="text" 
                            className="w-full border-2 border-brutal-black p-2 font-bold uppercase focus:bg-brutal-yellow/20 outline-none text-xs" 
                            placeholder="e.g. torvalds"
                            value={githubUser}
                            onChange={e => setGithubUser(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block font-black text-[10px] uppercase mb-1">Repo Name</label>
                          <input 
                            type="text" 
                            className="w-full border-2 border-brutal-black p-2 font-bold uppercase focus:bg-brutal-yellow/20 outline-none text-xs" 
                            placeholder="e.g. portfolio"
                            value={repoName}
                            onChange={e => setRepoName(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button variant="brutal" className="w-full bg-brutal-yellow text-black py-3 mt-3 text-sm" onClick={startDeployment}>
                        Simulate Pages Build & Go Live
                      </Button>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t-2 border-brutal-black">
                  <Button 
                    variant="outline" 
                    className="border-2 border-brutal-black font-bold text-xs h-8 px-3 rounded-none" 
                    onClick={() => setWizardStep(prev => Math.max(0, prev - 1))}
                    disabled={wizardStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <span className="text-xs font-black uppercase text-gray-500">Step {wizardStep + 1} of 5</span>
                  {wizardStep < 4 ? (
                    <Button 
                      variant="outline" 
                      className="border-2 border-brutal-black font-bold text-xs h-8 px-3 bg-white hover:bg-brutal-yellow rounded-none" 
                      onClick={() => setWizardStep(prev => Math.min(4, prev + 1))}
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <div className="w-[68px]" />
                  )}
                </div>
              </div>
            )}

            {deployStep > 0 && deployStep < 4 && (
              <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center">
                <div className="w-16 h-16 border-4 border-brutal-black border-t-brutal-pink animate-spin" />
                <div>
                  <h4 className="text-2xl font-black uppercase">
                    {deployStep === 1 && "Connecting API..."}
                    {deployStep === 2 && "Compiling HTML assets..."}
                    {deployStep === 3 && "Deploying static site..."}
                  </h4>
                  <p className="font-bold text-gray-500 mt-2">
                    {deployStep === 1 && "Authenticating secure pipeline connection to GitHub Pages..."}
                    {deployStep === 2 && `Writing customized index.html configured with the ${PORTFOLIO_TEMPLATES[selectedTemplate]?.name} layout...`}
                    {deployStep === 3 && `Uploading files and enabling live tracking on github.com/${githubUser}/${repoName}...`}
                  </p>
                </div>
              </div>
            )}

            {deployStep === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-4 border-brutal-black pb-4">
                  <CheckCircle className="w-12 h-12 text-green-600 shrink-0" />
                  <div>
                    <h4 className="text-3xl font-black uppercase text-green-600 leading-tight">Deployment Live!</h4>
                    <p className="font-bold text-gray-500">Your custom website has been pushed successfully.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase bg-brutal-yellow border-2 border-brutal-black px-2 py-0.5 shadow-[1px_1px_0_#000]">Production Link</span>
                    <a 
                      href={`https://${githubUser}.github.io/${repoName}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex font-black text-lg text-blue-600 underline break-all items-center gap-1 hover:text-blue-800"
                    >
                      {githubUser}.github.io/{repoName} <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                    
                    <div className="bg-brutal-bg p-4 border-2 border-brutal-black text-sm font-bold text-gray-700">
                      You can also copy the generated <code>index.html</code> code and host it manually on any other cloud server.
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center bg-white p-4 border-4 border-brutal-black shadow-[4px_4px_0_#000] shrink-0">
                    <Image 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://${githubUser}.github.io/${repoName}`} 
                      alt="Portfolio QR Code"
                      width={144} height={144} unoptimized
                      className="w-36 h-36 border-2 border-brutal-black"
                    />
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 mt-2 flex items-center gap-1"><QrCode className="w-3 h-3" /> Scan to share</span>
                  </div>
                </div>

                <Button variant="brutal" className="w-full bg-white text-black py-3 mt-6 border-2 border-brutal-black" onClick={() => setShowDeployModal(false)}>
                  Close Suite
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </ToolPageLayout>
  );
}
