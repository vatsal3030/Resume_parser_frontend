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
 resetJob,
 jobId
 } = useAsyncJob();

 useEffect(() => {
 if (!selectedResume && resumes?.length > 0) {
 setSelectedResume(resumes[0].id);
 }
 }, [resumes, selectedResume]);

 const handleGenerate = () => {
 if (!selectedResume || !jobDescription) {
 toast.warning('Missing Info', 'Please select a resume and paste a job description.');
 return;
 }
 setHistoryResult(null); // Clear any loaded history item
 startJob('/career/cover-letter', { resumeId: selectedResume, jobDescription, companyName, modelId });
 };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    const inputs = item.outputPayload?._meta?.inputs || item.inputSummary || {};
    if (inputs.resumeId) setSelectedResume(inputs.resumeId);
    if (inputs.jobDescription) setJobDescription(inputs.jobDescription);
    if (inputs.company || inputs.companyName) setCompanyName(inputs.company || inputs.companyName);
    if (item.modelUsed || item.outputPayload?._meta?.model) setModelId(item.modelUsed || item.outputPayload?._meta?.model);
  };

  // Use history result if loaded, otherwise use live result with jobId
  const activeResult = historyResult || (status === JOB_STATUS.COMPLETED ? { id: jobId, aiJobId: jobId, outputPayload: typeof result === 'object' ? result : { text: result }, inputSummary: { resumeId: selectedResume, jobDescription, company: companyName }, modelUsed: modelId, createdAt: new Date().toISOString() } : null);
  const resultText = typeof activeResult === 'object' && activeResult?.text 
    ? activeResult.text 
    : typeof activeResult === 'object' && activeResult?.outputPayload?.text
    ? activeResult.outputPayload.text
    : typeof activeResult === 'object' && activeResult?.outputPayload
    ? (typeof activeResult.outputPayload === 'string' ? activeResult.outputPayload : JSON.stringify(activeResult.outputPayload, null, 2))
    : (typeof activeResult === 'string' ? activeResult : '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    toast.success('Copied!', 'Cover letter copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
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
 toolType="COVER_LETTER"
 fullWidth={true}
 onHistorySelect={handleHistorySelect}
 historyResult={historyResult}
 activeResult={activeResult}
 onClearHistory={() => setHistoryResult(null)}
 onJobIdFound={monitorJob}
 >
 {/* INPUTS — Full-width compact bar */}
 <Card className="border border-(--hairline) shadow-sm bg-(--surface-card) rounded-2xl mb-6">
 <CardContent className="p-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
 <div>
 <label className="block font-semibold text-sm mb-1.5">1. Select Resume</label>
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
              <label className="block text-xs font-medium text-(--muted) mb-1.5">2. Company (Optional)</label>
              <input 
                className="w-full rounded-xl border border-(--hairline) bg-(--surface-card) p-2.5 text-xs text-(--ink) focus:border-(--primary) outline-none shadow-xs transition-colors"
                placeholder="e.g. Google, Stripe"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-(--muted) mb-1.5">3. Job Description</label>
              <textarea 
                className="w-full rounded-xl border border-(--hairline) bg-(--surface-card) p-2.5 text-xs text-(--ink) min-h-20 resize-y focus:border-(--primary) outline-none shadow-xs transition-colors"
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
                variant="default" 
                className="w-full py-2.5 text-xs"
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
          <div className="rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card) flex items-center justify-center p-12 text-center">
            <p className="text-xs font-medium text-(--muted)">Select a resume and provide job details above to generate a tailored cover letter.</p>
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
 <Card className="border border-(--hairline) shadow-sm bg-(--surface-card) rounded-2xl flex flex-col relative overflow-hidden">
 <CardContent className="p-0 flex flex-col">
 <div className="bg-(--surface-soft)/50 border-b border-(--hairline-soft) p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
 <h2 className="text-xl font-serif text-(--ink)">Your Cover Letter</h2>
 <div className="flex flex-wrap gap-2">
 <Button 
 variant="secondary" 
 className="text-xs px-3"
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
 variant="secondary" 
 className="text-xs px-3"
 onClick={() => {
 const element = document.getElementById('cover-letter-preview');
 const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Cover Letter</title></head><body>${element.innerHTML}</body></html>`;
 const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
 downloadBlob(blob, `${companyName || 'Company'}_Cover_Letter.doc`);
 }}
 >
 Word
 </Button>
 <Button variant="secondary" onClick={copyToClipboard} className="text-xs px-3">
 {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500"/> : <Copy className="w-3.5 h-3.5 mr-1"/>}
 {copied ? 'Copied' : 'Copy'}
 </Button>
 </div>
 </div>

 {/* A4 Document Preview wrapper */}
 <div className="bg-(--surface-soft)/40 p-8 flex justify-center overflow-auto min-h-[600px]">
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
