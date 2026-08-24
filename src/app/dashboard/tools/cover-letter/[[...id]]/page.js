"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
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

import { useResumes } from '@/hooks/useResumes';

export default function CoverLetterGenerator() {
  const { resumes, isLoading: resumesLoading } = useResumes();
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
  } = useAsyncJob();

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
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  // Helper utility for file downloads
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolPageLayout
      title="Cover Letter Gen"
      subtitle="Generate a highly personalized cover letter in seconds."
      subtitleColor="bg-brutal-mint"
      toolType="COVER_LETTER"
      fullWidth={true}
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      activeResult={activeResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >
      {/* INPUTS — Full-width compact bar */}
      <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">1. Select Resume</label>
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
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">2. Company (Optional)</label>
              <input 
                className="w-full border-2 border-brutal-black p-2.5 font-medium text-sm focus:bg-brutal-yellow/20 outline-none"
                placeholder="e.g. Google, Stripe"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">3. Job Description</label>
              <textarea 
                className="w-full border-2 border-brutal-black p-2.5 font-medium min-h-[80px] text-sm resize-y focus:bg-brutal-yellow/20 outline-none"
                placeholder="Paste the target job description..."
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
                className="w-full text-base py-3 bg-brutal-pink text-black hover:bg-pink-400 shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-4 h-4" /> Writing...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Generate Letter
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
                <div className="animate-fade-in space-y-6">
                  <BranchingNavigation 
                    activeResult={activeResult} 
                    toolType="COVER_LETTER" 
                    onSelect={(selected) => setHistoryResult(selected)} 
                  />
                  <div className="flex justify-end">
                    <ResultActions 
                      resultId={activeResult?.id || activeResult?.aiJobId || jobId}
                      isPinned={activeResult?.isPinned}
                      onDelete={() => { setHistoryResult(null); resetJob(); }}
                      resultText={resultText}
                      className="mb-4"
                    />
                  </div>
                  
                  {/* Output Card with Exports */}
                  <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] flex flex-col relative overflow-hidden">
                    <CardContent className="p-0 flex flex-col">
                      <div className="bg-brutal-blue border-b-4 border-black p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                         <h2 className="text-2xl font-black">Your Cover Letter</h2>
                         <div className="flex flex-wrap gap-2">
                           <Button 
                             variant="white" 
                             className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs hover:bg-brutal-mint"
                             onClick={async () => {
                               const html2pdf = (await import('html2pdf.js')).default;
                               const element = document.getElementById('cover-letter-preview');
                               html2pdf().from(element).set({
                                 margin: 15,
                                 filename: `${companyName || 'Company'}_Cover_Letter.pdf`,
                                 html2canvas: { scale: 2, useCORS: true },
                                 jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                               }).save();
                             }}
                           >
                             PDF
                           </Button>
                           <Button 
                             variant="white" 
                             className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs hover:bg-brutal-blue hover:text-white"
                             onClick={() => {
                               const element = document.getElementById('cover-letter-preview');
                               const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Cover Letter</title></head><body>${element.innerHTML}</body></html>`;
                               const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                               downloadBlob(blob, `${companyName || 'Company'}_Cover_Letter.doc`);
                             }}
                           >
                             Word
                           </Button>
                           <Button variant="white" onClick={copyToClipboard} className="border-2 border-black font-black text-xs px-3 shadow-brutal-xs">
                             {copied ? <Check className="w-4 h-4 mr-1 text-green-600"/> : <Copy className="w-4 h-4 mr-1"/>}
                             {copied ? 'Copied' : 'Copy'}
                           </Button>
                         </div>
                      </div>

                      {/* A4 Document Preview wrapper */}
                      <div className="bg-slate-100 p-8 flex justify-center overflow-auto min-h-[600px]">
                        <div 
                          id="cover-letter-preview" 
                          className="bg-white p-10 md:p-14 shadow-lg w-full max-w-[210mm] prose prose-sm sm:prose-base text-gray-800"
                          style={{
                            fontFamily: 'serif',
                            lineHeight: '1.6'
                          }}
                        >
                          <ReactMarkdown>{resultText || ''}</ReactMarkdown>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
    </ToolPageLayout>
  );
}
