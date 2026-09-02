"use client";
import { useState, use } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { RegenerateBlock } from '@/components/ui/RegenerateBlock';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Select } from '@/components/ui/Select';
import { useResumes } from '@/hooks/useResumes';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';

export default function TailorPage({ params }) {
  const unwrappedParams = use(params);
  const initialJobId = unwrappedParams?.id?.[0] || null;

  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [modelId, setModelId] = useState('gemini-2.5-flash');
  const [historyResult, setHistoryResult] = useState(null);

  const { resumes, isLoading: resumesLoading } = useResumes();
  const {
    jobId,
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

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  const handleTailor = () => {
    if (!selectedResume || !jobDescription) return;
    setHistoryResult(null);
    startJob('/career/tailor-resume', {
      resumeId: selectedResume,
      jobDescription,
      modelId
    });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    const inputs = item.outputPayload?._meta?.inputs || item.inputSummary || {};
    if (inputs.resumeId) setSelectedResume(inputs.resumeId);
    if (inputs.jobDescription) setJobDescription(inputs.jobDescription);
    if (item.modelUsed || item.outputPayload?._meta?.model) setModelId(item.modelUsed || item.outputPayload?._meta?.model);
  };

  const activeResult = historyResult || (status === JOB_STATUS.COMPLETED ? { id: jobId, aiJobId: jobId, outputPayload: result, inputSummary: { resumeId: selectedResume, jobDescription }, modelUsed: modelId, createdAt: new Date().toISOString() } : null);
  const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : (activeResult?.outputData || activeResult);

  return (
    <ToolPageLayout
      title="AI Resume Tailor"
      subtitle="Optimize your resume for specific job descriptions and beat ATS filters."
      toolType="TAILOR"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      activeResult={activeResult}
      onClearHistory={() => { setHistoryResult(null); resetJob(); }}
      onJobIdFound={monitorJob}
    >
      <div className="max-w-5xl mx-auto space-y-6">

        {/* INPUTS — Full-width compact bar */}
        <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-(--muted) mb-1.5">1. Select Resume</label>
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
              <label className="block text-xs font-medium text-(--muted) mb-1.5">2. Job Description</label>
              <textarea 
                className="w-full rounded-xl border border-(--hairline) bg-(--surface-soft) p-2.5 text-xs text-(--ink) placeholder:text-(--muted-soft) min-h-[80px] resize-y outline-none focus:border-(--primary) transition-colors"
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
                variant="default" 
                className="w-full py-2.5"
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
        </div>

        {/* RESULTS */}
        <div className="space-y-6 mb-8">
          {status === JOB_STATUS.IDLE && !historyResult && (
            <div className="rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card) flex items-center justify-center p-12 text-center">
              <p className="text-xs text-(--muted) font-medium">Select a resume and paste a job description above to tailor.</p>
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

              <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 md:p-8 shadow-sm space-y-8">
                <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-6">
                  <div>
                    <h2 className="text-2xl font-serif text-(--ink)">Match Score</h2>
                    <p className="text-xs text-(--muted) mt-0.5">Calculated based on skill alignment & keyword density</p>
                  </div>
                  <div className="text-3xl font-serif text-(--ink) bg-(--surface-soft) px-5 py-2.5 rounded-2xl border border-(--hairline-soft)">
                    {displayResult.matchScore}%
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg text-(--ink) mb-3">Suggested Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {displayResult.suggestedKeywords?.map((kw, i) => (
                      <span key={i} className="text-xs font-medium px-3 py-1 bg-(--primary)/10 text-(--primary) border border-(--primary)/20 rounded-full">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg text-(--ink) mb-3">Tailored Summary</h3>
                  <div className="p-4 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) text-sm text-(--body) leading-relaxed">
                    {displayResult.tailoredSummary}
                  </div>
                </div>

                <div>
                  <h3 className="font-serif text-lg text-(--ink) mb-4">Rewritten Bullets</h3>
                  <div className="space-y-3">
                    {displayResult.tailoredBullets?.map((tb, i) => (
                      <div key={i} className="rounded-xl border border-(--hairline-soft) p-4 bg-(--surface-soft)/50 relative space-y-2">
                        <div className="absolute top-3 right-3 text-(--primary)">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-(--muted) line-through pr-6">{tb.original}</p>
                        <p className="text-xs font-medium text-(--ink) pr-6">{tb.suggested}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

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
