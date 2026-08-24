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
    resetJob
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
        subtitleColor="bg-brutal-blue text-white"
        toolType="RESUME_ANALYSIS"
        onHistorySelect={handleHistorySelect}
        historyResult={historyResult}
        onClearHistory={() => { setData(null); setHistoryResult(null); router.push('/dashboard/analyze'); }}
      >
        <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
          {/* Blue header card skeleton — matches the real candidate profile card */}
          <Card className="bg-brutal-blue border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="h-10 bg-blue-400/40 rounded w-64 mb-4" />
                  <div className="flex flex-wrap gap-3">
                    <div className="h-7 bg-white/40 border-2 border-black/20 rounded w-36" />
                    <div className="h-7 bg-white/40 border-2 border-black/20 rounded w-28" />
                    <div className="h-7 bg-white/40 border-2 border-black/20 rounded w-20" />
                  </div>
                </div>
                <div className="h-8 bg-brutal-yellow/40 border-2 border-black/20 rounded w-40" />
              </div>
              <div className="mt-8 pt-6 border-t-4 border-brutal-black">
                <div className="h-7 bg-blue-400/30 rounded w-32 mb-3" />
                <div className="bg-white/40 border-3 border-black/20 p-4 space-y-2">
                  <div className="h-4 bg-blue-300/30 rounded w-full" />
                  <div className="h-4 bg-blue-300/30 rounded w-4/5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab buttons skeleton */}
          <div className="flex space-x-4">
            <div className="h-10 bg-brutal-black/80 border-3 border-brutal-black rounded w-44" />
            <div className="h-10 bg-white border-3 border-gray-300 rounded w-52" />
          </div>

          {/* Results grid: 4-col charts left + 8-col content right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-8">
              {/* ATS Score chart card */}
              <div className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                <div className="bg-brutal-yellow border-b-4 border-brutal-black p-4">
                  <div className="h-5 bg-yellow-600/20 rounded w-24 mx-auto" />
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="w-36 h-36 bg-gray-200 rounded-full border-4 border-gray-300" />
                </div>
              </div>
              {/* Job Fit chart card */}
              <div className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                <div className="bg-brutal-pink border-b-4 border-brutal-black p-4">
                  <div className="h-5 bg-pink-600/20 rounded w-20 mx-auto" />
                </div>
                <div className="p-6 flex flex-col items-center">
                  <div className="w-36 h-36 bg-gray-200 rounded-full border-4 border-gray-300" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 space-y-6">
              {/* Strengths card */}
              <div className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000]">
                <div className="h-6 bg-gray-300 rounded w-28 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-green-200 rounded shrink-0 mt-0.5" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </div>
                  ))}
                </div>
              </div>
              {/* Weaknesses card */}
              <div className="bg-white border-4 border-brutal-black p-6 shadow-[4px_4px_0_#000]">
                <div className="h-6 bg-gray-300 rounded w-32 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 bg-red-200 rounded shrink-0 mt-0.5" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
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
      subtitle={data ? `Analysis results for ${data.candidateName || 'your resume'}` : "Upload your resume to extract data and power all other AI tools."}
      subtitleColor="bg-brutal-mint"
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
            <Card className="bg-brutal-blue border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h1 className="text-4xl font-black text-brutal-black mb-2">{data.candidateName || 'Candidate Profile'}</h1>
                    <div className="flex flex-wrap gap-3 text-sm font-bold text-brutal-black mt-4">
                      {data.email && <span className="px-2 py-1 bg-white border-2 border-black">{data.email}</span>}
                      {data.phone && <span className="px-2 py-1 bg-white border-2 border-black">{data.phone}</span>}
                      {data.linkedin && <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-white border-2 border-black hover:bg-brutal-yellow transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />LinkedIn</a>}
                      {data.github && <a href={data.github} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-white border-2 border-black hover:bg-brutal-yellow transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />GitHub</a>}
                      {(data.portfolio || data.website) && <a href={data.portfolio || data.website} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-white border-2 border-black hover:bg-brutal-yellow transition flex items-center gap-1"><ExternalLink className="w-4 h-4" />Portfolio / Web</a>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 items-end w-full md:w-auto">
                    <span className="px-4 py-2 bg-brutal-yellow border-3 border-black font-black text-sm shadow-[3px_3px_0_#000] truncate max-w-xs block">
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
                      className="border-2 border-brutal-black font-bold flex items-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" /> Upload New Resume
                    </Button>
                  </div>
                </div>
                
                {data.summary && (
                  <div className="mt-8 pt-6 border-t-4 border-brutal-black">
                    <h3 className="text-2xl font-black mb-3 flex items-center"><UserCircle className="w-8 h-8 mr-2" /> Summary</h3>
                    <p className="font-medium text-lg bg-white p-4 border-3 border-black shadow-[3px_3px_0_#000]">{data.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <div className="flex space-x-4">
              <Button 
                variant={activeTab === 'insights' ? 'default' : 'white'} 
                className="text-lg border-3 font-black shadow-brutal-sm"
                onClick={() => setActiveTab('insights')}
              >
                AI Insights & Scoring
              </Button>
              <Button 
                variant={activeTab === 'resume' ? 'pink' : 'white'} 
                className="text-lg gap-2 border-3 font-black shadow-brutal-sm"
                onClick={() => setActiveTab('resume')}
              >
                <FileCheck2 className="w-5 h-5" /> Recommended Resume
              </Button>
            </div>

            {activeTab === 'insights' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Charts Left Column */}
                <div className="lg:col-span-4 space-y-8">
                  <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                    <CardHeader className="bg-brutal-yellow border-b-4 border-brutal-black p-4">
                      <CardTitle className="font-black text-center text-xl uppercase">ATS Score</CardTitle>
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
                              stroke="#1A1A1A" 
                              strokeWidth={3}
                            >
                              {[0, 1].map((index) => (
                                <Cell key={`cell-${index}`} fill={getPieColor(data.atsScore || 0)[index]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black">{data.atsScore || 0}</span>
                        </div>
                      </div>
                      <p className="font-bold text-xs mt-6 bg-slate-100 border-2 border-black p-2 shadow-[2px_2px_0_#000] text-center w-full">
                        Likelihood of passing recruiter screening.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                    <CardHeader className="bg-brutal-mint border-b-4 border-brutal-black p-4">
                      <CardTitle className="font-black text-center text-xl uppercase">Role Fit</CardTitle>
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
                              stroke="#1A1A1A" 
                              strokeWidth={3}
                            >
                              {[0, 1].map((index) => (
                                <Cell key={`cell-${index}`} fill={getPieColor(data.jobFitScore || 0)[index]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-5xl font-black">{data.jobFitScore || 0}</span>
                        </div>
                      </div>
                      <p className="font-bold text-xs mt-6 bg-slate-100 border-2 border-black p-2 shadow-[2px_2px_0_#000] text-center w-full">
                        Alignment with domain-relevant role standards.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Domain & Role Fit Details */}
                  {(data.detectedDomain || data.suggestedRoles) && (
                    <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                      <CardContent className="p-5 space-y-4">
                        {data.detectedDomain && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase text-gray-500">Domain:</span>
                            <span className="px-3 py-1 bg-purple-200 border-2 border-brutal-black font-black text-sm uppercase shadow-[2px_2px_0_#000]">
                              🎯 {data.detectedDomain}
                            </span>
                          </div>
                        )}
                        {data.roleFitExplanation && (
                          <p className="text-sm font-medium text-gray-700 bg-brutal-bg border-2 border-brutal-black p-3">
                            {data.roleFitExplanation}
                          </p>
                        )}
                        {data.suggestedRoles?.length > 0 && (
                          <div>
                            <p className="text-xs font-black uppercase text-gray-500 mb-2">Best Fit Roles</p>
                            <div className="space-y-2">
                              {data.suggestedRoles.map((r, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 border-2 border-brutal-black bg-brutal-bg">
                                  <div className="w-12 text-center shrink-0">
                                    <span className={`text-lg font-black ${r.matchPercentage >= 80 ? 'text-green-600' : r.matchPercentage >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                                      {r.matchPercentage}%
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm">{r.role}</p>
                                    <p className="text-xs text-gray-700 font-medium leading-relaxed mt-0.5 whitespace-normal break-words">{r.reasoning}</p>
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
                <div className="lg:col-span-8 space-y-6">
                  {data.strengths && data.strengths.length > 0 && (
                    <Card className="bg-brutal-mint border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                      <CardContent className="pt-6">
                         <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                           <CheckCircle2 className="w-8 h-8 mr-2 bg-white rounded-full p-0.5" /> Strengths
                         </h3>
                         <ul className="space-y-3 font-bold text-base">
                           {data.strengths.map((item, idx) => (
                             <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                               <span className="mr-3">🔥</span> {item}
                             </li>
                           ))}
                         </ul>
                      </CardContent>
                    </Card>
                  )}

                  {data.weaknesses && data.weaknesses.length > 0 && (
                    <Card className="bg-brutal-pink border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                      <CardContent className="pt-6">
                         <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                           <XCircle className="w-8 h-8 mr-2 bg-white rounded-full p-0.5" /> Weaknesses & Flags
                         </h3>
                         <ul className="space-y-3 font-bold text-base">
                           {data.weaknesses.map((item, idx) => (
                             <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                               <span className="mr-3">🚩</span> {item}
                             </li>
                           ))}
                         </ul>
                      </CardContent>
                    </Card>
                  )}

                  {data.suggestions && data.suggestions.length > 0 && (
                    <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_#000]">
                       <CardContent className="pt-6">
                         <h3 className="text-2xl font-black mb-4 flex items-center border-b-4 border-black pb-4">
                           <Lightbulb className="w-8 h-8 mr-2 bg-white rounded-full p-0.5" /> Actionable Suggestions
                         </h3>
                         <ul className="space-y-3 font-bold text-base">
                           {data.suggestions.map((item, idx) => (
                             <li key={idx} className="flex items-start bg-white p-3 border-3 border-black shadow-[2px_2px_0_#000]">
                               <span className="mr-3">💡</span> {item}
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
              <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000] relative">
                <CardContent className="pt-6 prose prose-lg max-w-none">
                  <div className="bg-brutal-blue border-4 border-black p-4 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-[4px_4px_0_#000] gap-4">
                    <div className="flex items-center gap-3">
                      <Lightbulb className="w-8 h-8 shrink-0 bg-white rounded-full p-1 border-2 border-black" />
                      <p className="m-0 font-bold text-sm md:text-base">AI-generated recommendation to address weaknesses and restructure content.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="white" 
                        className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs hover:bg-brutal-mint"
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
                        variant="white" 
                        className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs hover:bg-brutal-blue hover:text-white"
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
                        variant="white" 
                        className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs hover:bg-brutal-yellow"
                        onClick={() => {
                          const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                          const blob = new Blob([content], { type: 'text/markdown' });
                          downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.md`);
                        }}
                      >
                        MD
                      </Button>
                      <Button 
                        variant="white" 
                        className="font-black text-xs px-3 border-2 border-black shadow-brutal-xs"
                        onClick={() => {
                          const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                          const blob = new Blob([content], { type: 'text/plain' });
                          downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.txt`);
                        }}
                      >
                        TXT
                      </Button>
                      <Button 
                        variant="white" 
                        className="font-black text-xs px-3 border-2 border-black bg-brutal-yellow shadow-brutal-xs"
                        onClick={() => {
                          const content = data.recommendedDoc || data.recommended_doc || "No recommendation available.";
                          const latexContent = `\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{hyperref}\n\\begin{document}\n\n${content}\n\n\\end{document}`;
                          const blob = new Blob([latexContent], { type: 'application/x-latex' });
                          downloadBlob(blob, `${data.candidateName || 'candidate'}_resume.tex`);
                        }}
                      >
                        LaTeX
                      </Button>
                    </div>
                  </div>
                  
                  {/* Recommended Resume Preview Container with Explicit print CSS rules and high-contrast brutalist borders */}
                  <div 
                    id="recommended-doc-preview" 
                    className="p-8 bg-white"
                    style={{
                      border: '4px solid #1a1a1a',
                      padding: '2.5rem',
                      backgroundColor: '#ffffff',
                      color: '#1a1a1a',
                      boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    <ReactMarkdown>{data.recommendedDoc || data.recommended_doc || "No recommendation available."}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Global result Actions inside platform output standard */}
            {(data.id || historyResult?.id || currentJobId) && (
              <div className="flex justify-end pt-4 border-t-2 border-brutal-black">
                <ResultActions 
                  resultId={historyResult?.id || data.id || currentJobId}
                  isPinned={historyResult?.isPinned || data.isPinned}
                  onDelete={() => { setData(null); setHistoryResult(null); router.push('/dashboard/analyze'); }}
                  resultText={data.recommendedDoc || data.recommended_doc || ""}
                />
              </div>
            )}
          </div>
        ) : (
          // ==================== UPLOAD CARD / INTERFACE ====================
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-8">
                <h2 className="text-2xl font-black uppercase mb-6 border-b-4 border-brutal-black pb-2 inline-block">Upload Resume</h2>
                
                <div 
                  {...getRootProps()} 
                  className={`border-4 border-dashed border-brutal-black p-12 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'bg-brutal-yellow' : 'bg-brutal-bg hover:bg-slate-50'
                  }`}
                >
                  <input {...getInputProps()} disabled={isGenerating} />
                  
                  <div className="flex flex-col items-center justify-center space-y-4">
                    {file ? (
                      <>
                        <File className="w-16 h-16 text-brutal-blue" />
                        <div className="font-black text-xl">{file.name}</div>
                        <div className="text-sm font-bold text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                          className="mt-4 border-2 border-brutal-black font-bold text-xs" 
                          disabled={isGenerating}
                        >
                          Remove File
                        </Button>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-16 h-16 text-brutal-black" />
                        <div className="font-black text-xl">Drag & Drop your PDF here</div>
                        <p className="text-sm font-bold text-gray-500">or click to browse</p>
                        <p className="text-xs font-bold text-gray-400 mt-2">Max file size: 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <label className="block font-black text-lg mb-2">Select AI Model</label>
                  <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} hideLabel={true} />
                </div>

                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-green text-black mt-8 hover:bg-green-400"
                  onClick={handleUpload}
                  disabled={isGenerating || !file}
                >
                  {isGenerating ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Sparkles className="w-5 h-5" /> Parsing Resume...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <Sparkles className="w-5 h-5" /> Start Analysis
                     </span>
                  )}
                </Button>
                
                {status !== JOB_STATUS.IDLE && status !== JOB_STATUS.COMPLETED && (
                  <div className="mt-8 border-t-4 border-brutal-black pt-8">
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
                  <div className="mt-4 p-4 bg-red-100 border-4 border-red-500 text-red-900 font-bold flex items-start gap-3">
                    <AlertCircle className="shrink-0 w-6 h-6" />
                    <span>{error}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolPageLayout>
  );
}

