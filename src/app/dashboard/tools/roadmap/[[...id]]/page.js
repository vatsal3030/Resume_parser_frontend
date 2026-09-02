"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Map, Target, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Select } from '@/components/ui/Select';
import { RegenerateBlock } from '@/components/ui/RegenerateBlock';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';
import { useResumes } from '@/hooks/useResumes';

export default function RoadmapGenerator() {
 const { resumes, isLoading: resumesLoading } = useResumes();
 const [selectedResume, setSelectedResume] = useState('');
 const [targetRole, setTargetRole] = useState('');
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
 resetJob,
 jobId
 } = useAsyncJob();

 useEffect(() => {
 if (!selectedResume && resumes?.length > 0) {
 setSelectedResume(resumes[0].id);
 }
 }, [resumes, selectedResume]);

 const handleGenerate = () => {
 if (!selectedResume || !targetRole) {
 toast.warning('Missing Info', 'Please select a resume and enter a target role.');
 return;
 }
 setHistoryResult(null);
 startJob('/career/roadmap', { resumeId: selectedResume, targetRole, modelId });
 };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    const inputs = item.outputPayload?._meta?.inputs || item.inputSummary || {};
    if (inputs.resumeId) setSelectedResume(inputs.resumeId);
    if (inputs.targetRole) setTargetRole(inputs.targetRole);
    if (item.modelUsed || item.outputPayload?._meta?.model) setModelId(item.modelUsed || item.outputPayload?._meta?.model);
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);
  
  // Use history result if loaded, otherwise use live result with jobId
  const activeResult = historyResult || (status === JOB_STATUS.COMPLETED ? { id: jobId, aiJobId: jobId, outputPayload: result, inputSummary: { resumeId: selectedResume, targetRole }, modelUsed: modelId, createdAt: new Date().toISOString() } : null);
  
  // Parse payload from history if needed
  const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : activeResult;

 return (
 <ToolPageLayout
 title="Skill Gap & Roadmap"
 subtitle="Discover what you're missing to land your dream role."
 toolType="ROADMAP"
 onHistorySelect={handleHistorySelect}
 historyResult={historyResult}
 activeResult={activeResult}
 onClearHistory={() => setHistoryResult(null)}
 onJobIdFound={monitorJob}
 >
 {/* INPUTS — Full-width compact bar */}
 <Card className="border border-(--hairline) shadow-sm bg-(--surface-card) rounded-2xl mb-6">
 <CardContent className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
 <div>
 <label className="block font-semibold text-sm mb-1.5">1. Current Resume</label>
 <Select 
 value={selectedResume}
 onChange={setSelectedResume}
 disabled={isGenerating}
 loading={resumesLoading}
 placeholder="-- Select Resume --"
 options={resumes.map(r => ({
 value: r.id,
 label: r.title || r.originalName || 'Untitled Resume'
 }))}
 />
 </div>

 <div>
 <label className="block font-semibold text-sm mb-1.5">2. Target Dream Role</label>
 <input 
 className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) focus:border-(--primary) outline-none"
 placeholder="e.g. Machine Learning Engineer"
 value={targetRole}
 onChange={e => setTargetRole(e.target.value)}
 />
 </div>

 <div>
 <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} compact />
 </div>

 <div>
 <Button 
 variant="default" 
 className="w-full py-2.5 bg-(--primary) text-white hover:bg-(--primary-active) rounded-xl shadow-sm"
 onClick={handleGenerate}
 disabled={isGenerating}
 >
 {isGenerating ? (
 <span className="flex items-center gap-2 animate-pulse">
 <Map className="w-4 h-4" /> Analyzing...
 </span>
 ) : (
 <span className="flex items-center gap-2">
 <Map className="w-4 h-4" /> Generate Roadmap
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
 <div className="border border-dashed border-(--hairline) flex items-center justify-center p-12 text-center opacity-50">
 <p className="font-bold text-xl">Submit to see your personalized learning path.</p>
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
 toolType="ROADMAP" 
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
 <div className="flex justify-between items-center mb-8 border-b border-(--hairline) pb-4">
 <h2 className="text-3xl font-semibold flex items-center gap-3">
 <Target className="w-8 h-8 text-(--accent-amber)" />
 Target: {displayResult.targetRole || targetRole}
 </h2>
 <span className="text-xs font-medium bg-(--surface-soft) text-(--ink) px-3 py-1 rounded-full border border-(--hairline-soft)">
 Level: {displayResult.currentLevel}
 </span>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* LEFT COL: SKILL GAPS */}
 <div className="lg:col-span-1">
 <Card className="border border-(--hairline) shadow-sm bg-(--surface-card) rounded-2xl h-full">
 <CardContent className="p-6">
 <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
 <AlertTriangle className="w-6 h-6" /> Missing Skills
 </h3>
 <ul className="space-y-3">
 {displayResult.skillGaps?.map((skill, idx) => (
 <li key={idx} className="text-xs font-medium bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-3 text-(--ink) shadow-xs">
 {skill}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 </div>

 {/* RIGHT COL: ROADMAP */}
 <div className="lg:col-span-2 space-y-6">
 <h3 className="text-2xl font-semibold mb-4">Step-by-Step Plan</h3>
 {displayResult.roadmap?.map((step, idx) => (
 <Card key={idx} className="border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) rounded-2xl transition-all shadow-xs">
 <CardContent className="p-6 flex flex-col md:flex-row gap-6">
 <div className="shrink-0">
 <div className="w-12 h-12 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center font-serif text-lg">
 {step.step}
 </div>
 </div>
 <div>
 <h4 className="text-2xl font-semibold mb-2 leading-tight">{step.title}</h4>
 <p className="font-medium text-(--body) mb-4">{step.description}</p>
 
 {step.resources && step.resources.length > 0 && (
 <div className="bg-(--surface-soft) rounded-xl border border-(--hairline-soft) p-3.5">
 <p className="font-bold text-xs text-gray-500 mb-1">Recommended Resources</p>
 <ul className="list-disc pl-4 space-y-1 text-sm font-medium">
 {step.resources.map((res, i) => (
 <li key={i}>{res}</li>
 ))}
 </ul>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>

 <div className="mt-12 text-center">
 {!historyResult && (
 <Button variant="outline" onClick={() => resetJob()} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
 Generate Another Path
 </Button>
 )}
 </div>
 
 <RegenerateBlock 
 isGenerating={isGenerating} 
 currentModelId={modelId} 
 onRegenerate={(newModelId) => {
 setModelId(newModelId);
 setHistoryResult(null);
 const targetResumeId = historyResult?.inputSummary?.resumeId || selectedResume;
 const trgRole = historyResult?.inputSummary?.targetRole || targetRole;
 startJob('/career/roadmap', { resumeId: targetResumeId, targetRole: trgRole, modelId: newModelId });
 }} 
 />
 </div>
 )}
 </div>
 </ToolPageLayout>
 );
}
