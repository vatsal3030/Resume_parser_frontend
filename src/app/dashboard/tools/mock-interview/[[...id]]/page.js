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
import { useResumes } from '@/hooks/useResumes';
import { RegenerateBlock } from '@/components/ui/RegenerateBlock';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';

export default function MockInterviewGenerator() {
  const { resumes, isLoading: resumesLoading } = useResumes();
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
  
  // Interactive UI States
  const [activeRound, setActiveRound] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showGuidance, setShowGuidance] = useState(false);
  const [modelId, setModelId] = useState('default');
  const [historyResult, setHistoryResult] = useState(null);
  
  // Grading State
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState(null);

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
    setActiveRound(0);
    setActiveQuestion(0);
    setAnswers({});
    setShowGuidance(false);
    setHistoryResult(null);
    setGradeResult(null);
    startJob('/career/mock-interview', { resumeId: selectedResume, targetRole, modelId });
  };

  const handleHistorySelect = (item) => {
    setHistoryResult(item);
    setActiveRound(0);
    setActiveQuestion(0);
    setShowGuidance(false);
    setAnswers({});
    setGradeResult(null);
  };

  const activeResult = historyResult || result;
  const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
    ? activeResult.outputPayload 
    : activeResult;

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const nextQuestion = () => {
    const currentRound = displayResult?.rounds[activeRound];
    if (activeQuestion < (currentRound?.questions?.length || 0) - 1) {
      setActiveQuestion(prev => prev + 1);
      setShowGuidance(false);
    } else if (activeRound < (displayResult?.rounds?.length || 0) - 1) {
      setActiveRound(prev => prev + 1);
      setActiveQuestion(0);
      setShowGuidance(false);
    }
  };

  const prevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(prev => prev - 1);
      setShowGuidance(false);
    } else if (activeRound > 0) {
      setActiveRound(prev => prev - 1);
      const prevRound = displayResult?.rounds[activeRound - 1];
      setActiveQuestion((prevRound?.questions?.length || 1) - 1);
      setShowGuidance(false);
    }
  };

  const submitForGrading = async () => {
    setIsGrading(true);
    try {
      // Gather all questions
      let allQuestions = [];
      displayResult?.rounds?.forEach(r => allQuestions.push(...r.questions));
      
      const res = await api.post('/career/grade-interview', {
        answers,
        questions: allQuestions,
        modelId
      });
      setGradeResult(res.data.result || res.data); // ai.service returns { result: ... } but sometimes just the object
      toast.success('Graded!', 'Your interview has been evaluated.');
    } catch (err) {
      toast.error('Error', 'Failed to grade interview.');
    } finally {
      setIsGrading(false);
    }
  };

  const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);
  
  const currentRound = displayResult?.rounds?.[activeRound];
  const currentQ = currentRound?.questions?.[activeQuestion];

  return (
    <ToolPageLayout
      title="Mock Interview"
      subtitle="Generate tough, multi-round interview questions based on your resume."
      subtitleColor="bg-brutal-blue text-black"
      toolType="MOCK_INTERVIEW"
      onHistorySelect={handleHistorySelect}
      historyResult={historyResult}
      onClearHistory={() => setHistoryResult(null)}
      onJobIdFound={monitorJob}
      fullWidth={true}
    >
      {/* INPUTS — Full-width compact bar */}
      <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">1. Resume Context</label>
              <Select 
                value={selectedResume}
                onChange={setSelectedResume}
                disabled={isGenerating}
                placeholder="-- Select Resume --"
                options={resumes?.map(r => ({
                  value: r.id,
                  label: r.title || r.originalName || 'Untitled Resume'
                })) || []}
              />
            </div>

            <div>
              <label className="block font-black text-sm mb-1.5 uppercase tracking-tight">2. Target Role & Company</label>
              <input 
                className="w-full border-2 border-brutal-black p-2.5 font-medium text-sm focus:bg-brutal-yellow/20 outline-none"
                placeholder="e.g. Senior Frontend Engineer at Meta"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                disabled={isGenerating}
              />
            </div>

            <div>
              <ModelSelector value={modelId} onChange={setModelId} disabled={isGenerating} compact />
            </div>

            <div>
              <Button 
                variant="brutal" 
                className="w-full text-base py-3 bg-brutal-green text-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <span className="flex items-center gap-2 animate-pulse">
                     <Sparkles className="w-4 h-4" /> Generating...
                   </span>
                ) : (
                   <span className="flex items-center gap-2">
                     <Sparkles className="w-4 h-4" /> Start Interview
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
               <p className="font-bold text-xl">Submit to start your multi-stage interview.</p>
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

          {/* GRADE RESULT VIEW */}
          {gradeResult && (
            <div className="animate-in fade-in slide-in-from-bottom-8 space-y-8">
               <Card className="bg-brutal-yellow border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)]">
                  <CardContent className="p-8 text-center">
                     <h2 className="text-4xl font-black mb-4">Interview Complete!</h2>
                     <div className="inline-block bg-white border-4 border-black px-8 py-4 font-black text-6xl mb-6 shadow-[4px_4px_0_#000]">
                        {gradeResult.totalScore}/100
                     </div>
                     <p className="text-xl font-bold">{gradeResult.feedbackSummary}</p>
                  </CardContent>
               </Card>

               {gradeResult.rounds?.map((round, i) => (
                 <Card key={i} className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-center mb-6 border-b-4 border-black pb-4">
                       <h3 className="text-2xl font-black">{round.title}</h3>
                       <span className="font-bold text-xl bg-brutal-blue text-white px-4 py-1 border-2 border-black">
                         Score: {round.score}/100
                       </span>
                     </div>
                     <div className="space-y-6">
                        {round.questionFeedback?.map((qf, j) => {
                           const originalQ = displayResult.rounds[i].questions.find(q => q.id === qf.questionId);
                           return (
                             <div key={j} className="border-2 border-dashed border-gray-300 p-4 relative">
                                <span className="absolute -top-3 -left-3 w-8 h-8 bg-brutal-pink text-black border-2 border-black font-black flex items-center justify-center rounded-full">
                                   {qf.score}
                                </span>
                                <p className="font-bold mb-2 ml-4">Q: {originalQ?.question}</p>
                                <p className="text-gray-600 italic mb-4 ml-4">&quot;{answers[qf.questionId] || 'No answer provided'}&quot;</p>
                                <div className="bg-brutal-mint border-2 border-black p-3 ml-4">
                                   <p className="font-semibold">{qf.feedback}</p>
                                </div>
                             </div>
                           );
                        })}
                     </div>
                   </CardContent>
                 </Card>
               ))}
               <div className="text-center mt-8">
                 <Button variant="default" onClick={() => { setGradeResult(null); resetJob(); setHistoryResult(null); }} className="text-lg px-8 py-4 border-4 border-brutal-black bg-white hover:bg-gray-100 text-black shadow-[4px_4px_0_#000]">
                    Take Another Interview
                 </Button>
               </div>
            </div>
          )}

          {/* RESULTS / INTERVIEW PANE */}
          {!gradeResult && (status === JOB_STATUS.COMPLETED || historyResult) && displayResult?.rounds?.length > 0 && currentQ && (
            <div className="animate-in fade-in slide-in-from-bottom-8 space-y-6">
              <BranchingNavigation 
                activeResult={activeResult} 
                toolType="MOCK_INTERVIEW" 
                onSelect={(selected) => {
                  setHistoryResult(selected);
                  setActiveRound(0);
                  setActiveQuestion(0);
                  setShowGuidance(false);
                }} 
              />

              {/* Domain & Level Badges */}
              {(displayResult.detectedDomain || displayResult.interviewLevel) && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {displayResult.detectedDomain && (
                    <span className="px-4 py-2 bg-purple-200 border-3 border-brutal-black font-black text-sm uppercase shadow-[3px_3px_0_#000]">
                      🎯 Domain: {displayResult.detectedDomain}
                    </span>
                  )}
                  {displayResult.interviewLevel && (
                    <span className="px-4 py-2 bg-brutal-mint border-3 border-brutal-black font-black text-sm uppercase shadow-[3px_3px_0_#000]">
                      📊 Level: {displayResult.interviewLevel}
                    </span>
                  )}
                  <span className="px-4 py-2 bg-brutal-yellow border-3 border-brutal-black font-black text-sm uppercase shadow-[3px_3px_0_#000]">
                    📝 {displayResult.rounds.length} Rounds · {displayResult.rounds.reduce((sum, r) => sum + (r.questions?.length || 0), 0)} Questions
                  </span>
                </div>
              )}

              {/* Overall Progress Bar */}
              {(() => {
                const totalQ = displayResult.rounds.reduce((sum, r) => sum + (r.questions?.length || 0), 0);
                const answeredQ = Object.keys(answers).filter(k => answers[k]?.length > 0).length;
                const pct = totalQ > 0 ? Math.round((answeredQ / totalQ) * 100) : 0;
                return (
                  <div className="bg-white border-3 border-brutal-black p-3 shadow-[3px_3px_0_#000]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-xs uppercase">Progress</span>
                      <span className="font-black text-sm">{answeredQ}/{totalQ} answered ({pct}%)</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 border-2 border-brutal-black">
                      <div className="h-full bg-brutal-green transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
                {/* Sidebar / Progress */}
                <div className="lg:col-span-4 space-y-4">
                  <Card className="bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                    <CardContent className="p-4">
                      <h3 className="font-black text-xl mb-4 border-b-2 border-black pb-2">Interview Rounds</h3>
                      <div className="space-y-4">
                        {displayResult.rounds.map((round, rIdx) => {
                          const typeColors = {
                            aptitude: 'bg-yellow-100 text-yellow-800',
                            mcq: 'bg-blue-100 text-blue-800',
                            coding: 'bg-green-100 text-green-800',
                            technical: 'bg-purple-100 text-purple-800',
                            project_discussion: 'bg-orange-100 text-orange-800',
                            behavioral: 'bg-pink-100 text-pink-800',
                          };
                          return (
                            <div key={rIdx}>
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className={`font-bold text-sm flex-1 ${rIdx === activeRound ? 'text-brutal-blue' : 'text-gray-500'}`}>
                                  {round.title}
                                </h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 border border-current uppercase ${typeColors[round.type] || 'bg-gray-100'}`}>
                                  {round.type?.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                {round.questions.map((q, qIdx) => {
                                  const isCurrent = rIdx === activeRound && qIdx === activeQuestion;
                                  const isAnswered = answers[q.id]?.length > 0;
                                  return (
                                    <button 
                                      key={qIdx} 
                                      onClick={() => { setActiveRound(rIdx); setActiveQuestion(qIdx); setShowGuidance(false); }}
                                      className={`w-7 h-7 border-2 border-black rounded-sm flex items-center justify-center text-xs font-bold cursor-pointer transition-all hover:scale-110 ${isCurrent ? 'bg-brutal-yellow shadow-[2px_2px_0_#000]' : (isAnswered ? 'bg-brutal-green' : 'bg-gray-100')}`}
                                    >
                                      {qIdx + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-8">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
                     <h2 className="text-2xl font-black">{currentRound.title} — Q{activeQuestion + 1}</h2>
                     <div className="flex gap-2">
                       {/* Difficulty badge */}
                       {currentQ.difficulty && (
                         <span className={`text-xs font-black uppercase px-3 py-1 border-2 border-brutal-black ${
                           currentQ.difficulty === 'Hard' ? 'bg-red-300' : currentQ.difficulty === 'Medium' ? 'bg-orange-200' : 'bg-green-200'
                         }`}>
                           {currentQ.difficulty}
                         </span>
                       )}
                       {/* Time badge */}
                       {currentQ.timeMinutes && (
                         <span className="text-xs font-black uppercase px-3 py-1 border-2 border-brutal-black bg-brutal-blue text-white">
                           ⏱ {currentQ.timeMinutes} min
                         </span>
                       )}
                       {/* Type badge */}
                       <span className="text-xs font-bold uppercase px-3 py-1 border-2 border-brutal-black bg-brutal-pink text-black">
                         {currentRound.type?.replace('_', ' ')}
                       </span>
                     </div>
                  </div>

                  <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] mb-8">
                    <CardContent className="p-8 md:p-12 text-center relative">
                      <MessageSquare className="w-16 h-16 mx-auto mb-6 text-brutal-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" />
                      <h3 className="text-3xl md:text-4xl font-black leading-tight mb-8">&quot;{currentQ.question}&quot;</h3>
                      
                      {currentQ.context && (
                        <div className="bg-slate-100 border-l-4 border-brutal-black p-4 text-left inline-block mb-6">
                          <p className="text-sm font-bold text-gray-500 uppercase">Context:</p>
                          <p className="font-medium text-gray-800">{currentQ.context}</p>
                        </div>
                      )}

                      <div className="text-left mt-6">
                        <label className="block text-sm font-black mb-2 uppercase tracking-widest text-brutal-blue">Your Answer</label>
                        {currentRound.type === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
                          <div className="space-y-3 mt-4">
                            {currentQ.options.map((opt, idx) => (
                              <label key={idx} className={`flex items-center gap-3 p-4 border-4 cursor-pointer transition-all ${answers[currentQ.id] === opt ? 'border-brutal-blue bg-brutal-blue/10 shadow-[3px_3px_0_#000]' : 'border-brutal-black hover:bg-slate-50'}`}>
                                <input 
                                  type="radio" 
                                  name={`mcq_${currentQ.id}`} 
                                  value={opt}
                                  checked={answers[currentQ.id] === opt}
                                  onChange={() => handleAnswerChange(currentQ.id, opt)}
                                  className="w-5 h-5 accent-brutal-blue"
                                />
                                <span className="font-bold">{String.fromCharCode(65 + idx)}. {opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <textarea
                            className="w-full min-h-[150px] p-4 border-4 border-brutal-black font-medium resize-y focus:bg-brutal-yellow/10 outline-none"
                            placeholder="Type your answer here..."
                            value={answers[currentQ.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                          ></textarea>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Show Guidance Toggle */}
                  <div className="mb-6">
                    <button 
                      onClick={() => setShowGuidance(!showGuidance)} 
                      className="text-sm font-black text-brutal-blue underline decoration-2 underline-offset-4 hover:text-blue-700"
                    >
                      {showGuidance ? 'Hide Answer Guidance ▲' : 'Show Answer Guidance ▼'}
                    </button>
                    {showGuidance && currentQ.expectedAnswerGuidance && (
                      <div className="mt-3 bg-brutal-mint/30 border-2 border-brutal-black p-4">
                        <p className="text-xs font-black uppercase text-gray-500 mb-2">Expected Answer Points:</p>
                        <p className="font-medium text-gray-800 whitespace-pre-wrap">{currentQ.expectedAnswerGuidance}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center border-t-4 border-brutal-black pt-6">
                     <Button variant="ghost" onClick={prevQuestion} disabled={activeRound === 0 && activeQuestion === 0} className="border-2 border-brutal-black font-bold">
                       Previous
                     </Button>
                     
                     {activeRound === displayResult.rounds.length - 1 && activeQuestion === currentRound.questions.length - 1 ? (
                       <Button onClick={submitForGrading} disabled={isGrading} className="border-2 border-brutal-black font-bold bg-brutal-green text-black hover:bg-green-400">
                         {isGrading ? 'Grading...' : 'Submit for Grading'} <CheckCircle className="w-4 h-4 ml-2" />
                       </Button>
                     ) : (
                       <Button onClick={nextQuestion} className="border-2 border-brutal-black font-bold bg-brutal-blue text-white hover:bg-blue-600">
                         Next Question <ChevronRight className="w-4 h-4 ml-1" />
                       </Button>
                     )}
                  </div>
                  
                  {!historyResult && (
                    <div className="mt-8 text-center">
                      <Button variant="outline" onClick={resetJob} className="text-sm font-bold underline decoration-2 underline-offset-4 border-none hover:bg-transparent">
                        Restart Interview
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
    </ToolPageLayout>
  );
}
