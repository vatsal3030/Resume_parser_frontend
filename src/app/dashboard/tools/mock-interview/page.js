"use client";
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Sparkles, MessageSquare, ChevronRight, CheckCircle } from 'lucide-react';
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

export default function MockInterviewGenerator() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [targetRole, setTargetRole] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('last_target_role') || '';
    }
    return '';
  });

  useEffect(() => {
    if (targetRole) {
      localStorage.setItem('last_target_role', targetRole);
    }
  }, [targetRole]);
  
  // For interactive interview UI
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showGuidance, setShowGuidance] = useState(false);
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
    onComplete: () => toast.success('Interview Ready!', 'Your mock interview questions are prepared.')
  });

  useEffect(() => {
    api.get('/resumes').then(res => setResumes(res.data)).catch(console.error);
  }, []);

  const handleGenerate = () => {
    if (!selectedResume || !targetRole) {
      toast.warning('Missing Info', 'Please select a resume and enter a target role.');
      return;
    }
    setActiveQuestion(0);
    setShowGuidance(false);
    setHistoryResult(null);
    startJob('/career/mock-interview', { resumeId: selectedResume, targetRole, modelId });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    setActiveQuestion(0);
    setShowGuidance(false);
    toast.info('Loaded', `Loaded: ${item.title}`);
  };

  // Use history result if loaded, otherwise use live result
  const activeResult = historyResult || result;
  
  // Parse payload from history if needed
  const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : activeResult;

  const nextQuestion = () => {
    if (activeQuestion < (displayResult?.questions?.length || 0) - 1) {
      setActiveQuestion(prev => prev + 1);
      setShowGuidance(false);
    }
  };

  const prevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(prev => prev - 1);
      setShowGuidance(false);
    }
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  return (
    <ToolPageLayout
      title="Mock Interview"
      subtitle="Generate tough, highly-specific interview questions based on your resume."
      subtitleColor="bg-brutal-blue text-black"
      toolType="MOCK_INTERVIEW"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
    >
      {(status !== JOB_STATUS.COMPLETED && !historyResult) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* INPUT PANE */}
          <div className="space-y-6">
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <label className="block font-black text-lg mb-2">1. Select Resume Context</label>
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

                <label className="block font-black text-lg mb-2">2. Target Role & Company</label>
                <input 
                  className="w-full border-2 border-brutal-black p-3 font-medium mb-6 focus:bg-brutal-yellow/20 outline-none"
                  placeholder="e.g. Senior Frontend Engineer at Meta"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                  disabled={isGenerating}
                />

              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* AI ENGINE & ACTION */}
            <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
              <CardContent className="p-6">
                <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} />
                <Button 
                  variant="brutal" 
                  className="w-full text-xl py-6 bg-brutal-green text-black mt-4"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                     <span className="flex items-center gap-2 animate-pulse">
                       <Sparkles className="w-5 h-5" /> Generating Questions...
                     </span>
                  ) : (
                     <span className="flex items-center gap-2">
                       <Sparkles className="w-5 h-5" /> Start Mock Interview
                     </span>
                  )}
                </Button>
              </CardContent>
            </Card>

            {status === JOB_STATUS.IDLE && (
              <div className="h-full border-4 border-dashed border-brutal-black flex items-center justify-center p-8 text-center opacity-50 min-h-[200px]">
                 <p className="font-bold text-xl">Submit to start your interactive mock interview.</p>
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
          </div>
        </div>
      )}

      {/* RESULTS / INTERVIEW PANE */}
      {(status === JOB_STATUS.COMPLETED || historyResult) && displayResult && displayResult.questions && displayResult.questions.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8 animate-in fade-in zoom-in duration-300">
          <BranchingNavigation 
            activeResult={activeResult} 
            toolType="MOCK_INTERVIEW" 
            onSelect={(selected) => {
              setHistoryResult(selected);
              setActiveQuestion(0);
              setShowGuidance(false);
            }} 
          />
          <ResultActions 
            resultId={activeResult?.id}
            isPinned={activeResult?.isPinned}
            onDelete={() => { setHistoryResult(null); resetJob(); }}
            resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
            className="mb-4"
          />
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-black">Question {activeQuestion + 1} of {displayResult.questions.length}</h2>
             <span className={`text-xs font-bold uppercase px-3 py-1 border-2 border-brutal-black text-white ${
               displayResult.questions[activeQuestion].type === 'behavioral' ? 'bg-brutal-pink text-black' :
               displayResult.questions[activeQuestion].type === 'technical' ? 'bg-brutal-blue' : 'bg-brutal-yellow text-black'
             }`}>
               {displayResult.questions[activeQuestion].type}
             </span>
          </div>

          <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
            <CardContent className="p-8 md:p-12 text-center relative">
              <Button
                variant="outline"
                className="absolute top-4 right-4 bg-brutal-bg border-2 border-brutal-black shadow-[2px_2px_0_#000]"
                onClick={() => {
                  if (typeof window !== 'undefined' && window.speechSynthesis) {
                    if (window.speechSynthesis.speaking) {
                      window.speechSynthesis.cancel();
                    } else {
                      const utterance = new SpeechSynthesisUtterance(displayResult.questions[activeQuestion].question);
                      window.speechSynthesis.speak(utterance);
                    }
                  }
                }}
                title="Toggle Read Aloud"
              >
                🔊 Play / Stop
              </Button>
              <MessageSquare className="w-16 h-16 mx-auto mb-6 text-brutal-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
              <h3 className="text-3xl md:text-4xl font-black leading-tight mb-8">&quot;{displayResult.questions[activeQuestion].question}&quot;</h3>
              
              <div className="bg-slate-100 border-l-4 border-brutal-black p-4 text-left inline-block mb-6">
                 <p className="text-sm font-bold text-gray-500 uppercase">Context:</p>
                 <p className="font-medium text-gray-800">{displayResult.questions[activeQuestion].context}</p>
              </div>

              {!showGuidance && (
                <div className="text-left mt-6">
                  <label className="block text-sm font-black mb-2 uppercase tracking-widest text-brutal-blue">Your Answer (Practice)</label>
                  <textarea
                    className="w-full min-h-[120px] p-4 border-4 border-brutal-black font-medium resize-y focus:bg-brutal-yellow/10 outline-none"
                    placeholder="Type or dictate your answer here..."
                  ></textarea>
                </div>
              )}
            </CardContent>
          </Card>

          {!showGuidance ? (
            <div className="text-center mb-8">
               <Button variant="default" onClick={() => setShowGuidance(true)} className="text-lg px-8 py-6 border-4 border-brutal-black bg-brutal-yellow text-black hover:bg-yellow-400 hover:-translate-y-1 transition-all shadow-[4px_4px_0_#000]">
                  Reveal Expected Answer
               </Button>
            </div>
          ) : (
            <div className="bg-brutal-mint border-4 border-brutal-black p-6 mb-8 shadow-[4px_4px_0_rgba(0,0,0,1)] animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center gap-2 mb-4 border-b-2 border-brutal-black pb-2">
                 <CheckCircle className="w-6 h-6" />
                 <h4 className="text-xl font-black">Expected Answer Guidance</h4>
               </div>
               <p className="font-medium text-lg leading-relaxed">{displayResult.questions[activeQuestion].expectedAnswerGuidance}</p>
            </div>
          )}

          <div className="flex justify-between items-center border-t-4 border-brutal-black pt-6">
             <Button variant="ghost" onClick={prevQuestion} disabled={activeQuestion === 0} className="border-2 border-brutal-black font-bold">
               Previous
             </Button>
             <div className="flex gap-2">
               {displayResult.questions.map((_, i) => (
                 <div key={i} className={`w-3 h-3 border-2 border-brutal-black rounded-full ${i === activeQuestion ? 'bg-brutal-blue' : 'bg-white'}`} />
               ))}
             </div>
             <Button variant="ghost" onClick={nextQuestion} disabled={activeQuestion === displayResult.questions.length - 1} className="border-2 border-brutal-black font-bold bg-brutal-blue text-white hover:bg-blue-600">
               Next <ChevronRight className="w-4 h-4 ml-1" />
             </Button>
          </div>
          
          <div className="mt-12 text-center">
            {!historyResult && (
              <Button variant="outline" onClick={resetJob} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
                Restart Interview
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
              startJob('/career/mock-interview', { resumeId: targetResumeId, targetRole: trgRole, modelId: newModelId });
            }} 
          />
        </div>
      )}
    </ToolPageLayout>
  );
}
