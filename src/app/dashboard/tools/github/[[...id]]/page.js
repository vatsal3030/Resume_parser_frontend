"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GitBranch, Activity, Code2, TrendingUp, Copy, Download, FileText, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { SkeletonPage } from '@/components/ui/Skeleton';
import { GitHubCalendar } from 'react-github-calendar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { motion } from 'framer-motion';
import { RegenerateBlock } from '@/components/ui/RegenerateBlock';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';

export default function GitHubAnalyzer() {
  const [githubUsername, setGithubUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_github_username') || '';
    }
    return '';
  });
  
  useEffect(() => {
    if (githubUsername) {
      localStorage.setItem('last_github_username', githubUsername);
    }
  }, [githubUsername]);

  const [modelId, setModelId] = useState('default');
  const [historyResult, setHistoryResult] = useState(null);
  const [readmeContent, setReadmeContent] = useState(null);
  const [generatingReadme, setGeneratingReadme] = useState(false);
  const [showReadmePreview, setShowReadmePreview] = useState(false);
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

  const handleGenerate = () => {
    if (!githubUsername) {
      toast.warning('Missing Info', 'Please enter a GitHub username.');
      return;
    }
    setHistoryResult(null);
    setReadmeContent(null);
    startJob('/career/github', { githubUsername, modelId });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    setReadmeContent(null);
  };

  const handleGenerateReadme = async () => {
    if (!displayResult) return;
    setGeneratingReadme(true);
    try {
      const payload = {
        githubUsername: displayResult.githubUsername || githubUsername,
        analysisData: displayResult,
        modelId,
      };
      const res = await api.post('/career/github-readme', payload);
      setReadmeContent(res.data.readme);
      setShowReadmePreview(true);
      toast.success('README Generated', 'Your GitHub profile README is ready!');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to generate README';
      toast.error('README Failed', msg);
    } finally {
      setGeneratingReadme(false);
    }
  };

  const handleCopyReadme = () => {
    if (readmeContent) {
      navigator.clipboard.writeText(readmeContent);
      toast.success('Copied!', 'README.md copied to clipboard.');
    }
  };

  const handleDownloadReadme = () => {
    if (readmeContent) {
      const blob = new Blob([readmeContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'README.md';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);
  
  // Use history result if loaded, otherwise use live result
  const activeResult = historyResult || result;
  
  // Parse payload from history if needed
  const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : activeResult;

  return (
    <ToolPageLayout
      title="GitHub Analyzer"
      subtitle="AI-driven insights into your open source footprint."
      subtitleColor="bg-brutal-pink"
      toolType="GITHUB_ANALYSIS"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      activeResult={activeResult}
      onClearHistory={() => { setHistoryResult(null); setReadmeContent(null); }}
      onJobIdFound={monitorJob}
    >
      {/* INPUTS — Full-width compact bar */}
      <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">GitHub Username</label>
              <div className="flex items-center border-2 border-brutal-black bg-white focus-within:bg-brutal-yellow/20">
                <span className="pl-3 font-bold text-gray-500 text-sm">github.com/</span>
                <input 
                  className="w-full p-2.5 font-bold outline-none bg-transparent disabled:opacity-60 text-sm"
                  placeholder="torvalds"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
            </div>

            <div>
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} compact />
            </div>

            <div>
              <Button 
                variant="brutal" 
                className="w-full text-base py-3 bg-brutal-blue text-black hover:bg-blue-600 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Activity className="w-4 h-4" /> Scanning...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <GitBranch className="w-4 h-4" /> Analyze Profile
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
            <div className="border-4 border-dashed border-brutal-black flex flex-col items-center justify-center p-12 text-center opacity-50">
               <Activity className="w-12 h-12 mb-4 text-brutal-black" />
               <p className="font-bold text-xl">Enter a username to audit their code portfolio.</p>
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

          {isGenerating && (
            <div className="mt-8">
              <SkeletonPage type="github" />
            </div>
          )}

          {(status === JOB_STATUS.COMPLETED || historyResult) && displayResult && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-8 space-y-6">
              <BranchingNavigation 
                activeResult={activeResult} 
                toolType="GITHUB_ANALYSIS" 
                onSelect={(selected) => setHistoryResult(selected)} 
              />
              <div className="flex justify-end">
                <ResultActions 
                  resultId={activeResult?.id || activeResult?.aiJobId || jobId}
                  isPinned={activeResult?.isPinned}
                  onDelete={() => { setHistoryResult(null); resetJob(); }}
                  resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
                  className="mb-2"
                />
              </div>

          {/* Profile Header — Compact */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-4 border-brutal-black pb-4 gap-4">
             <div>
               <h2 className="text-3xl font-black flex items-center gap-3">
                 <GitBranch className="w-8 h-8 text-brutal-black" />
                 <a href={`https://github.com/${displayResult.githubUsername || githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-brutal-pink hover:underline decoration-4 underline-offset-4 transition-colors">
                   @{displayResult.githubUsername || githubUsername}
                 </a>
               </h2>
             </div>
             
             <div className="flex items-center gap-3">
                 {!historyResult && (
                   <Button 
                     variant="brutal" 
                     onClick={() => resetJob()} 
                     className="bg-white text-black font-bold border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:bg-gray-100 text-sm"
                   >
                     Analyze Another
                   </Button>
                 )}
                 <div className="text-center bg-white p-2 border-2 border-brutal-black shadow-[2px_2px_0_#000]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Score</p>
                   <div className="text-3xl font-black leading-none">{displayResult.overallScore}<span className="text-sm text-gray-400">/100</span></div>
                 </div>
              </div>
          </div>

          {/* ARCHETYPE — Full width */}
          <Card className="bg-gradient-to-r from-brutal-yellow via-brutal-pink to-brutal-blue border-4 border-brutal-black shadow-[6px_6px_0_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-5 justify-between relative z-10">
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1 border-2 border-brutal-black">Developer Archetype</span>
                <h3 className="text-3xl md:text-4xl font-black text-black tracking-tight drop-shadow-[2px_2px_0_#fff]">
                  &quot;{displayResult.developerArchetype || "The Code Artisan"}&quot;
                </h3>
                <p className="font-bold text-sm text-black max-w-xl">
                  A bespoke classification derived from repository language distributions, commit patterns, and code structure complexity.
                </p>
              </div>
              <div className="bg-white border-4 border-brutal-black p-4 flex flex-col items-center justify-center text-center w-28 h-28 shadow-[4px_4px_0_#000] rounded-full shrink-0 animate-bounce-subtle">
                <span className="text-4xl mb-1">🚀</span>
                <span className="font-black text-[10px] uppercase leading-tight text-brutal-pink">Certified</span>
              </div>
            </CardContent>
          </Card>

          {/* GITROAST — Full width, compact */}
          <Card className="bg-black text-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform">
            <CardContent className="p-6">
              <h3 className="text-base font-bold uppercase tracking-widest text-brutal-pink mb-2">🔥 GitRoast</h3>
              <p className="text-lg md:text-xl font-black leading-tight text-brutal-yellow">
                &quot;{displayResult.gitRoast || "You code like a machine. Or maybe a highly caffeinated squirrel. Hard to tell."}&quot;
              </p>
            </CardContent>
          </Card>

          {/* 2-COLUMN: Top Stack + Top Repos — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TOP LANGUAGES */}
              <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <CardContent className="p-5">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2 uppercase">
                    <Code2 className="w-5 h-5" /> Top Stack
                  </h3>
                  <div className="flex flex-col gap-3">
                    {displayResult.topLanguages?.map((lang, i) => {
                      const isObj = typeof lang === 'object' && lang !== null;
                      const name = isObj ? lang.name : lang;
                      const percentage = isObj ? lang.percentage : '0%';
                      const pctVal = parseFloat(percentage) || 0;
                      
                      const colors = {
                        JavaScript: 'bg-[#f1e05a]', TypeScript: 'bg-[#3178c6]',
                        HTML: 'bg-[#e34c26]', CSS: 'bg-[#563d7c]', Python: 'bg-[#3572A5]',
                        Java: 'bg-[#b07219]', Go: 'bg-[#00ADD8]', Rust: 'bg-[#dea584]',
                        C: 'bg-[#555555]', 'C++': 'bg-[#f34b7d]', 'C#': 'bg-[#178600]'
                      };
                      const colorCls = colors[name] || 'bg-brutal-black';

                      return (
                        <div key={i} className="bg-white border-2 border-brutal-black p-2.5 shadow-[2px_2px_0_#000]">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-black text-sm">{name}</span>
                            <span className="font-bold text-sm text-brutal-black">{percentage}</span>
                          </div>
                          <div className="w-full bg-gray-200 h-3 border-2 border-brutal-black rounded-none overflow-hidden">
                            <div 
                              className={`h-full ${colorCls} transition-all duration-1000`} 
                              style={{ width: `${pctVal}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Stack Combinations */}
                  {displayResult.stackCombinations && displayResult.stackCombinations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Detected Synergies</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {displayResult.stackCombinations.map((combo, i) => (
                          <span key={i} className="text-[10px] font-black bg-white border-2 border-brutal-black px-2 py-0.5 shadow-[1px_1px_0_#000] uppercase">
                            {combo}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* TOP REPOS */}
              <Card className="bg-brutal-pink border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <CardContent className="p-5 h-full">
                  <h3 className="text-xl font-black mb-3 flex items-center gap-2 uppercase">
                    ⭐ Top Repos
                  </h3>
                  <div className="flex flex-col gap-3">
                    {displayResult.topRepos && displayResult.topRepos.length > 0 ? displayResult.topRepos.map((repo, i) => {
                      const tagColors = {
                        JavaScript: 'bg-[#f1e05a] text-black', TypeScript: 'bg-[#3178c6] text-white',
                        HTML: 'bg-[#e34c26] text-white', CSS: 'bg-[#563d7c] text-white',
                        Python: 'bg-[#3572A5] text-white', Java: 'bg-[#b07219] text-white',
                        Go: 'bg-[#00ADD8] text-white'
                      };
                      const tagColorCls = tagColors[repo.language] || 'bg-black text-white';

                      return (
                        <a 
                          key={i} 
                          href={`https://github.com/${displayResult.githubUsername || githubUsername}/${repo.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white border-2 border-brutal-black p-3 shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#000] transition-all block"
                        >
                          <div className="flex justify-between items-start mb-1 gap-2">
                            <span className="font-bold text-sm leading-tight break-all hover:text-blue-600 underline decoration-1 underline-offset-2">{repo.name}</span>
                            <span className="text-[10px] font-black shrink-0 bg-brutal-yellow px-1.5 py-0.5 border border-brutal-black">★ {repo.stars}</span>
                          </div>
                          <p className="text-xs font-medium text-gray-700 line-clamp-2 mb-2">{repo.description || "No description provided."}</p>
                          <span className={`text-[10px] font-black px-1.5 py-0.5 uppercase border border-brutal-black ${tagColorCls}`}>
                            {repo.language || 'Unknown'}
                          </span>
                        </a>
                      );
                    }) : (
                      <div className="bg-white border-2 border-brutal-black p-4 text-center">
                        <p className="font-bold text-gray-600 text-sm">No public repos highlighted.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
          </div>

          {/* 2-COLUMN: Strengths + Skill Gaps — side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STRENGTHS */}
              <Card className="bg-brutal-blue text-black border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <CardContent className="p-5 h-full">
                  <h3 className="text-xl font-black mb-3 uppercase">Superpowers</h3>
                  <ul className="space-y-2 font-medium text-sm">
                    {displayResult.strengths?.map((str, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 mt-0.5">✦</span>
                        <span className="font-bold">{str}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* SKILL GAPS */}
              <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <CardContent className="p-5 h-full">
                  <h3 className="text-xl font-black mb-3 uppercase">Skill Gaps</h3>
                  <ul className="space-y-2 font-medium text-sm">
                    {displayResult.areasForGrowth?.map((area, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="shrink-0 mt-0.5">⬡</span>
                        <span className="font-bold">{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
          </div>

          {/* CONTRIBUTION HEATMAP — Full width */}
          <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <h3 className="text-xl font-black mb-4 uppercase">Activity Calendar</h3>
              <div className="overflow-x-auto pb-2 hide-scrollbar">
                <div className="min-w-[700px]">
                  <ErrorBoundary>
                    {(() => {
                      // Use analyzed username first, fallback to input only if it looks complete (min 2 chars, no spaces)
                      const calendarUsername = displayResult.githubUsername || 
                        (githubUsername && githubUsername.length >= 2 && !githubUsername.includes(' ') ? githubUsername : null);
                      
                      return calendarUsername ? (
                        <>
                          <GitHubCalendar 
                            username={calendarUsername} 
                            colorScheme="light"
                            theme={{
                              light: ['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
                            }}
                            fontSize={13}
                            blockSize={11}
                            blockMargin={3}
                            renderBlock={(block, activity) => React.cloneElement(block, {
                              'data-tooltip-id': 'github-calendar-tooltip',
                              'data-tooltip-content': `${activity.count} contributions on ${activity.date}`,
                            })}
                          />
                          <Tooltip id="github-calendar-tooltip" />
                        </>
                      ) : (
                        <div className="p-4 border-2 border-dashed border-gray-300 text-gray-500 font-bold">
                          Complete a GitHub analysis to see the activity calendar.
                        </div>
                      );
                    })()}
                  </ErrorBoundary>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GAMIFICATION BADGES — Compact */}
          <Card className="bg-brutal-bg border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-xl font-black mb-4 uppercase flex items-center gap-2">
                🏆 Achievements Unlocked
              </h3>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {/* Badge 1: Score-based */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }} 
                  className="bg-white border-4 border-brutal-black p-3 flex flex-col items-center justify-center text-center w-28 h-28 shadow-[3px_3px_0_#000] rounded-full"
                >
                  <span className="text-3xl mb-1">{displayResult.overallScore >= 90 ? '👑' : displayResult.overallScore >= 70 ? '🎖️' : '🥉'}</span>
                  <span className="font-black text-[10px] uppercase leading-tight">
                    {displayResult.overallScore >= 90 ? 'Elite Tier' : displayResult.overallScore >= 70 ? 'Pro Hacker' : 'Rising Star'}
                  </span>
                </motion.div>
                
                {/* Badge 2: Commit Style */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: -5 }} 
                  className="bg-brutal-yellow border-4 border-brutal-black p-3 flex flex-col items-center justify-center text-center w-28 h-28 shadow-[3px_3px_0_#000] rounded-full"
                >
                  <span className="text-3xl mb-1">
                    {displayResult.commitStyle?.toLowerCase().includes('night') ? '🦉' : 
                     displayResult.commitStyle?.toLowerCase().includes('weekend') ? '🏖️' : '🔥'}
                  </span>
                  <span className="font-black text-[10px] uppercase leading-tight">
                    {displayResult.commitStyle || 'Code Master'}
                  </span>
                </motion.div>

                {/* Badge 3: Code Complexity */}
                <motion.div 
                  whileHover={{ scale: 1.1, rotate: 5 }} 
                  className="bg-brutal-pink border-4 border-brutal-black p-3 flex flex-col items-center justify-center text-center w-28 h-28 shadow-[3px_3px_0_#000] rounded-full"
                >
                  <span className="text-3xl mb-1">
                    {displayResult.codeComplexity?.toLowerCase() === 'high' ? '🧠' : '⚡'}
                  </span>
                  <span className="font-black text-[10px] uppercase leading-tight">
                    {displayResult.codeComplexity || 'Medium'} Complexity
                  </span>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          {/* GENERATE README — New Feature */}
          <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-black mb-1 uppercase flex items-center gap-2">
                    <FileText className="w-5 h-5 text-brutal-mint" /> Profile README.md
                  </h3>
                  <p className="text-sm font-medium text-gray-300">
                    Generate a professional GitHub profile README from this analysis.
                  </p>
                </div>
                <Button
                  variant="brutal"
                  onClick={handleGenerateReadme}
                  disabled={generatingReadme}
                  className="bg-brutal-mint text-black font-black text-sm px-5 py-3 border-2 border-brutal-black shadow-[3px_3px_0_#000] hover:shadow-[1px_1px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 shrink-0"
                >
                  {generatingReadme ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <Activity className="w-4 h-4" /> Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Generate README
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* README PREVIEW */}
          {readmeContent && showReadmePreview && (
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between px-5 py-3 bg-brutal-bg border-b-4 border-brutal-black">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span className="font-black uppercase text-sm">README.md Preview</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="brutal"
                      onClick={handleCopyReadme}
                      className="bg-white text-black text-xs font-bold px-3 py-1.5 border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      <Copy className="w-3 h-3 mr-1" /> Copy
                    </Button>
                    <Button
                      variant="brutal"
                      onClick={handleDownloadReadme}
                      className="bg-brutal-yellow text-black text-xs font-bold px-3 py-1.5 border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                      <Download className="w-3 h-3 mr-1" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setShowReadmePreview(false)}
                      className="text-xs font-bold px-2 py-1.5 hover:bg-gray-200"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
                <div className="p-5 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 bg-gray-50 p-4 border-2 border-gray-200 overflow-x-auto">
                    {readmeContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
           
          <RegenerateBlock 
            isGenerating={isGenerating} 
            currentModelId={modelId} 
            onRegenerate={(newModelId) => {
              setModelId(newModelId);
              setHistoryResult(null);
              setReadmeContent(null);
              const targetUsername = historyResult?.inputSummary?.githubUsername || githubUsername;
              startJob('/career/github', { githubUsername: targetUsername, modelId: newModelId });
            }} 
          />
        </div>
      )}
      </div>
    </ToolPageLayout>
  );
}
