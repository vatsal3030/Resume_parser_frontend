"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
 Sparkles, MessageSquare, ChevronRight, CheckCircle, Clock, Lightbulb, 
 Code2, Brain, Users, Target, AlertTriangle, Volume2, VolumeX, Mic, MicOff, 
 Volume1, Flame, Trophy, Award, BookOpen, Check, Copy, Printer, RotateCcw, 
 Zap, Star, ArrowRight, ShieldCheck, HelpCircle, FileText, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toast';
import { ModelSelector } from '@/components/ui/ModelSelector';
import { useAsyncJob, JOB_STATUS } from '@/hooks/useAsyncJob';
import { ProcessingPipeline } from '@/components/ui/ProcessingPipeline';
import { ToolPageLayout } from '@/components/layout/ToolPageLayout';
import { Select } from '@/components/ui/Select';
import { useResumes } from '@/hooks/useResumes';
import { BranchingNavigation } from '@/components/ui/BranchingNavigation';
import { ResultActions } from '@/components/ui/ResultActions';
import { interviewAudio } from '@/utils/interviewAudio';
import { triggerConfetti } from '@/utils/confetti';

// Round type configuration
const ROUND_CONFIG = {
 aptitude: { icon: Brain, color: 'bg-yellow-200', borderColor: 'border-yellow-500', label: 'Aptitude & Logic' },
 mcq: { icon: Target, color: 'bg-blue-200', borderColor: 'border-blue-500', label: 'Technical MCQ' },
 coding: { icon: Code2, color: 'bg-emerald-200', borderColor: 'border-emerald-500', label: 'Coding & Systems' },
 technical: { icon: Code2, color: 'bg-purple-200', borderColor: 'border-purple-500', label: 'Technical Core' },
 project_discussion: { icon: MessageSquare, color: 'bg-orange-200', borderColor: 'border-orange-500', label: 'Project Deep Dive' },
 behavioral: { icon: Users, color: 'bg-pink-200', borderColor: 'border-pink-500', label: 'HR & Behavioral' },
};

