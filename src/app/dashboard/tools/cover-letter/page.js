"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Check, Clock } from 'lucide-react';
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

export default function CoverLetterGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [copied, setCopied] = useState(false);
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
  } = useAsyncJob({
    onComplete: () => toast.success('Cover Letter Ready!', 'Your personalized cover letter has been generated.')
  });

  useEffect(() => {
    api.get('/resumes').then(res => setResumes(res.data)).catch(console.error);
  }, []);

  const handleGenerate = () => {
    if (!selectedResume || !jobDescription) {
      toast.warning('Missing Info', 'Please select a resume and paste a job description.');
      return;
    }
    setHistoryResult(null); // Clear any loaded history item
    startJob('/career/cover-letter', { resumeId: selectedResume, jobDescription, companyName, modelId });
  };

  // Use history result if loaded, otherwise use live result
  const activeResult = historyResult || result;
  const resultText = typeof activeResult === 'object' && activeResult?.text 
    ? activeResult.text 
    : typeof activeResult === 'object' && activeResult?.outputPayload?.text
    ? activeResult.outputPayload.text
    : typeof activeResult === 'object' && activeResult?.outputPayload
    ? (typeof activeResult.outputPayload === 'string' ? activeResult.outputPayload : JSON.stringify(activeResult.outputPayload, null, 2))
    : activeResult;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success('Copied!', 'Cover letter copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    toast.info('Loaded', `Loaded: ${item.title}`);
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  return (
    <ToolPageLayout
      title="Cover Letter Gen"
      subtitle="Generate a highly personalized cover letter in seconds."
      subtitleColor="bg-brutal-mint"
      toolType="COVER_LETTER"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* INPUT PANE */}
            <div className="space-y-6">
              <Card className="bg-white border-4 border-brutal-black shadow-brutal">
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

                  <label className="block font-black text-lg mb-2">2. Company Name (Optional)</label>
                  <input 
                    className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                    placeholder="e.g. Google, Stripe"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    disabled={isGenerating}
                  />

                  <label className="block font-black text-lg mb-2">3. Paste Job Description</label>
                  <textarea 
                    className="w-full border-2 border-brutal-black p-3 font-medium min-h-[200px] mb-6 focus:bg-brutal-yellow/20 outline-none"
                    placeholder="Paste the target job description here..."
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    disabled={isGenerating}
                  />

                </CardContent>
              </Card>
            </div>

            {/* RESULTS PANE */}
            <div className="space-y-6">
              {/* AI ENGINE & ACTION */}
              <Card className="bg-white border-4 border-brutal-black shadow-brutal">
                <CardContent className="p-6">
                  <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
                  <Button 
                    variant="brutal" 
                    className="w-full text-xl py-6 bg-brutal-pink text-black hover:bg-pink-400 mt-4"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                       <span className="flex items-center gap-2 animate-pulse">
                         <Sparkles className="w-5 h-5" /> AI is Writing...
                       </span>
                    ) : (
                       <span className="flex items-center gap-2">
                         <Sparkles className="w-5 h-5" /> Generate Cover Letter
                       </span>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* History loaded indicator is handled by ToolPageLayout */}

              {status === JOB_STATUS.IDLE && !historyResult && (
                <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50 min-h-[200px]">
                   <p className="font-bold text-xl">Submit to see your cover letter here.</p>
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

              {(status === JOB_STATUS.COMPLETED || historyResult) && resultText && (
                <>
                  <BranchingNavigation 
                    activeResult={activeResult} 
                    toolType="COVER_LETTER" 
                    onSelect={(selected) => setHistoryResult(selected)} 
                  />
                  <ResultActions 
                    resultId={activeResult?.id}
                    isPinned={activeResult?.isPinned}
                    onDelete={() => { setHistoryResult(null); resetJob(); }}
                    resultText={resultText}
                    className="mb-4"
                  />
                  <Card className="bg-white border-4 border-brutal-black shadow-brutal flex flex-col h-full animate-fade-in">
                  <CardContent className="p-6 grow flex flex-col">
                    <div className="flex items-center justify-between border-b-4 border-brutal-black pb-4 mb-4">
                       <h2 className="text-2xl font-black">Your Cover Letter</h2>
                       <Button variant="outline" onClick={copyToClipboard} className="border-2 border-brutal-black font-bold gap-2 shadow-brutal-sm">
                         {copied ? <Check className="w-4 h-4 text-green-600"/> : <Copy className="w-4 h-4"/>}
                         {copied ? 'Copied!' : 'Copy text'}
                       </Button>
                    </div>

                    <div className="grow">
                       <textarea 
                         readOnly 
                         className="w-full h-full min-h-[400px] font-serif text-sm p-4 border-none outline-none resize-none bg-slate-50 border-l-4 border-brutal-pink"
                         value={resultText}
                       />
                    </div>
                  </CardContent>
                </Card>
               </>
              )}

              {(status === JOB_STATUS.COMPLETED || historyResult) && resultText && (
                <RegenerateBlock 
                  isGenerating={isGenerating} 
                  currentModelId={modelId} 
                  onRegenerate={(newModelId) => {
                    setModelId(newModelId);
                    setHistoryResult(null);
                    const targetResumeId = historyResult?.inputSummary?.resumeId || selectedResume;
                    const targetJD = historyResult?.inputSummary?.jobDescription || jobDescription;
                    const targetCompany = historyResult?.inputSummary?.companyName || companyName;
                    startJob('/career/cover-letter', { 
                      resumeId: targetResumeId, 
                      jobDescription: targetJD, 
                      companyName: targetCompany, 
                      modelId: newModelId 
                    });
                  }} 
                />
              )}
            </div>
          </div>
    </ToolPageLayout>
  );
}
