"use client";
import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { 
 UploadCloud, File, AlertCircle, Sparkles, CheckCircle2, 
 XCircle, Lightbulb, FileCheck2, UserCircle, ExternalLink,
 ArrowLeft, RefreshCw, Copy, Check
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { SkeletonBlock, SkeletonCard, SkeletonLine } from '@/components/ui/SkeletonState';
import { ResultActions } from '@/components/ui/ResultActions';

// Helper utility for file downloads
function downloadBlob(blob, filename) {
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 a.href = url;
 a.download = filename;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
}

export default function NewAnalysis() {
 const [file, setFile] = useState(null);
 const [modelId, setModelId] = useState('default');
 const [historyResult, setHistoryResult] = useState(null);
 const [data, setData] = useState(null);
 const [loadingResult, setLoadingResult] = useState(false);
 const [activeTab, setActiveTab] = useState('insights');
 const toast = useToast();
 const router = useRouter();
 const searchParams = useSearchParams();
 const params = useParams();
 const rawId = params?.id;
 const outputId = Array.isArray(rawId) ? rawId[0] : (rawId || searchParams.get('outputId'));

 // 1. Fetch analysis details when outputId parameter changes in URL
 useEffect(() => {
 if (!outputId) {
 setData(null);
 return;
 }
 const fetchAnalysisData = async () => {
 setLoadingResult(true);
 try {
 // Try fetching as a history tool output first
 const historyRes = await api.get(`/history/${outputId}`);
 const historyData = historyRes.data;
 setData({
 ...historyData.outputPayload,
 id: historyData.id,
 isPinned: historyData.isPinned,
 title: historyData.title,
 originalName: historyData.inputSummary?.resumeTitle || 'Resume'
 });
 } catch (err) {
 // Fallback: try fetching as a raw resume document
 try {
 const docRes = await api.get(`/resumes/${outputId}`);
 const doc = docRes.data;
 const content = doc.content || {};
 setData({ 
 ...doc, 
 ...content, 
 id: doc.id,
 originalName: doc.title || 'Resume' 
 });
 } catch (docErr) {
 console.error("Failed to load resume/history from param:", docErr);
 setData(null);
 }
 } finally {
 setLoadingResult(false);
 }
 };
 fetchAnalysisData();
 }, [outputId]);

 const {
 status,
 progress,
 stage,
 message,
 result,
 error,
 startJob,
 cancelJob,
 resetJob,
 jobId
 } = useAsyncJob({
 onComplete: (jobResult) => {
 toast.success('Analysis Complete', 'Resume parsed successfully.');
 const documentId = jobResult?.documentId || jobResult?.id;
 if (documentId) {
 // Trigger page sync & automatic reload by routing with dynamic route
 router.push(`/dashboard/analyze/${documentId}`);
 } else {
 router.push(`/dashboard`);
 }
 }
 });

 const onDrop = useCallback(acceptedFiles => {
 if (acceptedFiles?.length > 0) {
 setFile(acceptedFiles[0]);
 }
 }, []);

 const { getRootProps, getInputProps, isDragActive } = useDropzone({
 onDrop,
 accept: {
 'application/pdf': ['.pdf']
 },
 maxFiles: 1,
 multiple: false
 });

 const handleUpload = () => {
 if (!file) {
 toast.warning('No file', 'Please select a resume PDF to upload.');
 return;
 }

 const formData = new FormData();
 formData.append('resume', file);
 formData.append('modelId', modelId);

 // Clear any loaded result states
 setData(null);
 setHistoryResult(null);

 // Call startJob with FormData. Axios will handle multipart automatically.
 startJob('/resumes/upload', formData);
 };

 const handleHistorySelect = (item) => {
 setHistoryResult(item);
 // Explicitly update dynamic route path on select
 router.push(`/dashboard/analyze/${item.id}`);
 toast.info('Loaded', `Loaded: ${item.title}`);
 };

 const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

 // 2. Compute Recharts visualizer scoring cell colors
 const getPieColor = (score) => {
 if (score >= 80) return ['#90FFD9', '#1A1A1A']; // mint, black
 if (score >= 50) return ['#FFB800', '#1A1A1A']; // yellow, black
 return ['#FF90E8', '#1A1A1A']; // pink, black
 };

 // 3. Render Skeleton States during active loading from query param
 if (loadingResult) {
 return (
 <ToolPageLayout
 title="Resume Analysis"
 subtitle="Loading your parsed resume analysis insights..."
 toolType="RESUME_ANALYSIS"
 onHistorySelect={handleHistorySelect}
 historyResult={historyResult}
 onClearHistory={() => { setData(null); setHistoryResult(null); router.push('/dashboard/analyze'); }}
 >
 <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
 {/* Blue header card skeleton — matches the real candidate profile card */}
 <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-sm">
 <CardContent className="p-8">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div className="flex-1">
 <div className="h-10 bg-(--surface-soft) rounded w-64 mb-4" />
 <div className="flex flex-wrap gap-3">
 <div className="h-7 bg-(--surface-soft) rounded w-36" />
 <div className="h-7 bg-(--surface-soft) rounded w-28" />
 <div className="h-7 bg-(--surface-soft) rounded w-20" />
 </div>
 </div>
 <div className="h-8 bg-(--surface-soft) rounded w-40" />
 </div>
 <div className="mt-8 pt-6 border-t border-(--hairline)">
 <div className="h-7 bg-(--surface-soft) rounded w-32 mb-3" />
 <div className="bg-(--surface-soft) p-4 space-y-2">
 <div className="h-4 bg-(--surface-soft) rounded w-full" />
 <div className="h-4 bg-(--surface-soft) rounded w-4/5" />
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Tab buttons skeleton */}
 <div className="flex space-x-3">
 <div className="h-9 bg-(--surface-card) border border-(--hairline) rounded-xl w-36" />
 <div className="h-9 bg-(--surface-card) border border-(--hairline) rounded-xl w-44" />
 </div>

 {/* Results grid: 4-col charts left + 8-col content right */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
 <div className="lg:col-span-4 space-y-6">
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-sm flex flex-col items-center">
 <div className="h-4 bg-(--surface-soft) rounded w-24 mx-auto mb-6" />
 <div className="w-36 h-36 bg-(--surface-soft) rounded-full border border-(--hairline-soft)" />
 </div>
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-sm flex flex-col items-center">
 <div className="h-4 bg-(--surface-soft) rounded w-20 mx-auto mb-6" />
 <div className="w-36 h-36 bg-(--surface-soft) rounded-full border border-(--hairline-soft)" />
 </div>
 </div>
 <div className="lg:col-span-8 space-y-5">
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-sm">
 <div className="h-5 bg-(--surface-soft) rounded w-28 mb-4" />
 <div className="space-y-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-(--surface-soft)">
 <div className="w-4 h-4 bg-(--surface-card) rounded-full shrink-0 mt-0.5" />
 <div className="h-3.5 bg-(--surface-card) rounded w-full" />
 </div>
 ))}
 </div>
 </div>
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 shadow-sm">
 <div className="h-5 bg-(--surface-soft) rounded w-32 mb-4" />
 <div className="space-y-3">
 {[1, 2, 3].map(i => (
 <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-(--surface-soft)">
 <div className="w-4 h-4 bg-(--surface-card) rounded-full shrink-0 mt-0.5" />
 <div className="h-3.5 bg-(--surface-card) rounded w-full" />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 </ToolPageLayout>
 );
 }

 // 4. Render main tool layout with conditional views (Upload or Results)
 return (
 <ToolPageLayout
 title="Resume Analysis"
 subtitle={data ? `Analysis results for ${data.candidateName || 'your resume'}` :"Upload your resume to extract data and power all other AI tools."}
 toolType="RESUME_ANALYSIS"
 onHistorySelect={handleHistorySelect}
 historyResult={historyResult}
 onClearHistory={() => { setData(null); setHistoryResult(null); router.push('/dashboard/analyze'); }}
 >
 <div className="max-w-7xl mx-auto space-y-8 pb-12">
 {data ? (
 // ==================== MERGED RESULTS UI ====================
 <div className="space-y-8 animate-fade-in">
 {/* Header Details Card */}
 <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-sm">
 <CardContent className="p-8">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
 <div>
 <h1 className="text-4xl font-semibold text-(--ink) mb-2">{data.candidateName || 'Candidate Profile'}</h1>
 <div className="flex flex-wrap gap-3 text-sm font-bold text-(--ink) mt-4">
 {data.email && <span className="px-2.5 py-1 rounded-lg bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted)">{data.email}</span>}
 {data.phone && <span className="px-2.5 py-1 rounded-lg bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted)">{data.phone}</span>}
 {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted) hover:bg-(--primary) transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />LinkedIn</a>}
 {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted) hover:bg-(--primary) transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />GitHub</a>}
 {(data.portfolio || data.website) && <a href={data.portfolio || data.website} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 rounded-lg bg-(--surface-soft) border border-(--hairline-soft) text-xs text-(--muted) hover:bg-(--primary) transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />Portfolio / Web</a>}
 </div>
 </div>
 <div className="flex flex-col gap-3 items-end w-full md:w-auto">
 <span className="px-3 py-1.5 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) text-xs font-medium text-(--muted) truncate max-w-xs block">
 FILE: {data.originalName}
 </span>
 <Button 
 variant="white"
 size="sm"
 onClick={() => {
 setData(null);
 setHistoryResult(null);
 router.push('/dashboard/analyze');
 }}
 className="border border-(--hairline) font-bold flex items-center gap-2"
 >
 <UploadCloud className="w-4 h-4" /> Upload New Resume
 </Button>
 </div>
 </div>
 
 {data.summary && (
 <div className="mt-8 pt-6 border-t border-(--hairline)">
 <h3 className="text-2xl font-semibold mb-3 flex items-center"><UserCircle className="w-8 h-8 mr-2" /> Summary</h3>
 <p className="font-normal text-sm bg-(--surface-soft) p-4 rounded-xl border border-(--hairline-soft) text-(--body) leading-relaxed">{data.summary}</p>
 </div>
 )}
 </CardContent>
 </Card>
        {/* Main Tabs */}
        <div className="flex space-x-3">
          <Button 
            variant={activeTab === 'insights' ? 'default' : 'secondary'} 
            className="text-sm font-medium"
            onClick={() => setActiveTab('insights')}
          >
            AI Insights & Scoring
          </Button>
          <Button 
            variant={activeTab === 'resume' ? 'default' : 'secondary'} 
            className="text-sm gap-2 font-medium"
            onClick={() => setActiveTab('resume')}
          >
            <FileCheck2 className="w-4 h-4" /> Recommended Resume
          </Button>
        </div>

        {activeTab === 'insights' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Charts Left Column */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="bg-(--surface-soft)/40 border-b border-(--hairline-soft) p-4">
                  <CardTitle className="font-serif font-medium text-center text-lg text-(--ink)">ATS Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-44 h-44 relative mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Score', value: data.atsScore || 0 },
                            { name: 'Remaining', value: 100 - (data.atsScore || 0) }
                          ]} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={55} 
                          outerRadius={75} 
                          startAngle={90} 
                          endAngle={-270} 
                          dataKey="value" 
                          stroke="transparent" 
                          strokeWidth={0}
                        >
                          {[0, 1].map((index) => (
                            <Cell key={`cell-${index}`} fill={getPieColor(data.atsScore || 0)[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif font-semibold text-(--ink)">{data.atsScore || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-(--muted) mt-6 bg-(--surface-soft) border border-(--hairline-soft) p-2.5 rounded-xl text-center w-full">
                    Likelihood of passing recruiter screening.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm overflow-hidden">
                <CardHeader className="bg-(--surface-soft)/40 border-b border-(--hairline-soft) p-4">
                  <CardTitle className="font-serif font-medium text-center text-lg text-(--ink)">Role Fit</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-44 h-44 relative mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={[
                            { name: 'Fit', value: data.jobFitScore || 0 },
                            { name: 'Remaining', value: 100 - (data.jobFitScore || 0) }
                          ]} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={55} 
                          outerRadius={75} 
                          startAngle={90} 
                          endAngle={-270} 
                          dataKey="value" 
                          stroke="transparent" 
                          strokeWidth={0}
                        >
                          {[0, 1].map((index) => (
                            <Cell key={`cell-${index}`} fill={getPieColor(data.jobFitScore || 0)[index]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-serif font-semibold text-(--ink)">{data.jobFitScore || 0}</span>
                    </div>
                  </div>
                  <p className="text-xs text-(--muted) mt-6 bg-(--surface-soft) border border-(--hairline-soft) p-2.5 rounded-xl text-center w-full">
                    Alignment with domain-relevant role standards.
                  </p>
                </CardContent>
              </Card>

              {/* Domain & Role Fit Details */}
              {(data.detectedDomain || data.suggestedRoles) && (
                <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
                  <CardContent className="p-5 space-y-4">
                    {data.detectedDomain && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-(--muted)">Domain:</span>
                        <span className="px-2.5 py-1 bg-(--surface-soft) border border-(--hairline-soft) rounded-full text-xs font-medium text-(--ink)">
                          🎯 {data.detectedDomain}
                        </span>
                      </div>
                    )}
                    {data.roleFitExplanation && (
                      <p className="text-xs text-(--muted) bg-(--surface-soft) border border-(--hairline-soft) p-3 rounded-xl leading-relaxed">
                        {data.roleFitExplanation}
                      </p>
                    )}
                    {data.suggestedRoles?.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-(--muted) mb-2">Best Fit Roles</p>
                        <div className="space-y-2">
                          {data.suggestedRoles.map((r, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 border border-(--hairline-soft) bg-(--surface-soft) rounded-xl">
                              <div className="w-12 text-center shrink-0">
                                <span className={`text-sm font-semibold ${r.matchPercentage >= 80 ? 'text-emerald-500' : r.matchPercentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                                  {r.matchPercentage}%
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-xs text-(--ink)">{r.role}</p>
                                <p className="text-[11px] text-(--muted) leading-relaxed mt-0.5 whitespace-normal wrap-break-word">{r.reasoning}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Suggestions Right Column */}
            <div className="lg:col-span-8 space-y-5">
              {data.strengths && data.strengths.length > 0 && (
                <Card className="bg-(--surface-card) border border-emerald-500/20 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-(--hairline-soft) bg-emerald-500/5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                    </h3>
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {data.strengths.length} Verified
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {data.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) text-xs leading-relaxed">
                          <span className="text-xs shrink-0 mt-0.5">🔥</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {data.weaknesses && data.weaknesses.length > 0 && (
                <Card className="bg-(--surface-card) border border-amber-500/20 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-(--hairline-soft) bg-amber-500/5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-amber-500" /> Weaknesses & Flags
                    </h3>
                    <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {data.weaknesses.length} Flags
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {data.weaknesses.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) text-xs leading-relaxed">
                          <span className="text-xs shrink-0 mt-0.5">🚩</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {data.suggestions && data.suggestions.length > 0 && (
                <Card className="bg-(--surface-card) border border-(--primary)/20 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-(--hairline-soft) bg-(--primary)/5 flex items-center justify-between">
                    <h3 className="text-sm font-medium text-(--primary) flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-(--primary)" /> Actionable Suggestions
                    </h3>
                    <span className="text-[10px] font-medium text-(--primary) bg-(--primary)/10 px-2 py-0.5 rounded-full border border-(--primary)/20">
                      {data.suggestions.length} Actions
                    </span>
                  </div>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {data.suggestions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-(--surface-soft) text-(--ink) border border-(--hairline-soft) text-xs leading-relaxed">
                          <span className="text-xs shrink-0 mt-0.5">💡</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          // Recommended Resume tab
          <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm relative overflow-hidden">
            <CardContent className="p-6">
              <div className="bg-(--surface-soft) border border-(--hairline-soft) rounded-xl p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 shrink-0 text-(--primary)" />
                  <p className="m-0 text-xs font-medium text-(--ink)">AI-generated recommendation to address weaknesses and restructure content.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="secondary" 
                    className="text-xs px-3"
                    onClick={async () => {
                      const html2pdf = (await import('html2pdf.js')).default;
                      const element = document.getElementById('recommended-doc-preview');
                      html2pdf().from(element).set({
                        margin: 15,
                        filename: `${data.candidateName || 'candidate'}_resume.pdf`,
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
                      const element = document.getElementById('recommended-doc-preview');
                      const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title></head><body>${element.innerHTML}</body></html>`;
                      const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
                      downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.doc`);
                    }}
                  >
                    Word
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="text-xs px-3"
                    onClick={() => {
                      const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                      const blob = new Blob([content], { type: 'text/markdown' });
                      downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.md`);
                    }}
                  >
                    MD
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="text-xs px-3"
                    onClick={() => {
                      const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                      const blob = new Blob([content], { type: 'text/plain' });
                      downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.txt`);
                    }}
                  >
                    TXT
                  </Button>
                </div>
              </div>
              
              {/* Recommended Resume Preview Container */}
              <div 
                id="recommended-doc-preview" 
                className="p-6 md:p-8 bg-(--surface-card) border border-(--hairline) rounded-xl text-(--ink)"
              >
                <div className="prose prose-sm dark:prose-invert max-w-none text-(--ink)">
                  <ReactMarkdown>{data.recommendedDoc || data.recommended_doc || "No recommendation available."}</ReactMarkdown>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

 {/* Global result Actions inside platform output standard */}
 {(data.id || jobId) && (
 <div className="flex justify-end pt-4 border-t border-(--hairline)">
 <ResultActions 
 resultId={data.id || jobId}
 isPinned={data.isPinned}
 onDelete={() => { setData(null); router.push('/dashboard/analyze'); }}
 resultText={data.recommendedDoc || data.recommended_doc ||""}
 />
 </div>
 )}
 </div>
 ) : (
 // ==================== UPLOAD CARD / INTERFACE ====================
 <div className="max-w-3xl mx-auto space-y-8">
 <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-lg p-6 sm:p-8 backdrop-blur-xl transition-colors">
 <div className="mb-6 border-b border-(--hairline-soft) pb-4">
 <h2 className="text-2xl font-serif text-(--ink)">Upload Resume</h2>
 <p className="text-xs text-(--muted) mt-1">Accepts standard single or multi-page PDF documents</p>
 </div>
 
 <div 
 {...getRootProps()} 
 className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 group ${
 isDragActive 
 ? 'border-(--primary) bg-(--primary)/5 scale-[1.01]' 
 : 'border-(--hairline) bg-(--surface-soft)/40 hover:bg-(--surface-soft) hover:border-(--primary)/50'
 }`}
 >
 <input {...getInputProps()} disabled={isGenerating} />
 
 <div className="flex flex-col items-center justify-center space-y-3">
 {file ? (
 <>
 <div className="w-14 h-14 rounded-2xl bg-(--primary)/10 text-(--primary) flex items-center justify-center mb-1">
 <File className="w-7 h-7" />
 </div>
 <div className="font-medium text-base text-(--ink)">{file.name}</div>
 <div className="text-xs text-(--muted)">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
 <button 
 type="button"
 onClick={(e) => { e.stopPropagation(); setFile(null); }} 
 className="mt-3 px-3 py-1.5 rounded-xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) text-xs text-(--error) font-medium transition-colors cursor-pointer" 
 disabled={isGenerating}
 >
 Remove File
 </button>
 </>
 ) : (
 <>
 <div className="w-14 h-14 rounded-2xl bg-(--surface-soft) text-(--primary) border border-(--hairline-soft) flex items-center justify-center group-hover:scale-105 transition-transform">
 <UploadCloud className="w-7 h-7" />
 </div>
 <div className="font-medium text-base text-(--ink)">Drag & drop your PDF resume here</div>
 <p className="text-xs text-(--muted)">or click to browse local files</p>
 <span className="text-[10px] text-(--muted-soft) mt-2">Maximum file size: 5MB</span>
 </>
 )}
 </div>
 </div>

 <div className="mt-8">
 <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
 </div>

 <button 
 type="button"
 className="w-full text-sm font-medium py-3.5 rounded-xl bg-(--primary) text-white hover:bg-(--primary-active) transition-all shadow-md hover:shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer mt-4"
 onClick={handleUpload}
 disabled={isGenerating || !file}
 >
 {isGenerating ? (
 <span className="flex items-center gap-2 animate-pulse">
 <Sparkles className="w-4 h-4" /> Parsing Resume...
 </span>
 ) : (
 <span className="flex items-center gap-2">
 <Sparkles className="w-4 h-4" /> Start Analysis
 </span>
 )}
 </button>
 
 {status !== JOB_STATUS.IDLE && status !== JOB_STATUS.COMPLETED && (
 <div className="mt-8 border-t border-(--hairline-soft) pt-6">
 <ProcessingPipeline 
 status={status}
 progress={progress}
 stage={stage}
 message={message}
 error={error}
 onRetry={handleUpload}
 onCancel={cancelJob}
 />
 </div>
 )}
 
 {status === JOB_STATUS.FAILED && (
 <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium flex items-start gap-2.5">
 <AlertCircle className="shrink-0 w-4 h-4 mt-0.5" />
 <span>{error}</span>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </ToolPageLayout>
 );
}

