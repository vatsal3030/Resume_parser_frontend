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
    resetJob
  } = useAsyncJob();

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
      title="Skill Gap & Roadmap"
      subtitle="Discover what you're missing to land your dream role."
      subtitleColor="bg-brutal-green text-black"
      toolType="ROADMAP"
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
              <label className="block font-black text-lg mb-2">1. Current Resume</label>
              <div className="mb-6">
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

              <label className="block font-black text-lg mb-2">2. Target Dream Role</label>
              <input 
                className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                placeholder="e.g. Machine Learning Engineer"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* AI ENGINE & ACTION */}
          <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
              <Button 
                variant="brutal" 
                className="w-full text-xl py-6 bg-brutal-yellow text-black mt-4 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Map className="w-5 h-5" /> Analyzing Career Path...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Map className="w-5 h-5" /> Generate Roadmap
                   </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Results & Pipeline */}
        <div className="lg:col-span-8 space-y-6">
          {status === JOB_STATUS.IDLE && !historyResult && (
            <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50 min-h-[400px]">
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
                  resultId={activeResult?.id}
                  isPinned={activeResult?.isPinned}
                  onDelete={() => { setHistoryResult(null); resetJob(); }}
                  resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
                  className="mb-4"
                />
              </div>
          <div className="flex justify-between items-center mb-8 border-b-4 border-brutal-black pb-4">
             <h2 className="text-3xl font-black flex items-center gap-3">
               <Target className="w-8 h-8 text-brutal-blue" />
               Target: {displayResult.targetRole || targetRole}
             </h2>
             <span className="text-xl font-bold bg-brutal-black text-white px-4 py-2 uppercase">
               Level: {displayResult.currentLevel}
             </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* LEFT COL: SKILL GAPS */}
             <div className="lg:col-span-1">
               <Card className="bg-brutal-pink border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] h-full">
                 <CardContent className="p-6">
                   <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                     <AlertTriangle className="w-6 h-6" /> Missing Skills
                   </h3>
                   <ul className="space-y-3">
                     {displayResult.skillGaps?.map((skill, idx) => (
                       <li key={idx} className="font-bold text-lg bg-white border-2 border-brutal-black p-2 shadow-sm">
                         {skill}
                       </li>
                     ))}
                   </ul>
                 </CardContent>
               </Card>
             </div>

             {/* RIGHT COL: ROADMAP */}
             <div className="lg:col-span-2 space-y-6">
               <h3 className="text-2xl font-black mb-4 uppercase">Step-by-Step Plan</h3>
               {displayResult.roadmap?.map((step, idx) => (
                 <Card key={idx} className="bg-white border-4 border-brutal-black hover:shadow-[8px_8px_0_rgba(0,0,0,1)] transition-all">
                   <CardContent className="p-6 flex flex-col md:flex-row gap-6">
                     <div className="shrink-0">
                       <div className="w-16 h-16 bg-brutal-yellow border-4 border-brutal-black flex items-center justify-center text-2xl font-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                         {step.step}
                       </div>
                     </div>
                     <div>
                       <h4 className="text-2xl font-black mb-2 leading-tight">{step.title}</h4>
                       <p className="font-medium text-gray-700 mb-4">{step.description}</p>
                       
                       {step.resources && step.resources.length > 0 && (
                         <div className="bg-slate-100 border-l-4 border-brutal-blue p-3">
                           <p className="font-bold text-xs uppercase text-gray-500 mb-1">Recommended Resources</p>
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
      </div>
    </ToolPageLayout>
  );
}
