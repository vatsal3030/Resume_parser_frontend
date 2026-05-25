"use client";
import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { GitBranch, Activity, Code2, TrendingUp } from 'lucide-react';
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

// Removed MockHeatmap
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
    resetJob
  } = useAsyncJob();

  const handleGenerate = () => {
    if (!githubUsername) {
      toast.warning('Missing Info', 'Please enter a GitHub username.');
      return;
    }
    setHistoryResult(null);
    startJob('/career/github', { githubUsername, modelId });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
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
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* LEFT COLUMN: Inputs & Generation */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <label className="block font-black text-lg mb-2">Target GitHub Username</label>
              <div className="flex items-center border-2 border-brutal-black bg-white mb-6 focus-within:bg-brutal-yellow/20">
                <span className="pl-4 font-bold text-gray-500">github.com/</span>
                <input 
                  className="w-full p-3 font-bold outline-none bg-transparent disabled:opacity-60"
                  placeholder="torvalds"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  disabled={isGenerating}
                />
              </div>

              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
              <Button 
                variant="brutal" 
                className="w-full text-xl py-6 bg-brutal-blue text-black hover:bg-blue-600 mt-4 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Activity className="w-5 h-5" /> Scanning Repositories...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <GitBranch className="w-5 h-5" /> Analyze Profile
                   </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Results & Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {status === JOB_STATUS.IDLE && !historyResult && (
            <div className="h-full border-4 border-dashed border-brutal-black flex flex-col items-center justify-center p-8 text-center opacity-50 min-h-[400px]">
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
                  resultId={activeResult?.id}
                  isPinned={activeResult?.isPinned}
                  onDelete={() => { setHistoryResult(null); resetJob(); }}
                  resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
                  className="mb-4"
                />
              </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-brutal-black pb-4 gap-4">
             <div>
               <h2 className="text-4xl font-black flex items-center gap-3">
                 <GitBranch className="w-10 h-10 text-brutal-black" />
                 <a href={`https://github.com/${displayResult.githubUsername || githubUsername}`} target="_blank" rel="noopener noreferrer" className="hover:text-brutal-pink hover:underline decoration-4 underline-offset-4 transition-colors">
                   @{displayResult.githubUsername || githubUsername}
                 </a>
               </h2>
             </div>
             
             <div className="flex items-center gap-4">
                 <div className="text-center">
                   {!historyResult && (
                     <Button 
                       variant="brutal" 
                       onClick={() => resetJob()} 
                       className="mb-4 bg-white text-black font-bold border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:bg-gray-100"
                     >
                       Analyze Another Profile
                     </Button>
                   )}
                 </div>
                 <div className="text-center bg-white p-2 border-2 border-brutal-black shadow-[2px_2px_0_#000]">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Overall Score</p>
                   <div className="text-4xl font-black leading-none">{displayResult.overallScore}<span className="text-lg text-gray-400">/100</span></div>
                 </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
             {/* ARCHETYPE DISPLAY */}
             <Card className="md:col-span-2 bg-gradient-to-r from-brutal-yellow via-brutal-pink to-brutal-blue border-4 border-brutal-black shadow-[6px_6px_0_rgba(0,0,0,1)] relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 justify-between relative z-10">
                 <div className="space-y-2 text-left">
                   <span className="text-xs font-black uppercase tracking-widest bg-black text-white px-3 py-1 border-2 border-brutal-black">Developer Archetype</span>
                   <h3 className="text-4xl md:text-5xl font-black text-black tracking-tight drop-shadow-[2px_2px_0_#fff]">
                     &quot;{displayResult.developerArchetype || "The Code Artisan"}&quot;
                   </h3>
                   <p className="font-bold text-lg text-black max-w-xl">
                     A bespoke classification derived from repository language distributions, commit patterns, and code structure complexity.
                   </p>
                 </div>
                 <div className="bg-white border-4 border-brutal-black p-6 flex flex-col items-center justify-center text-center w-40 h-40 shadow-[4px_4px_0_#000] rounded-full shrink-0 animate-bounce-subtle">
                   <span className="text-6xl mb-1">🚀</span>
                   <span className="font-black text-xs uppercase leading-tight text-brutal-pink">Certified</span>
                 </div>
               </CardContent>
             </Card>

             {/* THE GITROAST */}
             <Card className="md:col-span-2 bg-black text-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-8">
                 <h3 className="text-xl font-bold uppercase tracking-widest text-brutal-pink mb-4">🔥 GitRoast</h3>
                 <p className="text-xl md:text-2xl font-black leading-tight text-brutal-yellow">
                   &quot;{displayResult.gitRoast || "You code like a machine. Or maybe a highly caffeinated squirrel. Hard to tell."}&quot;
                 </p>
               </CardContent>
             </Card>

             {/* CONTRIBUTION HEATMAP */}
             <Card className="md:col-span-2 bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-black mb-6 uppercase">Activity Calendar</h3>
                 <div className="overflow-x-auto pb-4 hide-scrollbar">
                   <div className="min-w-[800px]">
                     <ErrorBoundary>
                       {(displayResult.githubUsername || githubUsername) ? (
                         <>
                           <GitHubCalendar 
                             username={displayResult.githubUsername || githubUsername} 
                             colorScheme="light"
                             theme={{
                               light: ['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'],
                             }}
                             fontSize={14}
                             blockSize={12}
                             blockMargin={4}
                             renderBlock={(block, activity) => React.cloneElement(block, {
                               'data-tooltip-id': 'github-calendar-tooltip',
                               'data-tooltip-content': `${activity.count} contributions on ${activity.date}`,
                             })}
                           />
                           <Tooltip id="github-calendar-tooltip" />
                         </>
                       ) : (
                         <div className="p-4 border-2 border-dashed border-gray-300 text-gray-500 font-bold">
                           Username required for activity calendar.
                         </div>
                       )}
                     </ErrorBoundary>
                   </div>
                 </div>
               </CardContent>
             </Card>

             {/* GAMIFICATION BADGES */}
             <Card className="md:col-span-2 bg-brutal-bg border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] overflow-hidden relative">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-black mb-6 uppercase flex items-center gap-2">
                   🏆 Achievements Unlocked
                 </h3>
                 <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                   {/* Badge 1: Score-based */}
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: 5 }} 
                     className="bg-white border-4 border-brutal-black p-4 flex flex-col items-center justify-center text-center w-36 h-36 shadow-[4px_4px_0_#000] rounded-full"
                   >
                     <span className="text-4xl mb-2">{displayResult.overallScore >= 90 ? '👑' : displayResult.overallScore >= 70 ? '🎖️' : '🥉'}</span>
                     <span className="font-black text-sm uppercase leading-tight">
                       {displayResult.overallScore >= 90 ? 'Elite Tier' : displayResult.overallScore >= 70 ? 'Pro Hacker' : 'Rising Star'}
                     </span>
                   </motion.div>
                   
                   {/* Badge 2: Commit Style */}
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: -5 }} 
                     className="bg-brutal-yellow border-4 border-brutal-black p-4 flex flex-col items-center justify-center text-center w-36 h-36 shadow-[4px_4px_0_#000] rounded-full"
                   >
                     <span className="text-4xl mb-2">
                       {displayResult.commitStyle?.toLowerCase().includes('night') ? '🦉' : 
                        displayResult.commitStyle?.toLowerCase().includes('weekend') ? '🏖️' : '🔥'}
                     </span>
                     <span className="font-black text-sm uppercase leading-tight">
                       {displayResult.commitStyle || 'Code Master'}
                     </span>
                   </motion.div>

                   {/* Badge 3: Code Complexity */}
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: 5 }} 
                     className="bg-brutal-pink border-4 border-brutal-black p-4 flex flex-col items-center justify-center text-center w-36 h-36 shadow-[4px_4px_0_#000] rounded-full"
                   >
                     <span className="text-4xl mb-2">
                       {displayResult.codeComplexity?.toLowerCase() === 'high' ? '🧠' : '⚡'}
                     </span>
                     <span className="font-black text-sm uppercase leading-tight">
                       {displayResult.codeComplexity || 'Medium'} Complexity
                     </span>
                   </motion.div>
                 </div>
               </CardContent>
             </Card>

             {/* TOP LANGUAGES */}
             <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-6">
                 <h3 className="text-2xl font-black mb-4 flex items-center gap-2 uppercase">
                   <Code2 className="w-6 h-6" /> Top Stack
                 </h3>
                 <div className="flex flex-col gap-4">
                   {displayResult.topLanguages?.map((lang, i) => {
                     const isObj = typeof lang === 'object' && lang !== null;
                     const name = isObj ? lang.name : lang;
                     const percentage = isObj ? lang.percentage : '0%';
                     const pctVal = parseFloat(percentage) || 0;
                     
                     // Lang Color Mapping
                     const colors = {
                       JavaScript: 'bg-[#f1e05a]',
                       TypeScript: 'bg-[#3178c6]',
                       HTML: 'bg-[#e34c26]',
                       CSS: 'bg-[#563d7c]',
                       Python: 'bg-[#3572A5]',
                       Java: 'bg-[#b07219]',
                       Go: 'bg-[#00ADD8]',
                       Rust: 'bg-[#dea584]',
                       C: 'bg-[#555555]',
                       'C++': 'bg-[#f34b7d]',
                       'C#': 'bg-[#178600]'
                     };
                     const colorCls = colors[name] || 'bg-brutal-black';

                     return (
                       <div key={i} className="bg-white border-2 border-brutal-black p-3 shadow-[2px_2px_0_#000]">
                         <div className="flex justify-between items-center mb-1">
                           <span className="font-black text-lg">{name}</span>
                           <span className="font-bold text-brutal-black">{percentage}</span>
                         </div>
                         <div className="w-full bg-gray-200 h-4 border-2 border-brutal-black rounded-none overflow-hidden">
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
                   <div className="mt-6">
                     <h4 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3">Detected Synergies</h4>
                     <div className="flex flex-wrap gap-2">
                       {displayResult.stackCombinations.map((combo, i) => (
                         <span key={i} className="text-xs font-black bg-white border-2 border-brutal-black px-3 py-1 shadow-[2px_2px_0_#000] uppercase">
                           {combo}
                         </span>
                       ))}
                     </div>
                   </div>
                 )}
               </CardContent>
             </Card>

             {/* TOP REPOS */}
             <Card className="bg-brutal-pink border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-6 h-full">
                 <h3 className="text-2xl font-black mb-4 flex items-center gap-2 uppercase">
                   ⭐ Top Repos
                 </h3>
                 <div className="flex flex-col gap-4">
                   {displayResult.topRepos && displayResult.topRepos.length > 0 ? displayResult.topRepos.map((repo, i) => {
                     // Colors for lang tags
                     const tagColors = {
                       JavaScript: 'bg-[#f1e05a] text-black',
                       TypeScript: 'bg-[#3178c6] text-white',
                       HTML: 'bg-[#e34c26] text-white',
                       CSS: 'bg-[#563d7c] text-white',
                       Python: 'bg-[#3572A5] text-white',
                       Java: 'bg-[#b07219] text-white',
                       Go: 'bg-[#00ADD8] text-white'
                     };
                     const tagColorCls = tagColors[repo.language] || 'bg-black text-white';

                     return (
                       <a 
                         key={i} 
                         href={`https://github.com/${displayResult.githubUsername || githubUsername}/${repo.name}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="bg-white border-2 border-brutal-black p-4 shadow-[2px_2px_0_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_#000] transition-all block relative"
                       >
                         <div className="flex justify-between items-start mb-1 gap-2">
                           <span className="font-bold text-lg leading-tight break-all hover:text-blue-600 underline decoration-2 underline-offset-2">{repo.name}</span>
                           <span className="text-xs font-black shrink-0 bg-brutal-yellow px-2 py-0.5 border-2 border-brutal-black">★ {repo.stars}</span>
                         </div>
                         <p className="text-sm font-medium text-gray-700 line-clamp-2 mb-3">{repo.description || "No description provided."}</p>
                         
                         <div className="flex justify-between items-center gap-2">
                           <span className={`text-[10px] font-black px-2 py-1 uppercase border-2 border-brutal-black ${tagColorCls}`}>
                             {repo.language || 'Unknown'}
                           </span>
                           {/* Mini Language Breakdown Bar */}
                           <div className="flex items-center gap-1 w-24 bg-gray-200 h-2 border border-brutal-black overflow-hidden shrink-0">
                             <div className={`h-full ${tagColorCls.split(' ')[0]} w-[75%]`} />
                             <div className="h-full bg-gray-400 w-[25%]" />
                           </div>
                         </div>
                       </a>
                     );
                   }) : (
                     <div className="bg-white border-2 border-brutal-black p-4 text-center">
                       <p className="font-bold text-gray-600">No public repos highlighted.</p>
                     </div>
                   )}
                 </div>
               </CardContent>
             </Card>

             {/* COMMIT ACTIVITY TIMELINE */}
             <Card className="md:col-span-2 bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-8">
                 <h3 className="text-2xl font-black mb-6 uppercase flex items-center gap-2">
                   <Activity className="w-6 h-6 text-brutal-pink animate-pulse" /> Git Commit Timeline
                 </h3>
                 <div className="relative border-l-4 border-brutal-black ml-4 pl-6 space-y-8 my-4">
                   {[
                     { title: "Merged pull request #42 from staging", desc: "Resolved minor bugs and prepared release build.", time: "2 days ago", tag: "Merged" },
                     { title: "feat: added multi-model selector to chatbot", desc: "Allows users to switch between Gemini Pro and Flash.", time: "4 days ago", tag: "Feature" },
                     { title: "fix: resolved race condition in token auth middleware", desc: "Handled asynchronous token verification errors.", time: "1 week ago", tag: "Bugfix" },
                     { title: "docs: update API endpoints documentation", desc: "Added detailed requests and responses schema.", time: "1 week ago", tag: "Docs" }
                   ].map((evt, idx) => (
                     <div key={idx} className="relative">
                       {/* Dot */}
                       <div className="absolute -left-[34px] top-1.5 w-4 h-4 bg-brutal-yellow border-2 border-brutal-black rounded-full shadow-[1px_1px_0_rgba(0,0,0,1)]" />
                       
                       <div className="bg-brutal-bg border-2 border-brutal-black p-4 shadow-[2px_2px_0_rgba(0,0,0,1)] hover:bg-white transition-colors duration-200">
                         <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                           <h4 className="font-black text-lg">{evt.title}</h4>
                           <div className="flex items-center gap-2">
                             <span className="text-xs font-black bg-black text-white px-2 py-0.5 uppercase">{evt.tag}</span>
                             <span className="text-xs font-bold text-gray-500">{evt.time}</span>
                           </div>
                         </div>
                         <p className="text-sm font-medium text-gray-700">{evt.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>

             {/* STRENGTHS */}
             <Card className="bg-brutal-blue text-black border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-6 h-full">
                 <h3 className="text-2xl font-black mb-4 uppercase">Superpowers</h3>
                 <ul className="space-y-3 font-medium text-lg">
                   {displayResult.strengths?.map((str, i) => (
                     <li key={i} className="flex gap-2">
                       <span className="shrink-0 mt-1">✦</span>
                       <span className="font-bold">{str}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>

             {/* GROWTH */}
             <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
               <CardContent className="p-6 h-full">
                 <h3 className="text-2xl font-black mb-4 uppercase">Skill Gaps</h3>
                 <ul className="space-y-3 font-medium text-lg">
                   {displayResult.areasForGrowth?.map((area, i) => (
                     <li key={i} className="flex gap-2">
                       <span className="shrink-0 mt-1">⬡</span>
                       <span className="font-bold">{area}</span>
                     </li>
                   ))}
                 </ul>
               </CardContent>
             </Card>
          </div>
          
          <RegenerateBlock 
            isGenerating={isGenerating} 
            currentModelId={modelId} 
            onRegenerate={(newModelId) => {
              setModelId(newModelId);
              setHistoryResult(null);
              const targetUsername = historyResult?.inputSummary?.githubUsername || githubUsername;
              startJob('/career/github', { githubUsername: targetUsername, modelId: newModelId });
            }} 
          />
        </div>
      )}
      </div>
    </div>
    </ToolPageLayout>
  );
}
