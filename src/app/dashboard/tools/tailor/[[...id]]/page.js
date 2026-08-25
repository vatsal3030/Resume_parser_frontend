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
import { ResultActions } from '@/components/ui/ResultActions';
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
    resetJob,
    jobId
  } = useAsyncJob();

  useEffect(() => {
    if (!selectedResume && resumes?.length > 0) {
      setSelectedResume(resumes[0].id);
    }
  }, [resumes, selectedResume]);

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
      activeResult={activeResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >

      {/* INPUTS — Full-width compact bar */}
      <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">1. Select Resume</label>
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

            <div className="md:col-span-1 lg:col-span-1">
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">2. Job Description</label>
              <textarea 
                className="w-full border-2 border-brutal-black p-2.5 font-medium min-h-[80px] text-sm resize-y"
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={e => setJobDescription(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} compact />
            </div>

            <div>
              <Button 
                variant="brutal" 
                className="w-full text-base py-3 bg-brutal-blue text-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleTailor}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-4 h-4" /> Analyzing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Tailor Resume
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
                  resultId={activeResult?.id || activeResult?.aiJobId || jobId}
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
     </ToolPageLayout>
   );
 }
