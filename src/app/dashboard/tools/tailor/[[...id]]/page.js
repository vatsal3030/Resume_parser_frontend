"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, CheckCircle2 } from 'lucide-react';
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

export default function ResumeTailor() {
  const { resumes, isLoading: resumesLoading } = useResumes();
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
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

  const handleTailor = () => {
    if (!selectedResume || !jobDescription) {
      toast.warning('Missing Info', 'Please select a resume and paste a job description.');
      return;
    }
    setHistoryResult(null);
    startJob('/career/tailor-resume', { resumeId: selectedResume, jobDescription, modelId });
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
      title="AI Tailoring"
      subtitle="Target your resume to a specific job description instantly."
      subtitleColor="bg-brutal-yellow"
      toolType="TAILOR"
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
              <label className="block font-black text-lg mb-2">1. Select Baseline Resume</label>
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

              <label className="block font-black text-lg mb-2">2. Paste Job Description</label>
              <textarea 
                className="w-full border-2 border-brutal-black p-3 font-medium min-h-[200px] mb-6"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                disabled={isGenerating}
              />
            </CardContent>
          </Card>

          {/* AI ENGINE & ACTION */}
          <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-6">
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
              <Button 
                variant="brutal" 
                className="w-full text-xl py-6 bg-brutal-blue text-black mt-4 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleTailor}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-5 h-5" /> AI is Analyzing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-5 h-5" /> Tailor Resume
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
               <p className="font-bold text-xl">Submit to see tailored results here.</p>
            </div>
          )}

          <ProcessingPipeline 
            status={status}
            progress={progress}
            stage={stage}
            message={message}
            error={error}
            onRetry={handleTailor}
            onCancel={cancelJob}
          />

          {(status === JOB_STATUS.COMPLETED || historyResult) && displayResult && (
            <div className="animate-in fade-in slide-in-from-bottom-8 space-y-6">
              <BranchingNavigation 
                activeResult={activeResult} 
                toolType="TAILOR" 
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

              <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between border-b-4 border-brutal-black pb-4 mb-4">
                     <h2 className="text-2xl font-black">Match Score</h2>
                     <div className="text-4xl font-black bg-brutal-green text-white px-4 py-2 border-4 border-brutal-black shadow-[2px_2px_0_rgba(0,0,0,1)]">
                       {displayResult.matchScore}%
                     </div>
                  </div>

                  <h3 className="font-black text-xl mb-2 bg-brutal-yellow inline-block px-1">Suggested Keywords</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {displayResult.suggestedKeywords?.map((kw, i) => (
                      <span key={i} className="text-xs font-bold px-2 py-1 bg-slate-200 border-2 border-brutal-black">{kw}</span>
                    ))}
                  </div>

                  <h3 className="font-black text-xl mb-2 bg-brutal-blue text-white inline-block px-1">Tailored Summary</h3>
                  <p className="text-sm font-medium border-l-4 border-brutal-blue pl-4 py-2 mb-6 bg-slate-50">{displayResult.tailoredSummary}</p>

                  <h3 className="font-black text-xl mb-2 bg-brutal-pink inline-block px-1">Rewritten Bullets</h3>
                  <div className="space-y-4">
                     {displayResult.tailoredBullets?.map((tb, i) => (
                       <div key={i} className="border-2 border-brutal-black p-3 bg-slate-50 relative">
                          <div className="absolute top-2 right-2 text-brutal-green"><CheckCircle2 className="w-5 h-5"/></div>
                          <p className="text-xs text-red-500 line-through mb-1">{tb.original}</p>
                          <p className="text-sm font-bold text-green-700">{tb.suggested}</p>
                       </div>
                     ))}
                  </div>
                </CardContent>
              </Card>

              <RegenerateBlock 
                isGenerating={isGenerating} 
                currentModelId={modelId} 
                onRegenerate={(newModelId) => {
                  setModelId(newModelId);
                  setHistoryResult(null);
                  const targetResumeId = historyResult?.inputSummary?.resumeId || selectedResume;
                  const targetJD = historyResult?.inputSummary?.jobDescription || jobDescription;
                  startJob('/career/tailor-resume', { resumeId: targetResumeId, jobDescription: targetJD, modelId: newModelId });
                }} 
              />
            </div>
           )}
        </div>
      </div>
     </ToolPageLayout>
   );
 }