// Timer hook with warning thresholds
function useTimer(minutes, isActive) {
 const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
 const intervalRef = useRef(null);

 useEffect(() => {
 setSecondsLeft(minutes * 60);
 }, [minutes]);

 useEffect(() => {
 if (isActive && secondsLeft > 0) {
 intervalRef.current = setInterval(() => {
 setSecondsLeft(prev => {
 if (prev === 31) {
 interviewAudio.playTimerAlert();
 }
 if (prev <= 1) {
 clearInterval(intervalRef.current);
 return 0;
 }
 return prev - 1;
 });
 }, 1000);
 }
 return () => clearInterval(intervalRef.current);
 }, [isActive, secondsLeft]);

 const reset = useCallback((newMinutes) => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 setSecondsLeft(newMinutes * 60);
 }, []);

 const formatTime = () => {
 const m = Math.floor(secondsLeft / 60);
 const s = secondsLeft % 60;
 return `${m}:${s.toString().padStart(2, '0')}`;
 };

 return { secondsLeft, formatTime, reset, isExpired: secondsLeft === 0 };
}

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
 const [showHints, setShowHints] = useState(0);
 const [mcqSubmitted, setMcqSubmitted] = useState({});
 const [timerActive, setTimerActive] = useState(true);
 const [modelId, setModelId] = useState('default');
 const [historyResult, setHistoryResult] = useState(null);
 
 // View Modes: 'interview' | 'solutions' | 'cheatsheet'
 const [viewTab, setViewTab] = useState('interview');
 const [selectedSolutionRound, setSelectedSolutionRound] = useState(0);
 
 // Audio & Speech States
 const [isMuted, setIsMuted] = useState(false);
 const [isSpeaking, setIsSpeaking] = useState(false);
 const [isListening, setIsListening] = useState(false);
 const recognitionRef = useRef(null);

 // Gamification States
 const [xp, setXp] = useState(0);
 const [streak, setStreak] = useState(0);
 const [badges, setBadges] = useState([]);
 const [copiedSolutionId, setCopiedSolutionId] = useState(null);

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
 resetJob,
 jobId
 } = useAsyncJob();

 useEffect(() => {
 if (!selectedResume && resumes?.length > 0) {
 setSelectedResume(resumes[0].id);
 }
 }, [resumes, selectedResume]);

 // Handle Mute Toggle
 const toggleMute = () => {
 const muted = interviewAudio.toggleMute();
 setIsMuted(muted);
 toast.info(muted ? 'Sound Muted' : 'Sound Enabled', muted ? 'Audio feedback is muted' : 'Audio cues active');
 };

 // Gamification: Award XP and Badges
 const awardXp = useCallback((amount, reason = '') => {
 setXp(prev => {
 const nextXp = prev + amount;
 interviewAudio.playXpGain();
 if (reason) {
 toast.success(`+${amount} XP!`, reason);
 }
 return nextXp;
 });
 }, [toast]);

 const unlockBadge = useCallback((badgeName, badgeIcon, description) => {
 setBadges(prev => {
 if (prev.some(b => b.name === badgeName)) return prev;
 interviewAudio.playBadgeUnlocked();
 triggerConfetti();
 toast.success(`Achievement Unlocked! 🏆`, `${badgeName} — ${description}`);
 return [...prev, { name: badgeName, icon: badgeIcon, description }];
 });
 }, [toast]);

 // Speech-to-Text (Voice Dictation)
 const toggleListening = (questionId) => {
 if (typeof window === 'undefined') return;
 
 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
 if (!SpeechRecognition) {
 toast.warning('Browser Unsupported', 'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
 return;
 }

 if (isListening) {
 if (recognitionRef.current) {
 recognitionRef.current.stop();
 }
 setIsListening(false);
 return;
 }

 try {
 const recognition = new SpeechRecognition();
 recognition.continuous = true;
 recognition.interimResults = true;
 recognition.lang = 'en-US';

 recognition.onstart = () => {
 setIsListening(true);
 interviewAudio.playClick();
 toast.info('Listening...', 'Speak clearly into your microphone.');
 };

 recognition.onresult = (event) => {
 let currentTranscript = '';
 for (let i = 0; i < event.results.length; i++) {
 currentTranscript += event.results[i][0].transcript + ' ';
 }
 setAnswers(prev => ({
 ...prev,
 [questionId]: (prev[questionId] ? prev[questionId].trim() + ' ' : '') + currentTranscript.trim()
 }));
 };

 recognition.onerror = (event) => {
 console.error('Speech recognition error:', event.error);
 setIsListening(false);
 toast.error('Voice Input Error', `Microphone error: ${event.error}`);
 };

 recognition.onend = () => {
 setIsListening(false);
 };

 recognitionRef.current = recognition;
 recognition.start();
 unlockBadge('Voice Pioneer', '🎙️', 'Practiced using live voice response');
 } catch (err) {
 console.error(err);
 setIsListening(false);
 }
 };

 // Text-to-Speech (AI Interviewer Voice)
 const speakText = (text) => {
 if (typeof window === 'undefined' || !window.speechSynthesis) return;

 if (isSpeaking) {
 window.speechSynthesis.cancel();
 setIsSpeaking(false);
 return;
 }

 window.speechSynthesis.cancel();
 const utterance = new SpeechSynthesisUtterance(text);
 utterance.rate = 1.0;
 utterance.pitch = 1.0;
 utterance.onstart = () => setIsSpeaking(true);
 utterance.onend = () => setIsSpeaking(false);
 utterance.onerror = () => setIsSpeaking(false);

 window.speechSynthesis.speak(utterance);
 };

 // Stop speech synthesis when component unmounts or changes
 useEffect(() => {
 return () => {
 if (typeof window !== 'undefined' && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 }
 if (recognitionRef.current) {
 recognitionRef.current.stop();
 }
 };
 }, []);

 const handleGenerate = () => {
 if (!selectedResume || !targetRole) {
 toast.warning('Missing Info', 'Please select a resume and enter a target role.');
 return;
 }
 setActiveRound(0);
 setActiveQuestion(0);
 setAnswers({});
 setShowGuidance(false);
 setShowHints(0);
 setMcqSubmitted({});
 setHistoryResult(null);
 setGradeResult(null);
 setViewTab('interview');
 setTimerActive(true);
 setStreak(0);
 interviewAudio.playClick();
 startJob('/career/mock-interview', { resumeId: selectedResume, targetRole, modelId });
 };

 const handleHistorySelect = (item) => {
 setHistoryResult(item);
 const inputs = item.outputPayload?._meta?.inputs || item.inputSummary || {};
 if (inputs.resumeId) setSelectedResume(inputs.resumeId);
 if (inputs.company || inputs.companyName) setCompanyName(inputs.company || inputs.companyName);
 if (item.modelUsed || item.outputPayload?._meta?.model) setModelId(item.modelUsed || item.outputPayload?._meta?.model);
 setActiveRound(0);
 setActiveQuestion(0);
 setShowGuidance(false);
 setShowHints(0);
 setMcqSubmitted({});
 setAnswers({});
 setGradeResult(null);
 setViewTab('interview');
 setTimerActive(true);
 };

 const activeResult = historyResult || (status === JOB_STATUS.COMPLETED ? { id: jobId, aiJobId: jobId, outputPayload: result, inputSummary: { resumeId: selectedResume, company: companyName }, modelUsed: modelId, createdAt: new Date().toISOString() } : null);
 const displayResult = typeof activeResult === 'object' && activeResult?.outputPayload 
 ? activeResult.outputPayload 
 : activeResult;

 const handleAnswerChange = (qId, val) => {
 setAnswers(prev => ({ ...prev, [qId]: val }));
 };

 const handleMcqSubmit = (qId, correctOption) => {
 setMcqSubmitted(prev => ({ ...prev, [qId]: true }));
 const isCorrect = answers[qId] === correctOption;
 
 if (isCorrect) {
 interviewAudio.playCorrect();
 setStreak(s => s + 1);
 awardXp(50 + (streak * 10), `Correct MCQ answer! (Streak x${streak + 1})`);
 if (streak + 1 >= 3) {
 unlockBadge('Sharpshooter', '🎯', 'Achieved a 3+ correct answer streak!');
 }
 } else {
 interviewAudio.playIncorrect();
 setStreak(0);
 toast.error('Incorrect Choice', `Review the solution guidance below.`);
 }
 };

 const currentRound = displayResult?.rounds?.[activeRound];
 const currentQ = currentRound?.questions?.[activeQuestion];

 const timer = useTimer(currentQ?.timeMinutes || 5, timerActive && !!currentQ && !gradeResult);

 // Reset question timer & audio when navigating
 useEffect(() => {
 if (currentQ?.timeMinutes) {
 timer.reset(currentQ.timeMinutes);
 setShowHints(0);
 setShowGuidance(false);
 setTimerActive(true);
 if (isSpeaking && typeof window !== 'undefined' && window.speechSynthesis) {
 window.speechSynthesis.cancel();
 setIsSpeaking(false);
 }
 if (isListening && recognitionRef.current) {
 recognitionRef.current.stop();
 setIsListening(false);
 }
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeRound, activeQuestion, currentQ?.id]);

 const nextQuestion = () => {
 interviewAudio.playClick();
 
 // Reward XP for answering
 if (answers[currentQ?.id]?.length > 0) {
 awardXp(35, 'Question Answered');
 if (currentRound?.type === 'coding') {
 unlockBadge('Code Warrior', '💻', 'Completed a technical coding problem');
 }
 if (timer.secondsLeft > ((currentQ?.timeMinutes || 5) * 60) * 0.5) {
 awardXp(20, '⚡ Speed Demon Bonus!');
 unlockBadge('Speed Demon', '⚡', 'Answered well under the time limit');
 }
 }

 if (activeQuestion < (currentRound?.questions?.length || 0) - 1) {
 setActiveQuestion(prev => prev + 1);
 } else if (activeRound < (displayResult?.rounds?.length || 0) - 1) {
 setActiveRound(prev => prev + 1);
 setActiveQuestion(0);
 awardXp(100, `Completed ${currentRound.title}! 🎉`);
 }
 };

 const prevQuestion = () => {
 interviewAudio.playClick();
 if (activeQuestion > 0) {
 setActiveQuestion(prev => prev - 1);
 } else if (activeRound > 0) {
 setActiveRound(prev => prev - 1);
 const prevRound = displayResult?.rounds[activeRound - 1];
 setActiveQuestion((prevRound?.questions?.length || 1) - 1);
 }
 };

 const submitForGrading = async () => {
 setIsGrading(true);
 interviewAudio.playClick();
 try {
 let allQuestions = [];
 displayResult?.rounds?.forEach(r => allQuestions.push(...r.questions));
 
 const res = await api.post('/career/grade-interview', {
 answers,
 questions: allQuestions,
 modelId
 });
 const graded = res.data.result || res.data;
 setGradeResult(graded);
 interviewAudio.playSuccessFanfare();
 triggerConfetti();
 awardXp(300, 'Interview Completed & Evaluated! 🎓');
 unlockBadge('Interview Finisher', '🏆', 'Completed all 5 interview rounds!');
 toast.success('Evaluation Complete!', 'Your interview has been graded by the AI hiring bar.');
 } catch (err) {
 toast.error('Grading Error', 'Failed to evaluate interview responses.');
 } finally {
 setIsGrading(false);
 }
 };

 const copyToClipboard = (text, id) => {
 navigator.clipboard.writeText(text);
 setCopiedSolutionId(id);
 interviewAudio.playClick();
 toast.success('Copied!', 'Content copied to clipboard.');
 setTimeout(() => setCopiedSolutionId(null), 2000);
 };

 const isGenerating = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);
 
 const totalQuestions = displayResult?.rounds?.reduce((sum, r) => sum + (r.questions?.length || 0), 0) || 0;
 const answeredQuestions = Object.keys(answers).filter(k => answers[k]?.length > 0).length;
 const progressPct = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
 const userLevel = Math.floor(xp / 200) + 1;
 const levelProgress = ((xp % 200) / 200) * 100;

 return (
 <ToolPageLayout
 title="Mock Interview Simulator"
 subtitle="5-Stage Gamified Interview with Live AI Voice, Ideal Solutions & Evaluation Rubrics."
 toolType="MOCK_INTERVIEW"
 onHistorySelect={handleHistorySelect}
 historyResult={historyResult}
 activeResult={activeResult}
 onClearHistory={() => setHistoryResult(null)}
 onJobIdFound={monitorJob}
 fullWidth={true}
 headerActions={
 <div className="flex items-center gap-2">
 <Button
 onClick={toggleMute}
 variant="outline"
 className="border border-(--hairline) p-2 bg-white hover:bg-gray-100 shadow-sm"
 title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
 >
 {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-600" />}
 </Button>
 </div>
 }
 >
 {/* GAMIFIED TOP STATS BAR */}
 {(displayResult?.rounds?.length > 0 || status === JOB_STATUS.COMPLETED) && (
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 animate-in fade-in">
 <div className="bg-(--surface-card) border border-(--hairline) p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center font-medium text-sm">
 L{userLevel}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex justify-between items-center text-xs font-medium text-(--ink)">
 <span>XP Progress</span>
 <span className="text-(--muted)">{xp} XP</span>
 </div>
 <div className="w-full h-1.5 bg-(--surface-soft) rounded-full overflow-hidden mt-1.5">
 <div className="h-full bg-(--primary) transition-all duration-300 rounded-full" style={{ width: `${levelProgress}%` }} />
 </div>
 </div>
 </div>

 <div className="bg-(--surface-card) border border-(--hairline) p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
 <div className={`w-9 h-9 rounded-xl border border-(--hairline-soft) flex items-center justify-center font-medium text-sm ${streak > 0 ? 'bg-amber-500/15 text-amber-500 border-amber-500/30 animate-bounce' : 'bg-(--surface-soft) text-(--muted)'}`}>
 <Flame className="w-4 h-4" />
 </div>
 <div>
 <p className="text-[11px] text-(--muted)">Streak</p>
 <p className="text-sm font-medium text-(--ink)">{streak} Questions</p>
 </div>
 </div>

 <div className="bg-(--surface-card) border border-(--hairline) p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center font-medium text-sm">
 <Trophy className="w-4 h-4" />
 </div>
 <div>
 <p className="text-[11px] text-(--muted)">Badges</p>
 <p className="text-sm font-medium text-(--ink)">{badges.length} Unlocked</p>
 </div>
 </div>

 <div className="bg-(--surface-card) border border-(--hairline) p-3.5 rounded-2xl shadow-xs flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-medium text-sm">
 <CheckCircle className="w-4 h-4" />
 </div>
 <div className="flex-1">
 <p className="text-[11px] text-(--muted)">Completion</p>
 <p className="text-sm font-medium text-(--ink)">{answeredQuestions}/{totalQuestions} ({progressPct}%)</p>
 </div>
 </div>
 </div>
 )}

      {/* INPUTS BAR */}
      <Card className="rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-sm mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-(--muted) mb-1.5">1. Resume Context</label>
              <Select 
                value={selectedResume}
                onChange={setSelectedResume}
                disabled={isGenerating}
                loading={resumesLoading}
                placeholder="-- Select Resume --"
                options={resumes?.map(r => ({
                  value: r.id,
                  label: r.title || r.originalName || 'Untitled Resume'
                })) || []}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-(--muted) mb-1.5">2. Target Role & Company</label>
              <input 
                className="w-full border border-(--hairline) bg-(--surface-card) rounded-xl px-3.5 py-2.5 text-xs font-medium text-(--ink) placeholder:text-(--muted-soft) focus:outline-none focus:border-(--primary) shadow-xs transition-colors"
                placeholder="e.g. Senior Full Stack Engineer at Google"
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
                variant="default" 
                className="w-full py-2.5 text-xs"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <Sparkles className="w-4 h-4" /> Simulating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Start 5-Round Simulation
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

 {/* PIPELINE & IDLE STATE */}
 <div className="space-y-6 mb-8">
 {status === JOB_STATUS.IDLE && !historyResult && (
 <div className="rounded-2xl border border-dashed border-(--hairline) flex flex-col items-center justify-center p-12 text-center bg-(--surface-card) shadow-sm">
 <div className="w-14 h-14 rounded-2xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center mb-4">
 <Brain className="w-7 h-7 text-(--primary)" />
 </div>
 <h2 className="font-serif text-xl font-medium text-(--ink) mb-2">Ready to Test Your Industry Readiness?</h2>
 <p className="text-xs text-(--muted) max-w-lg leading-relaxed">
 Select your resume and target role above to begin an adaptive 5-round simulation (Aptitude, Core MCQs, Live Coding, Project Deep-Dive, and Behavioral) with live solutions and scoring rubrics.
 </p>
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

 {/* POST-INTERVIEW / SIMULATION TABS & VIEWS */}
 {(status === JOB_STATUS.COMPLETED || historyResult) && displayResult?.rounds?.length > 0 && (
 <div className="animate-in fade-in space-y-6">
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
 <BranchingNavigation 
 activeResult={activeResult} 
 toolType="MOCK_INTERVIEW" 
 onSelect={(selected) => {
 setHistoryResult(selected);
 setActiveRound(0);
 setActiveQuestion(0);
 setShowGuidance(false);
 setShowHints(0);
 }} 
 />
 
 {/* VIEW MODE TABS */}
 <div className="flex items-center gap-2 bg-gray-100 p-1.5 border border-(--hairline) shadow-sm">
 <button
 onClick={() => { setViewTab('interview'); interviewAudio.playClick(); }}
 className={`px-3 py-1.5 font-semibold text-xs transition-all flex items-center gap-1.5 ${
 viewTab === 'interview' ? 'bg-(--primary) text-black border border-(--hairline) shadow-sm' : 'text-gray-600 hover:text-black'
 }`}
 >
 <MessageSquare className="w-3.5 h-3.5" /> Practice Room
 </button>
 <button
 onClick={() => { setViewTab('solutions'); interviewAudio.playClick(); }}
 className={`px-3 py-1.5 font-semibold text-xs transition-all flex items-center gap-1.5 ${
 viewTab === 'solutions' ? 'bg-(--accent-teal) text-black border border-(--hairline) shadow-sm' : 'text-gray-600 hover:text-black'
 }`}
 >
 <BookOpen className="w-3.5 h-3.5" /> Model Solutions
 </button>
 <button
 onClick={() => { setViewTab('cheatsheet'); interviewAudio.playClick(); }}
 className={`px-3 py-1.5 font-semibold text-xs transition-all flex items-center gap-1.5 ${
 viewTab === 'cheatsheet' ? 'bg-purple-300 text-black border border-(--hairline) shadow-sm' : 'text-gray-600 hover:text-black'
 }`}
 >
 <FileText className="w-3.5 h-3.5" /> Interview Cheat Sheet
 </button>
 </div>

 <ResultActions 
 resultId={activeResult?.id || activeResult?.aiJobId || jobId}
 isPinned={activeResult?.isPinned}
 onDelete={() => { setHistoryResult(null); resetJob(); }}
 resultText={displayResult ? JSON.stringify(displayResult, null, 2) : ''}
 />
 </div>

 {/* DOMAIN & LEVEL BADGES */}
 <div className="flex flex-wrap items-center gap-3">
 {displayResult.detectedDomain && (
 <span className="px-3.5 py-1.5 bg-purple-200 border border-(--hairline) font-semibold text-xs shadow-sm">
 🎯 Domain: {displayResult.detectedDomain}
 </span>
 )}
 {displayResult.interviewLevel && (
 <span className="px-3.5 py-1.5 bg-(--accent-teal) border border-(--hairline) font-semibold text-xs shadow-sm">
 📊 Level: {displayResult.interviewLevel}
 </span>
 )}
 <span className="px-3.5 py-1.5 bg-(--primary) border border-(--hairline) font-semibold text-xs shadow-sm">
 📝 5 Rounds · {totalQuestions} Questions
 </span>
 {badges.length > 0 && (
 <div className="flex items-center gap-1.5 ml-auto">
 {badges.map((b, idx) => (
 <span key={idx} title={`${b.name}: ${b.description}`} className="text-xl animate-bounce">
 {b.icon}
 </span>
 ))}
 </div>
 )}
 </div>

 {/* TAB 1: PRACTICE ROOM */}
 {viewTab === 'interview' && (
 <>
 {/* GRADE RESULT SCORECARD */}
 {gradeResult && (
 <div className="animate-in fade-in slide-in-from-bottom-6 space-y-6">
 <Card className="bg-(--primary) border border-(--hairline) shadow-md">
 <CardContent className="p-8 text-center">
 <div className="inline-block bg-(--surface-card) border border-(--hairline) rounded-xl px-4 py-1.5 font-semibold text-sm mb-4 shadow-sm">
 RECOMMENDATION: {gradeResult.hiringRecommendation || 'STRONG HIRE'}
 </div>
 <h2 className="text-4xl font-semibold mb-4">Interview Evaluation Scorecard</h2>
 <div className="inline-block bg-(--surface-card) border border-(--hairline) rounded-xl px-10 py-5 font-semibold text-6xl mb-6 shadow-md">
 {gradeResult.totalScore}/100
 </div>
 <p className="text-lg font-bold max-w-2xl mx-auto">{gradeResult.feedbackSummary}</p>

 {/* Category Breakdown */}
 {gradeResult.categoryBreakdown && (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-left">
 <div className="bg-(--surface-card) border border-(--hairline) p-3 rounded-xl shadow-sm">
 <p className="text-xs font-medium text-gray-500">Technical Accuracy</p>
 <p className="text-2xl font-semibold">{gradeResult.categoryBreakdown.technicalAccuracy || gradeResult.categoryBreakdown.technical || 85}%</p>
 </div>
 <div className="bg-(--surface-card) border border-(--hairline) p-3 rounded-xl shadow-sm">
 <p className="text-xs font-medium text-gray-500">Problem Solving</p>
 <p className="text-2xl font-semibold">{gradeResult.categoryBreakdown.problemSolving || 90}%</p>
 </div>
 <div className="bg-(--surface-card) border border-(--hairline) p-3 rounded-xl shadow-sm">
 <p className="text-xs font-medium text-gray-500">Communication</p>
 <p className="text-2xl font-semibold">{gradeResult.categoryBreakdown.communicationClarity || gradeResult.categoryBreakdown.communication || 80}%</p>
 </div>
 <div className="bg-(--surface-card) border border-(--hairline) p-3 rounded-xl shadow-sm">
 <p className="text-xs font-medium text-gray-500">Behavioral Fit</p>
 <p className="text-2xl font-semibold">{gradeResult.categoryBreakdown.behavioralFit || 88}%</p>
 </div>
 </div>
 )}
 </CardContent>
 </Card>

 {/* Action Plan & Strengths */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {gradeResult.strengths?.length > 0 && (
 <Card className="bg-emerald-50 border border-(--hairline) shadow-sm">
 <CardContent className="p-6">
 <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
 <Award className="w-6 h-6 text-emerald-700" /> Key Strengths
 </h3>
 <ul className="space-y-2">
 {gradeResult.strengths.map((str, idx) => (
 <li key={idx} className="flex items-start gap-2 font-medium text-sm">
 <span className="font-semibold text-emerald-700">✓</span> {str}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}

 {gradeResult.actionPlan?.length > 0 && (
 <Card className="bg-blue-50 border border-(--hairline) shadow-sm">
 <CardContent className="p-6">
 <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
 <Zap className="w-6 h-6 text-blue-700" /> High-Impact Action Plan
 </h3>
 <ul className="space-y-2">
 {gradeResult.actionPlan.map((act, idx) => (
 <li key={idx} className="flex items-start gap-2 font-medium text-sm">
 <span className="font-semibold text-blue-700">→</span> {act}
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 )}
 </div>

 {/* Detailed Round Feedback */}
 {gradeResult.rounds?.map((round, i) => (
 <Card key={i} className="border border-(--hairline) shadow-sm">
 <CardContent className="p-6">
 <div className="flex justify-between items-center mb-6 border-b border-(--hairline) pb-4">
 <h3 className="text-2xl font-semibold">{round.title}</h3>
 <span className="font-bold text-lg bg-(--accent-amber) text-white px-4 py-1 border border-(--hairline) shadow-sm">
 Score: {round.score}/100
 </span>
 </div>
 <div className="space-y-6">
 {round.questionFeedback?.map((qf, j) => {
 const originalQ = displayResult.rounds[i]?.questions?.find(q => q.id === qf.questionId);
 return (
 <div key={j} className="border border-(--hairline) p-5 relative bg-gray-50">
 <span className="absolute -top-3.5 -left-3.5 w-8 h-8 bg-(--primary-active) text-black border border-(--hairline) font-semibold flex items-center justify-center rounded-full shadow-sm">
 {qf.score}
 </span>
 <p className="font-semibold text-base mb-2 ml-4">Q: {originalQ?.question}</p>
 <p className="text-(--body) italic mb-4 ml-4 bg-(--surface-soft) p-3 rounded-xl border border-(--hairline-soft) font-normal">
 &quot;{answers[qf.questionId] || 'No answer provided'}&quot;
 </p>
 <div className="bg-(--accent-teal) border border-(--hairline) p-3 ml-4">
 <p className="font-bold text-sm text-emerald-950">{qf.feedback}</p>
 {qf.keyMissingPoint && (
 <p className="text-xs font-semibold text-red-700 mt-2">
 ⚠️ Missed Opportunity: {qf.keyMissingPoint}
 </p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </CardContent>
 </Card>
 ))}

 <div className="flex flex-wrap justify-center gap-4 mt-8">
 <Button 
 onClick={() => { setViewTab('solutions'); interviewAudio.playClick(); }} 
 className="text-base px-6 py-3 border border-(--hairline) bg-(--accent-teal) text-black shadow-sm font-semibold"
 >
 <BookOpen className="w-4 h-4 mr-2" /> View All Ideal Solutions & Code
 </Button>
 <Button 
 variant="outline" 
 onClick={() => { setGradeResult(null); resetJob(); setHistoryResult(null); }} 
 className="text-base px-6 py-3 border border-(--hairline) bg-white hover:bg-gray-100 text-black shadow-sm font-semibold"
 >
 <RotateCcw className="w-4 h-4 mr-2" /> Retake Another Simulation
 </Button>
 </div>
 </div>
 )}

 {/* ACTIVE QUESTION INTERACTION PANE */}
 {!gradeResult && currentQ && (
 <div className="space-y-6">
 {/* Round Overview Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
 {displayResult.rounds.map((round, rIdx) => {
 const config = ROUND_CONFIG[round.type] || ROUND_CONFIG.aptitude;
 const Icon = config.icon;
 const roundAnswered = round.questions?.filter(q => answers[q.id]?.length > 0).length || 0;
 const roundTotal = round.questions?.length || 0;
 const isComplete = roundAnswered === roundTotal && roundTotal > 0;
 return (
 <button
 key={rIdx}
 onClick={() => { setActiveRound(rIdx); setActiveQuestion(0); interviewAudio.playClick(); }}
 className={`p-3 border border-(--hairline) text-left transition-all hover:-translate-y-0.5 hover:shadow-sm ${
 rIdx === activeRound 
 ? 'bg-(--primary) shadow-sm scale-[1.02]' 
 : isComplete 
 ? 'bg-(--success)/30' 
 : `${config.color}`
 }`}
 >
 <Icon className="w-5 h-5 mb-1 text-black" />
 <p className="font-semibold text-xs leading-tight">{config.label}</p>
 <p className="text-[10px] font-bold text-gray-700 mt-1">{roundAnswered}/{roundTotal} Completed</p>
 {isComplete && <CheckCircle className="w-4 h-4 text-emerald-800 mt-1" />}
 </button>
 );
 })}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
 {/* Sidebar Question Nav */}
 <div className="lg:col-span-4 space-y-4">
 <Card className="border border-(--hairline) shadow-sm">
 <CardContent className="p-4">
 <h3 className="font-semibold text-lg mb-3 border-b border-(--hairline) pb-2 flex items-center justify-between">
 <span>Interview Stages</span>
 <span className="text-xs bg-gray-100 px-2 py-0.5 border border-(--hairline) font-bold">5 Rounds</span>
 </h3>
 <div className="space-y-4">
 {displayResult.rounds.map((round, rIdx) => {
 const config = ROUND_CONFIG[round.type] || ROUND_CONFIG.aptitude;
 return (
 <div key={rIdx} className={`p-2.5 border ${rIdx === activeRound ? 'border-(--primary) bg-(--surface-soft) text-(--ink) font-medium' : 'border-(--hairline-soft) text-(--muted)'}`}>
 <div className="flex items-center justify-between gap-2 mb-2">
 <h4 className={`font-semibold text-xs truncate ${rIdx === activeRound ? 'text-black' : 'text-gray-600'}`}>
 {round.title}
 </h4>
 <span className={`text-[9px] font-semibold px-1.5 py-0.5 border border-(--hairline) shrink-0 ${config.color}`}>
 {config.label}
 </span>
 </div>
 <div className="flex gap-2">
 {round.questions.map((q, qIdx) => {
 const isCurrent = rIdx === activeRound && qIdx === activeQuestion;
 const isAnswered = answers[q.id]?.length > 0;
 return (
 <button 
 key={qIdx} 
 onClick={() => { setActiveRound(rIdx); setActiveQuestion(qIdx); interviewAudio.playClick(); }}
 className={`w-7 h-7 border border-(--hairline) font-semibold text-xs flex items-center justify-center transition-all ${
 isCurrent 
 ? 'bg-(--primary) shadow-sm scale-110' 
 : isAnswered 
 ? 'bg-(--success) text-black' 
 : 'bg-(--surface-card) text-(--ink) hover:bg-(--surface-soft)'
 }`}
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

 {/* Question Interaction Area */}
 <div className="lg:col-span-8">
 {/* Question Header */}
 <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
 <h2 className="text-xl font-medium">
 {currentRound.title} — Q{activeQuestion + 1}
 </h2>
 <div className="flex items-center gap-2">
 {/* Text-to-Speech Button */}
 <button
 onClick={() => speakText(currentQ.question + (currentQ.context ? '. Context: ' + currentQ.context : ''))}
 className={`px-2.5 py-1 border border-(--hairline) font-bold text-xs flex items-center gap-1.5 transition-all ${
 isSpeaking ? 'bg-purple-400 text-white animate-pulse' : 'bg-(--surface-card) text-(--ink) hover:bg-(--surface-soft)'
 }`}
 title="Listen to interviewer"
 >
 <Volume1 className="w-3.5 h-3.5" />
 {isSpeaking ? 'Reading Aloud...' : 'Read Question'}
 </button>

 {/* Countdown Timer */}
 <div className={`flex items-center gap-1 px-2.5 py-1 border border-(--hairline) font-mono font-semibold text-xs shadow-sm ${
 timer.isExpired ? 'bg-red-400 text-white animate-pulse' : timer.secondsLeft < 60 ? 'bg-orange-300' : 'bg-(--surface-card)'
 }`}>
 <Clock className="w-3.5 h-3.5" />
 {timer.formatTime()}
 </div>

 {/* Difficulty */}
 {currentQ.difficulty && (
 <span className={`text-xs font-medium px-2.5 py-1 border border-(--hairline) ${
 currentQ.difficulty === 'Hard' ? 'bg-red-300' : currentQ.difficulty === 'Medium' ? 'bg-orange-200' : 'bg-green-200'
 }`}>
 {currentQ.difficulty}
 </span>
 )}
 </div>
 </div>

 {/* Timer expired alert */}
 {timer.isExpired && (
 <div className="bg-red-100 border border-red-500 p-3 mb-4 flex items-center gap-2 animate-in fade-in">
 <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
 <span className="font-bold text-xs text-red-700">
 Target time elapsed! You can still finalize your response, but aim for conciseness in real interviews.
 </span>
 </div>
 )}

 {/* Question Card */}
 <Card className="border border-(--hairline) shadow-sm mb-6">
 <CardContent className="p-6 md:p-8 relative">
 <div className="flex items-center justify-between mb-4">
 <span className="text-xs font-medium tracking-wide px-2 py-0.5 bg-black text-white">
 {currentRound.type?.replace('_', ' ')} Question
 </span>
 {currentQ.timeMinutes && (
 <span className="text-xs font-bold text-gray-500">Suggested: {currentQ.timeMinutes} mins</span>
 )}
 </div>

 <h3 className="text-2xl md:text-3xl font-semibold leading-tight mb-4">
 &quot;{currentQ.question}&quot;
 </h3>
 
 {currentQ.context && (
 <div className="bg-slate-100 border-l border-(--hairline) p-3.5 text-left mb-6">
 <p className="text-xs font-semibold text-gray-500">Interviewer Context:</p>
 <p className="font-medium text-xs text-gray-800 mt-0.5">{currentQ.context}</p>
 </div>
 )}

 {/* Evaluation Rubrics Preview */}
 {currentQ.evaluationRubric?.length > 0 && (
 <div className="bg-blue-50/70 border border-blue-200 p-3 mb-6">
 <p className="text-[11px] font-medium text-blue-900 mb-1 flex items-center gap-1">
 <ShieldCheck className="w-3.5 h-3.5" /> What Top Interviewers Evaluate:
 </p>
 <div className="flex flex-wrap gap-2">
 {currentQ.evaluationRubric.map((rub, rIdx) => (
 <span key={rIdx} className="text-xs font-semibold bg-white border border-blue-300 px-2 py-0.5 text-blue-900">
 • {rub}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Answer Input Section */}
 <div className="text-left mt-6">
 <div className="flex justify-between items-center mb-2">
 <label className="block text-xs font-medium text-(--accent-amber)">
 Your Response
 </label>
 {currentRound.type !== 'mcq' && (
 <button
 onClick={() => toggleListening(currentQ.id)}
 className={`text-xs font-semibold px-2.5 py-1 border border-(--hairline) flex items-center gap-1.5 transition-all ${
 isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-amber-100 hover:bg-amber-200'
 }`}
 title="Toggle Speech-to-Text microphone dictation"
 >
 {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-red-600" />}
 {isListening ? 'Listening (Speak Now)...' : 'Dictate by Voice'}
 </button>
 )}
 </div>

 {/* MCQ Input Type */}
 {currentRound.type === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
 <div className="space-y-3 mt-4">
 {currentQ.options.map((opt, idx) => {
 const isSelected = answers[currentQ.id] === opt;
 const isSubmitted = mcqSubmitted[currentQ.id];
 const isCorrect = currentQ.correctOption === opt;
 let optionStyle = 'border-(--hairline) hover:bg-slate-50';
 if (isSubmitted) {
 if (isCorrect) optionStyle = 'border-emerald-600 bg-emerald-100 shadow-sm';
 else if (isSelected && !isCorrect) optionStyle = 'border-red-500 bg-red-50';
 } else if (isSelected) {
 optionStyle = 'border-(--primary) bg-(--accent-amber)/10 shadow-sm';
 }
 return (
 <label key={idx} className={`flex items-center gap-3 p-4 border cursor-pointer transition-all ${optionStyle}`}>
 <input 
 type="radio" 
 name={`mcq_${currentQ.id}`} 
 value={opt}
 checked={isSelected}
 onChange={() => { handleAnswerChange(currentQ.id, opt); interviewAudio.playClick(); }}
 disabled={isSubmitted}
 className="w-4 h-4 accent-brutal-blue"
 />
 <span className="font-bold text-sm flex-1">{String.fromCharCode(65 + idx)}. {opt}</span>
 {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-700" />}
 {isSubmitted && isSelected && !isCorrect && <span className="text-red-500 font-semibold text-sm">✗</span>}
 </label>
 );
 })}
 
 {!mcqSubmitted[currentQ.id] && answers[currentQ.id] && (
 <Button
 onClick={() => handleMcqSubmit(currentQ.id, currentQ.correctOption)}
 className="mt-2 border border-(--hairline) bg-(--accent-amber) text-white font-semibold text-xs px-4 py-2 hover:bg-blue-600"
 >
 Check MCQ Answer
 </Button>
 )}

 {mcqSubmitted[currentQ.id] && currentQ.correctOption && (
 <div className="mt-4 bg-emerald-50 border border-emerald-600 p-3.5 animate-in fade-in">
 <p className="font-semibold text-xs text-emerald-800 mb-1">✓ Correct Answer: {currentQ.correctOption}</p>
 {currentQ.idealSolution && (
 <p className="text-xs font-medium text-emerald-950 mt-1">{currentQ.idealSolution}</p>
 )}
 </div>
 )}
 </div>
 ) : currentRound.type === 'coding' ? (
 /* Coding Input Type */
 <div className="space-y-3 mt-4">
 {currentQ.starterCode && (
 <div className="bg-gray-950 text-emerald-400 p-3.5 font-mono text-xs whitespace-pre-wrap border border-(--hairline)">
 <p className="text-gray-500 text-[10px] font-bold mb-1">{"// Starter Skeleton"}</p>
 {currentQ.starterCode}
 </div>
 )}
 <textarea
 className="w-full min-h-[220px] p-4 border border-(--hairline) font-mono text-xs resize-y focus:border-(--primary) outline-none bg-(--surface-soft) text-(--ink) rounded-xl leading-relaxed"
 placeholder="// Write your code or structured solution here..."
 value={answers[currentQ.id] || ''}
 onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
 />
 {currentQ.expectedApproach && showGuidance && (
 <div className="bg-blue-50 border border-blue-400 p-3 animate-in fade-in">
 <p className="text-xs font-medium text-blue-700 mb-1">Expected Algorithmic Approach:</p>
 <p className="font-medium text-xs text-gray-800 whitespace-pre-wrap">{currentQ.expectedApproach}</p>
 </div>
 )}
 </div>
 ) : (
 /* Textarea for Project, Aptitude, Behavioral */
 <textarea
 className="w-full min-h-[160px] p-4 border border-(--hairline) font-medium text-sm resize-y focus:border-(--primary) outline-none bg-(--surface-soft) text-(--ink) rounded-xl leading-relaxed"
 placeholder={
 currentRound.type === 'behavioral' 
 ?"Apply the STAR method: Situation, Task, Action, Result..." 
 :"Type or dictate your detailed response here..."
 }
 value={answers[currentQ.id] || ''}
 onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
 />
 )}
 </div>
 </CardContent>
 </Card>

 {/* Progressive Hints Section */}
 {currentQ.hints && currentQ.hints.length > 0 && (
 <div className="mb-4">
 <button 
 onClick={() => {
 setShowHints(prev => Math.min(prev + 1, currentQ.hints.length));
 interviewAudio.playClick();
 }} 
 className="flex items-center gap-2 text-xs font-semibold text-amber-900 bg-amber-200 border border-(--hairline) px-3 py-1.5 hover:bg-amber-300 transition-colors shadow-sm"
 disabled={showHints >= currentQ.hints.length}
 >
 <Lightbulb className="w-3.5 h-3.5" />
 {showHints >= currentQ.hints.length ? `All ${currentQ.hints.length} Hints Revealed` : `Reveal Progressive Hint (${showHints + 1}/${currentQ.hints.length})`}
 </button>
 
 {showHints > 0 && (
 <div className="mt-3 space-y-2">
 {currentQ.hints.slice(0, showHints).map((hint, idx) => (
 <div key={idx} className="bg-amber-50 border-l border-amber-500 p-3 animate-in fade-in slide-in-from-left-2 duration-300">
 <p className="text-xs font-semibold text-amber-900">Hint #{idx + 1}:</p>
 <p className="font-medium text-xs text-gray-800 mt-0.5">{hint}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Expected Answer Guidance Toggle */}
 <div className="mb-6">
 <button 
 onClick={() => { setShowGuidance(!showGuidance); interviewAudio.playClick(); }} 
 className="text-xs font-semibold text-(--accent-amber) underline decoration-2 underline-offset-4 hover:text-blue-700"
 >
 {showGuidance ? 'Hide Answer Guidance ▲' : 'Show Answer Key & Guidance ▼'}
 </button>
 {showGuidance && currentQ.expectedAnswerGuidance && (
 <div className="mt-3 bg-(--accent-teal)/30 border border-(--hairline) p-4 animate-in fade-in duration-300">
 <p className="text-xs font-medium text-gray-700 mb-1">Expected Answer Criteria:</p>
 <p className="font-medium text-xs text-gray-900 whitespace-pre-wrap">{currentQ.expectedAnswerGuidance}</p>
 </div>
 )}
 </div>

 {/* Navigation Buttons */}
 <div className="flex justify-between items-center border-t border-(--hairline) pt-5">
 <Button 
 variant="ghost" 
 onClick={prevQuestion} 
 disabled={activeRound === 0 && activeQuestion === 0} 
 className="border border-(--hairline) font-semibold text-xs"
 >
 Previous Question
 </Button>
 
 {activeRound === displayResult.rounds.length - 1 && activeQuestion === currentRound.questions.length - 1 ? (
 <Button 
 onClick={submitForGrading} 
 disabled={isGrading} 
 className="border border-(--hairline) font-semibold text-xs bg-(--success) text-black hover:bg-emerald-400 shadow-sm"
 >
 {isGrading ? 'Grading 5 Rounds...' : 'Finalize & Grade Interview'} <CheckCircle className="w-4 h-4 ml-1.5" />
 </Button>
 ) : (
 <Button 
 onClick={nextQuestion} 
 className="border border-(--hairline) font-semibold text-xs bg-(--accent-amber) text-white hover:bg-blue-600 shadow-sm"
 >
 Next Question <ChevronRight className="w-4 h-4 ml-1" />
 </Button>
 )}
 </div>
 </div>
 </div>
 </div>
 )}
 </>
 )}

 {/* TAB 2: FULL SOLUTIONS & MODEL ANSWERS */}
 {viewTab === 'solutions' && (
 <div className="space-y-6 animate-in fade-in">
 <div className="bg-(--accent-teal) border border-(--hairline) p-6 shadow-md">
 <h2 className="text-3xl font-medium mb-2">Master Solution Key & Model Code</h2>
 <p className="font-bold text-sm text-gray-800">
 Exemplary answers, step-by-step logic derivations, Big-O complexity analyses, and evaluation benchmarks for all 5 rounds.
 </p>
 </div>

 {/* Round Filter Tabs */}
 <div className="flex flex-wrap gap-2">
 {displayResult.rounds.map((r, rIdx) => (
 <button
 key={rIdx}
 onClick={() => { setSelectedSolutionRound(rIdx); interviewAudio.playClick(); }}
 className={`px-4 py-2 border border-(--hairline) font-semibold text-xs transition-all ${
 selectedSolutionRound === rIdx ? 'bg-(--primary) shadow-sm' : 'bg-(--surface-card) text-(--ink) hover:bg-(--surface-soft)'
 }`}
 >
 {r.title}
 </button>
 ))}
 </div>

 {/* Questions in selected round */}
 <div className="space-y-6">
 {displayResult.rounds[selectedSolutionRound]?.questions?.map((q, qIdx) => (
 <Card key={qIdx} className="border border-(--hairline) shadow-sm">
 <CardContent className="p-6">
 <div className="flex justify-between items-start gap-3 mb-4 border-b border-gray-200 pb-3">
 <div>
 <span className="text-xs font-medium bg-black text-white px-2 py-0.5 mr-2">
 Q{qIdx + 1}
 </span>
 <span className="text-xs font-bold text-gray-500">{q.difficulty} · {q.timeMinutes || 5} min</span>
 <h3 className="text-xl font-semibold mt-2">&quot;{q.question}&quot;</h3>
 </div>
 <Button
 onClick={() => copyToClipboard(q.idealSolution || q.expectedAnswerGuidance, q.id)}
 variant="outline"
 className="border border-(--hairline) text-xs font-bold gap-1 shrink-0"
 >
 {copiedSolutionId === q.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
 {copiedSolutionId === q.id ? 'Copied' : 'Copy Solution'}
 </Button>
 </div>

 {/* Ideal Solution Box */}
 <div className="space-y-4">
 <div className="bg-emerald-50 border border-emerald-600 p-4">
 <p className="text-xs font-medium text-emerald-800 mb-2 flex items-center gap-1.5">
 <Award className="w-4 h-4" /> Textbook Ideal Solution:
 </p>
 <div className="font-mono text-xs whitespace-pre-wrap text-emerald-400 leading-relaxed bg-(--surface-card) p-3 rounded-xl border border-emerald-500/20">
 {q.idealSolution || q.expectedAnswerGuidance || 'Refer to model guidelines above.'}
 </div>
 </div>

 {/* Candidate's submitted response comparison */}
 {answers[q.id] && (
 <div className="bg-(--surface-soft) border border-(--hairline) rounded-xl p-3.5">
 <p className="text-xs font-medium text-(--muted) mb-1">Your Submitted Response:</p>
 <p className="font-medium text-xs italic bg-(--surface-card) p-2.5 rounded-lg border border-(--hairline-soft) text-(--ink)">
 &quot;{answers[q.id]}&quot;
 </p>
 </div>
 )}

 {/* Key Takeaway & Golden Tip */}
 {q.keyTakeaway && (
 <div className="bg-purple-50 border border-purple-400 p-3">
 <p className="text-xs font-medium text-purple-900 mb-1 flex items-center gap-1">
 <Star className="w-3.5 h-3.5 text-purple-700" /> Golden Interview Takeaway:
 </p>
 <p className="text-xs font-medium text-purple-950">{q.keyTakeaway}</p>
 </div>
 )}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* TAB 3: INTERVIEW CHEAT SHEET */}
 {viewTab === 'cheatsheet' && (
 <div className="space-y-6 animate-in fade-in">
 <div className="bg-purple-200 border border-(--hairline) p-6 shadow-md flex justify-between items-center">
 <div>
 <h2 className="text-3xl font-medium mb-1">Personalized Interview Cheat Sheet</h2>
 <p className="font-bold text-xs text-gray-800">
 Consolidated core principles, technical rubrics, and high-yield takeaways for {displayResult.detectedDomain || 'your target role'}.
 </p>
 </div>
 <Button
 onClick={() => window.print()}
 className="border border-(--hairline) bg-white text-black font-semibold text-xs shadow-sm hover:bg-gray-100 hidden sm:flex items-center gap-1.5"
 >
 <Printer className="w-4 h-4" /> Print / Save PDF
 </Button>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {displayResult.rounds.map((round, rIdx) => (
 <Card key={rIdx} className="border border-(--hairline) shadow-sm">
 <CardContent className="p-6">
 <h3 className="text-xl font-medium mb-3 border-b border-(--hairline) pb-2 flex items-center gap-2">
 <span>{round.title}</span>
 </h3>
 <div className="space-y-3">
 {round.questions.map((q, qIdx) => (
 <div key={qIdx} className="border-l border-(--hairline) pl-3 py-1">
 <p className="font-bold text-xs text-gray-900">{q.question}</p>
 {q.keyTakeaway && (
 <p className="text-[11px] text-purple-900 font-semibold mt-1">
 💡 <span className="font-semibold">Takeaway:</span> {q.keyTakeaway}
 </p>
 )}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </ToolPageLayout>
 );
}
