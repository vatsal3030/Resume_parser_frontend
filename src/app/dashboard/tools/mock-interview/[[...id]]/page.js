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
import { StructuredQuestion } from '@/components/ui/StructuredQuestion';
import { StructuredSolution } from '@/components/ui/StructuredSolution';

// Round type configuration
const ROUND_CONFIG = {
  aptitude: { icon: Brain, badge: 'bg-amber-500/15 text-amber-500 border-amber-500/30', card: 'hover:border-amber-500/40 bg-(--surface-card)', label: 'Aptitude & Logic' },
  mcq: { icon: Target, badge: 'bg-blue-500/15 text-blue-500 border-blue-500/30', card: 'hover:border-blue-500/40 bg-(--surface-card)', label: 'Technical MCQ' },
  coding: { icon: Code2, badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30', card: 'hover:border-emerald-500/40 bg-(--surface-card)', label: 'Coding & Systems' },
  technical: { icon: Code2, badge: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/30', card: 'hover:border-indigo-500/40 bg-(--surface-card)', label: 'Technical Core' },
  project_discussion: { icon: MessageSquare, badge: 'bg-purple-500/15 text-purple-500 border-purple-500/30', card: 'hover:border-purple-500/40 bg-(--surface-card)', label: 'Project Deep Dive' },
  behavioral: { icon: Users, badge: 'bg-rose-500/15 text-rose-500 border-rose-500/30', card: 'hover:border-rose-500/40 bg-(--surface-card)', label: 'HR & Behavioral' },
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
 const [showRubrics, setShowRubrics] = useState(false);
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
	const baseTextRef = useRef('');

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
 const toggleListening = async (questionId) => {
		if (typeof window === 'undefined') return;
		
		// If already listening, stop cleanly
		if (isListening) {
			if (recognitionRef.current) {
				try {
					recognitionRef.current.stop();
				} catch (e) {
					recognitionRef.current.abort();
				}
				recognitionRef.current = null;
			}
			setIsListening(false);
			toast.success('Dictation Saved', 'Voice recording finished and saved to your answer.');
			return;
		}

		const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			toast.warning('Browser Unsupported', 'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
			return;
		}

		// Explicitly request microphone access if supported
		if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
				stream.getTracks().forEach(t => t.stop());
			} catch (micErr) {
				console.warn('Microphone permission warning:', micErr);
				if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
					toast.error('Microphone Blocked', 'Please grant microphone access in your browser address bar.');
					return;
				}
			}
		}

		try {
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';

			// Save baseline text at the start of this dictation session
			baseTextRef.current = answers[questionId] || '';

			recognition.onstart = () => {
				setIsListening(true);
				interviewAudio.playClick();
				toast.info('Listening...', 'Speak clearly into your microphone.');
			};

			recognition.onresult = (event) => {
				let interim = '';
				let final = '';

				for (let i = 0; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;
					if (event.results[i].isFinal) {
						final += transcript + ' ';
					} else {
						interim += transcript;
					}
				}

				const base = baseTextRef.current.trim();
				const speech = (final + interim).trim();
				const fullText = base ? `${base} ${speech}` : speech;

				setAnswers(prev => ({
					...prev,
					[questionId]: fullText
				}));
			};

			recognition.onerror = (event) => {
				console.error('Speech recognition error:', event.error);
				if (event.error === 'no-speech') {
					return;
				}
				if (event.error === 'not-allowed') {
					toast.error('Microphone Blocked', 'Microphone access was denied. Please allow microphone access.');
				} else if (event.error === 'network') {
					toast.error('Speech Network Issue', 'Browser speech service was unable to connect. Check internet connection.');
				} else {
					toast.error('Voice Input Error', `Voice recognition error: ${event.error}`);
				}
				setIsListening(false);
				recognitionRef.current = null;
			};

			recognition.onend = () => {
				setIsListening(false);
				recognitionRef.current = null;
			};

			recognitionRef.current = recognition;
			recognition.start();
			unlockBadge('Voice Pioneer', '🎙️', 'Practiced using live voice response');
		} catch (err) {
			console.error('Speech recognition start failed:', err);
			setIsListening(false);
			recognitionRef.current = null;
			toast.error('Mic Error', 'Could not initialize microphone. Please check permissions.');
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
 setShowRubrics(false);
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
 if (inputs.targetRole || inputs.role) setTargetRole(inputs.targetRole || inputs.role);
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

 const activeResult = historyResult || (status === JOB_STATUS.COMPLETED ? { id: jobId, aiJobId: jobId, outputPayload: result, inputSummary: { resumeId: selectedResume, targetRole }, modelUsed: modelId, createdAt: new Date().toISOString() } : null);
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
 className="border border-(--hairline) p-2 rounded-xl bg-(--surface-card) hover:bg-(--surface-soft) text-(--ink) shadow-2xs transition-colors"
 title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
 >
 {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
 </Button>
 </div>
 }
 >
 {/* UNIFIED MINIMALIST STATS BAR */}
      {(displayResult?.rounds?.length > 0 || status === JOB_STATUS.COMPLETED) && (
        <div className="bg-(--surface-card) border border-(--hairline) p-4 rounded-2xl shadow-2xs mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center font-bold text-sm shrink-0">
              L{userLevel}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-(--ink)">
                  {currentRound ? currentRound.title : '5-Stage Simulation'}
                </span>
                <span className="text-[11px] bg-(--surface-soft) text-(--muted) border border-(--hairline) px-2 py-0.5 rounded-full font-medium">
                  Stage {activeRound + 1} of {displayResult?.rounds?.length || 5}
                </span>
              </div>
              <p className="text-xs text-(--muted) mt-0.5">
                {answeredQuestions} of {totalQuestions} Questions Answered ({progressPct}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-xs md:max-w-sm">
            <div className="w-full">
              <div className="flex justify-between items-center text-[11px] text-(--muted) mb-1 font-medium">
                <span>Simulation Progress</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full h-2 bg-(--surface-soft) rounded-full overflow-hidden">
                <div 
                  className="h-full bg-(--primary) transition-all duration-300 rounded-full" 
                  style={{ width: `${progressPct}%` }} 
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
            <div className="flex items-center gap-1.5 bg-(--surface-soft) border border-(--hairline) px-3 py-1.5 rounded-xl text-xs font-medium text-(--ink)">
              <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'text-amber-500' : 'text-(--muted)'}`} />
              <span>{streak} Streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-(--surface-soft) border border-(--hairline) px-3 py-1.5 rounded-xl text-xs font-medium text-(--ink)">
              <Trophy className="w-3.5 h-3.5 text-(--primary)" />
              <span>{xp} XP</span>
            </div>
            {badges.length > 0 && (
              <div className="flex items-center gap-1 ml-1" title={`${badges.length} Badges Unlocked`}>
                {badges.slice(-3).map((b, idx) => (
                  <span key={idx} className="text-base" title={b.name}>{b.icon}</span>
                ))}
              </div>
            )}
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
 <div className="flex items-center gap-1 bg-(--surface-soft) p-1 rounded-xl border border-(--hairline) shadow-2xs">
 <button
 onClick={() => { setViewTab('interview'); interviewAudio.playClick(); }}
 className={`px-3.5 py-1.5 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
 viewTab === 'interview' 
 ? 'bg-(--surface-card) text-(--ink) border border-(--hairline) shadow-xs font-semibold' 
 : 'text-(--muted) hover:text-(--ink)'
 }`}
 >
 <MessageSquare className="w-3.5 h-3.5 text-(--primary)" /> Practice Room
 </button>
 <button
 onClick={() => { setViewTab('solutions'); interviewAudio.playClick(); }}
 className={`px-3.5 py-1.5 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
 viewTab === 'solutions' 
 ? 'bg-(--surface-card) text-(--ink) border border-(--hairline) shadow-xs font-semibold' 
 : 'text-(--muted) hover:text-(--ink)'
 }`}
 >
 <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Model Solutions
 </button>
 <button
 onClick={() => { setViewTab('cheatsheet'); interviewAudio.playClick(); }}
 className={`px-3.5 py-1.5 font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
 viewTab === 'cheatsheet' 
 ? 'bg-(--surface-card) text-(--ink) border border-(--hairline) shadow-xs font-semibold' 
 : 'text-(--muted) hover:text-(--ink)'
 }`}
 >
 <FileText className="w-3.5 h-3.5 text-purple-500" /> Interview Cheat Sheet
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
 <div className="flex flex-wrap items-center gap-2.5">
 {displayResult.detectedDomain && (
 <span className="px-3 py-1 bg-(--surface-card) border border-(--hairline) font-medium text-xs text-(--ink) rounded-full shadow-2xs">
 🎯 Domain: <strong className="text-(--primary)">{displayResult.detectedDomain}</strong>
 </span>
 )}
 {displayResult.interviewLevel && (
 <span className="px-3 py-1 bg-(--surface-card) border border-(--hairline) font-medium text-xs text-(--ink) rounded-full shadow-2xs">
 📊 Level: <strong className="text-blue-500">{displayResult.interviewLevel}</strong>
 </span>
 )}
 <span className="px-3 py-1 bg-(--surface-card) border border-(--hairline) font-medium text-xs text-(--muted) rounded-full shadow-2xs">
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
                <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-xl">
                  <CardContent className="p-8 text-center">
                    <div className="inline-block bg-(--primary)/10 border border-(--primary)/30 text-(--primary) rounded-full px-4 py-1.5 font-semibold text-xs mb-4 shadow-2xs">
                      RECOMMENDATION: {gradeResult.hiringRecommendation || 'STRONG HIRE'}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-(--ink) mb-4">Interview Evaluation Scorecard</h2>
                    <div className="inline-block bg-(--surface-soft) border border-(--hairline) rounded-2xl px-10 py-5 font-bold text-5xl md:text-6xl text-(--primary) mb-6 shadow-sm">
                      {gradeResult.totalScore}/100
                    </div>
                    <p className="text-base sm:text-lg font-medium text-(--ink) max-w-2xl mx-auto leading-relaxed">{gradeResult.feedbackSummary}</p>

                    {/* Category Breakdown */}
                    {gradeResult.categoryBreakdown && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 text-left">
                        <div className="bg-(--surface-soft)/60 border border-(--hairline) p-4 rounded-xl shadow-2xs">
                          <p className="text-xs font-medium text-(--muted)">Technical Accuracy</p>
                          <p className="text-2xl font-bold text-(--ink) mt-1">{gradeResult.categoryBreakdown.technicalAccuracy || gradeResult.categoryBreakdown.technical || 85}%</p>
                        </div>
                        <div className="bg-(--surface-soft)/60 border border-(--hairline) p-4 rounded-xl shadow-2xs">
                          <p className="text-xs font-medium text-(--muted)">Problem Solving</p>
                          <p className="text-2xl font-bold text-(--ink) mt-1">{gradeResult.categoryBreakdown.problemSolving || 90}%</p>
                        </div>
                        <div className="bg-(--surface-soft)/60 border border-(--hairline) p-4 rounded-xl shadow-2xs">
                          <p className="text-xs font-medium text-(--muted)">Communication</p>
                          <p className="text-2xl font-bold text-(--ink) mt-1">{gradeResult.categoryBreakdown.communicationClarity || gradeResult.categoryBreakdown.communication || 80}%</p>
                        </div>
                        <div className="bg-(--surface-soft)/60 border border-(--hairline) p-4 rounded-xl shadow-2xs">
                          <p className="text-xs font-medium text-(--muted)">Behavioral Fit</p>
                          <p className="text-2xl font-bold text-(--ink) mt-1">{gradeResult.categoryBreakdown.behavioralFit || 88}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Action Plan & Strengths */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {gradeResult.strengths?.length > 0 && (
                    <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-(--ink) mb-4 flex items-center gap-2">
                          <Award className="w-5 h-5 text-emerald-500" /> Key Strengths
                        </h3>
                        <ul className="space-y-2.5">
                          {gradeResult.strengths.map((str, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-(--ink) leading-relaxed">
                              <span className="font-bold text-emerald-500 shrink-0">✓</span> {str}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {gradeResult.actionPlan?.length > 0 && (
                    <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
                      <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-(--ink) mb-4 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-blue-500" /> High-Impact Action Plan
                        </h3>
                        <ul className="space-y-2.5">
                          {gradeResult.actionPlan.map((act, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-(--ink) leading-relaxed">
                              <span className="font-bold text-blue-500 shrink-0">→</span> {act}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Detailed Round Feedback */}
                {gradeResult.rounds?.map((round, i) => (
                  <Card key={i} className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center mb-6 border-b border-(--hairline-soft) pb-4">
                        <h3 className="text-xl font-bold text-(--ink)">{round.title}</h3>
                        <span className="font-semibold text-sm bg-(--primary)/15 text-(--primary) border border-(--primary)/30 px-3.5 py-1 rounded-full">
                          Score: {round.score}/100
                        </span>
                      </div>
                      <div className="space-y-6">
                        {round.questionFeedback?.map((qf, j) => {
                          const originalQ = displayResult.rounds[i]?.questions?.find(q => q.id === qf.questionId);
                          return (
                            <div key={j} className="border border-(--hairline) rounded-xl p-5 relative bg-(--surface-soft)/40">
                              <span className="absolute -top-3.5 -left-3 w-8 h-8 bg-(--surface-card) text-(--primary) border border-(--hairline) font-bold text-xs flex items-center justify-center rounded-full shadow-xs">
                                {qf.score}
                              </span>
                              <p className="font-semibold text-base text-(--ink) mb-2 ml-4">Q: {originalQ?.question}</p>
                              <p className="text-(--muted) italic mb-4 ml-4 bg-(--surface-card) p-3 rounded-xl border border-(--hairline-soft) text-sm font-normal">
                                &quot;{answers[qf.questionId] || 'No answer provided'}&quot;
                              </p>
                              <div className="bg-(--surface-card) border border-(--hairline) rounded-xl p-4 ml-4">
                                <p className="font-medium text-sm text-(--ink) leading-relaxed">{qf.feedback}</p>
                                {qf.keyMissingPoint && (
                                  <p className="text-xs font-semibold text-amber-500 mt-2 flex items-center gap-1.5">
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
                    className="text-sm px-6 py-2.5 rounded-xl border border-(--hairline) bg-(--primary) text-white shadow-sm font-semibold hover:bg-(--primary-hover)"
                  >
                    <BookOpen className="w-4 h-4 mr-2" /> View All Ideal Solutions & Code
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setGradeResult(null); resetJob(); setHistoryResult(null); }} 
                    className="text-sm px-6 py-2.5 rounded-xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) text-(--ink) shadow-sm font-medium"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" /> Retake Another Simulation
                  </Button>
                </div>
              </div>
            )}

            {/* ACTIVE QUESTION INTERACTION PANE */}
            {!gradeResult && currentQ && (
              <div className="space-y-6">
                {/* 1. HORIZONTAL 5-STAGE TRACK */}
                <div className="bg-(--surface-card) border border-(--hairline) p-2.5 rounded-2xl shadow-2xs">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {displayResult.rounds.map((round, rIdx) => {
                      const config = ROUND_CONFIG[round.type] || ROUND_CONFIG.aptitude;
                      const Icon = config.icon;
                      const roundAnswered = round.questions?.filter(q => answers[q.id]?.length > 0).length || 0;
                      const roundTotal = round.questions?.length || 0;
                      const isComplete = roundAnswered === roundTotal && roundTotal > 0;
                      const isCurrent = rIdx === activeRound;

                      return (
                        <button
                          key={rIdx}
                          onClick={() => { setActiveRound(rIdx); setActiveQuestion(0); interviewAudio.playClick(); }}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                            isCurrent
                              ? 'bg-(--primary) text-white border-(--primary) shadow-xs'
                              : isComplete
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-(--ink) hover:bg-emerald-500/15'
                              : 'bg-(--surface-soft)/50 border-(--hairline-soft) text-(--ink) hover:bg-(--surface-soft) hover:border-(--hairline)'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? 'bg-white/20 text-white'
                              : isComplete
                              ? 'bg-emerald-500/20 text-emerald-500'
                              : 'bg-(--surface-card) text-(--muted)'
                          }`}>
                            {isComplete ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Icon className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-white' : 'text-(--ink)'}`}>
                              {round.title}
                            </p>
                            <p className={`text-[10px] mt-0.5 font-medium ${isCurrent ? 'text-white/80' : 'text-(--muted)'}`}>
                              {roundAnswered}/{roundTotal} done
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. QUESTION HEADER & CONTROLS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-(--muted)">
                      {currentRound.title}:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {currentRound.questions.map((q, qIdx) => {
                        const isCurrent = qIdx === activeQuestion;
                        const isAnswered = answers[q.id]?.length > 0;
                        return (
                          <button
                            key={qIdx}
                            onClick={() => { setActiveQuestion(qIdx); interviewAudio.playClick(); }}
                            className={`h-8 px-3 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-(--primary) text-white border-(--primary) shadow-xs scale-105'
                                : isAnswered
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                : 'bg-(--surface-card) text-(--muted) border-(--hairline) hover:text-(--ink) hover:bg-(--surface-soft)'
                            }`}
                          >
                            {isAnswered && <Check className="w-3 h-3 text-emerald-500" />}
                            <span>Q{qIdx + 1}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Question Controls: Voice Read, Timer, Difficulty */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakText(currentQ.question + (currentQ.context ? '. Context: ' + currentQ.context : ''))}
                      className={`h-8 px-3 rounded-xl border border-(--hairline) font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSpeaking 
                          ? 'bg-purple-500 text-white animate-pulse' 
                          : 'bg-(--surface-card) text-(--ink) hover:bg-(--surface-soft)'
                      }`}
                      title="Read question aloud"
                    >
                      <Volume1 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Reading...' : 'Read Aloud'}</span>
                    </button>

                    <div className={`h-8 flex items-center gap-1.5 px-3 rounded-xl border border-(--hairline) font-mono font-semibold text-xs shadow-2xs ${
                      timer.isExpired 
                        ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 animate-pulse' 
                        : timer.secondsLeft < 60 
                        ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' 
                        : 'bg-(--surface-card) text-(--ink)'
                    }`}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timer.formatTime()}</span>
                    </div>

                    {currentQ.difficulty && (
                      <span className={`h-8 px-3 rounded-xl border text-xs font-semibold flex items-center ${
                        currentQ.difficulty.toLowerCase() === 'hard' 
                          ? 'bg-rose-500/15 text-rose-500 border-rose-500/30' 
                          : currentQ.difficulty.toLowerCase() === 'medium' 
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/30' 
                          : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      }`}>
                        {currentQ.difficulty}
                      </span>
                    )}
                  </div>
                </div>

                {/* 3. FOCUSED QUESTION & RESPONSE CARD */}
                <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm overflow-hidden">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    {/* Category Eyebrow */}
                    <div className="flex items-center justify-between border-b border-(--hairline-soft) pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-(--primary) flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> {currentRound.type?.replace('_', ' ')} Stage
                      </span>
                      {currentQ.timeMinutes && (
                        <span className="text-xs text-(--muted) font-medium">
                          Suggested: ~{currentQ.timeMinutes} mins
                        </span>
                      )}
                    </div>

                    {/* Question Statement — Claude & ChatGPT Structured Scannable Format */}
                    <StructuredQuestion 
                      question={currentQ.question} 
                      context={currentQ.context} 
                    />

                    {/* Response Input Area */}
                    <div className="text-left pt-2">
                      <div className="flex justify-between items-center mb-2.5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-(--muted)">
                          Your Answer
                        </label>
                        {currentRound.type !== 'mcq' && (
                          <button
                            onClick={() => toggleListening(currentQ.id)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-xl border border-(--hairline) flex items-center gap-1.5 transition-all cursor-pointer ${
                              isListening 
                                ? 'bg-rose-500 text-white animate-pulse' 
                                : 'bg-(--surface-soft) text-(--ink) hover:bg-(--surface-card)'
                            }`}
                            title="Toggle Speech-to-Text microphone dictation"
                          >
                            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-rose-500" />}
                            <span>{isListening ? 'Listening (Speak Now)...' : 'Dictate by Voice'}</span>
                          </button>
                        )}
                      </div>

                      {/* Live Voice Dictation Status Banner */}
						{isListening && (
							<div className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium animate-pulse mb-3">
								<div className="flex items-center gap-2">
									<span className="relative flex h-2.5 w-2.5">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
									</span>
									<span>Live microphone recording active... Dictate your answer now.</span>
								</div>
								<button
									onClick={() => toggleListening(currentQ.id)}
									type="button"
									className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
								>
									Done Speaking
								</button>
							</div>
						)}

						{/* A. MCQ OPTIONS */}
                      {currentRound.type === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
                        <div className="space-y-2.5 mt-3">
                          {currentQ.options.map((opt, idx) => {
                            const isSelected = answers[currentQ.id] === opt;
                            const isSubmitted = mcqSubmitted[currentQ.id];
                            const isCorrect = currentQ.correctOption === opt;
                            let optionStyle = 'border-(--hairline) bg-(--surface-soft)/40 hover:bg-(--surface-soft) text-(--ink)';
                            if (isSubmitted) {
                              if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs font-medium';
                              else if (isSelected && !isCorrect) optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400';
                            } else if (isSelected) {
                              optionStyle = 'border-(--primary) bg-(--primary)/10 text-(--ink) shadow-xs font-medium';
                            }
                            return (
                              <label key={idx} className={`flex items-center gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${optionStyle}`}>
                                <input 
                                  type="radio" 
                                  name={`mcq_${currentQ.id}`} 
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => { handleAnswerChange(currentQ.id, opt); interviewAudio.playClick(); }}
                                  disabled={isSubmitted}
                                  className="w-4 h-4 accent-(--primary)"
                                />
                                <span className="font-semibold text-xs text-(--muted) w-5">{String.fromCharCode(65 + idx)}.</span>
                                <span className="text-sm flex-1">{opt}</span>
                                {isSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />}
                                {isSubmitted && isSelected && !isCorrect && <span className="text-rose-500 font-bold text-sm shrink-0">✗</span>}
                              </label>
                            );
                          })}
                          
                          {!mcqSubmitted[currentQ.id] && answers[currentQ.id] && (
                            <Button
                              onClick={() => handleMcqSubmit(currentQ.id, currentQ.correctOption)}
                              className="mt-3 text-xs px-5 py-2.5 rounded-xl font-medium"
                            >
                              Check MCQ Choice
                            </Button>
                          )}

                          {mcqSubmitted[currentQ.id] && currentQ.correctOption && (
                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl animate-in fade-in">
                              <p className="font-semibold text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                                ✓ Correct Answer: {currentQ.correctOption}
                              </p>
                              {currentQ.idealSolution && (
                                <p className="text-xs text-(--ink) mt-1 leading-relaxed">{currentQ.idealSolution}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ) : currentRound.type === 'coding' ? (
                        /* B. CODING INPUT */
                        <div className="space-y-3 mt-3">
                          {currentQ.starterCode && (
                            <div className="bg-(--surface-soft) p-4 font-mono text-xs whitespace-pre-wrap border border-(--hairline) rounded-xl relative group">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-(--muted) text-[11px] font-semibold">// Starter Code Skeleton</span>
                                <button
                                  onClick={() => copyToClipboard(currentQ.starterCode, 'starter')}
                                  className="text-[11px] text-(--primary) hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  <Copy className="w-3 h-3" /> Copy Starter
                                </button>
                              </div>
                              <code className="text-emerald-600 dark:text-emerald-400 block leading-relaxed">{currentQ.starterCode}</code>
                            </div>
                          )}
                          <textarea
                            className="w-full min-h-[260px] p-4 border border-(--hairline) font-mono text-sm resize-y focus:border-(--primary) outline-none bg-(--surface-soft)/50 text-(--ink) rounded-xl leading-relaxed"
                            placeholder="// Write your solution, code, or architecture design here..."
                            value={answers[currentQ.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                          />
                        </div>
                      ) : (
                        /* C. TEXT / BEHAVIORAL / PROJECT */
                        <div className="space-y-2 mt-3">
                          <textarea
                            className="w-full min-h-[200px] p-4 border border-(--hairline) text-sm md:text-base resize-y focus:border-(--primary) outline-none bg-(--surface-soft)/50 text-(--ink) rounded-xl leading-relaxed"
                            placeholder={
                              currentRound.type === 'behavioral' 
                                ? "Tip: Frame your answer with the STAR method (Situation, Task, Action, Result)..." 
                                : "Type or dictate your clear response here..."
                            }
                            value={answers[currentQ.id] || ''}
                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {/* 4. PROGRESSIVE ASSISTANCE DRAWERS (Zero clutter!) */}
                    <div className="space-y-3 pt-4 border-t border-(--hairline-soft)">
                      {/* Hints Drawer */}
                      {currentQ.hints && currentQ.hints.length > 0 && (
                        <div className="rounded-xl border border-(--hairline) overflow-hidden bg-(--surface-soft)/30">
                          <button
                            onClick={() => {
                              setShowHints(prev => Math.min(prev + 1, currentQ.hints.length));
                              interviewAudio.playClick();
                            }}
                            className="w-full flex items-center justify-between p-3.5 text-xs font-medium text-(--ink) hover:bg-(--surface-soft) transition-colors cursor-pointer"
                            disabled={showHints >= currentQ.hints.length}
                          >
                            <div className="flex items-center gap-2 text-amber-500 font-semibold">
                              <Lightbulb className="w-4 h-4" />
                              <span>
                                {showHints >= currentQ.hints.length 
                                  ? `All ${currentQ.hints.length} Hints Revealed` 
                                  : `Need a Hint? (Reveal ${showHints + 1} of ${currentQ.hints.length})`}
                              </span>
                            </div>
                            <span className="text-[11px] text-(--muted)">+ Reveal</span>
                          </button>
                          {showHints > 0 && (
                            <div className="p-3.5 pt-0 space-y-2">
                              {currentQ.hints.slice(0, showHints).map((hint, idx) => (
                                <div key={idx} className="bg-(--surface-card) border border-amber-500/25 p-3 rounded-lg text-xs leading-relaxed text-(--ink)">
                                  <span className="font-semibold text-amber-500">Hint {idx + 1}:</span> {hint}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Evaluation Rubrics Drawer */}
                      {currentQ.evaluationRubric?.length > 0 && (
                        <div className="rounded-xl border border-(--hairline) overflow-hidden bg-(--surface-soft)/30">
                          <button
                            onClick={() => setShowRubrics(prev => !prev)}
                            className="w-full flex items-center justify-between p-3.5 text-xs font-medium text-(--ink) hover:bg-(--surface-soft) transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-(--primary) font-semibold">
                              <ShieldCheck className="w-4 h-4" />
                              <span>What Top Interviewers Look For</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-(--muted) transition-transform ${showRubrics ? 'rotate-180' : ''}`} />
                          </button>
                          {showRubrics && (
                            <div className="p-3.5 pt-0 flex flex-wrap gap-2 animate-in fade-in duration-200">
                              {currentQ.evaluationRubric.map((rub, rIdx) => (
                                <span key={rIdx} className="text-xs bg-(--surface-card) border border-(--hairline) px-3 py-1.5 rounded-lg text-(--ink)">
                                  • {rub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Guidance Drawer */}
                      {currentQ.expectedAnswerGuidance && (
                        <div className="rounded-xl border border-(--hairline) overflow-hidden bg-(--surface-soft)/30">
                          <button
                            onClick={() => setShowGuidance(prev => !prev)}
                            className="w-full flex items-center justify-between p-3.5 text-xs font-medium text-(--ink) hover:bg-(--surface-soft) transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2 text-blue-500 font-semibold">
                              <HelpCircle className="w-4 h-4" />
                              <span>Expected Model Criteria</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-(--muted) transition-transform ${showGuidance ? 'rotate-180' : ''}`} />
                          </button>
                          {showGuidance && (
                            <div className="p-3.5 pt-0 animate-in fade-in duration-200">
                              <div className="bg-(--surface-card) border border-blue-500/25 p-3 rounded-lg text-xs leading-relaxed text-(--ink) whitespace-pre-wrap">
                                {currentQ.expectedAnswerGuidance}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 5. NAVIGATION CONTROLS */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-(--hairline-soft) pt-5">
                      <Button 
                        variant="outline" 
                        onClick={prevQuestion} 
                        disabled={activeRound === 0 && activeQuestion === 0} 
                        className="w-full sm:w-auto text-xs px-5 py-2.5 rounded-xl border border-(--hairline) hover:bg-(--surface-soft)"
                      >
                        ← Previous Question
                      </Button>
                      
                      <div className="text-xs text-(--muted) font-medium text-center">
                        Stage {activeRound + 1} of {displayResult.rounds.length} • Question {activeQuestion + 1} of {currentRound.questions.length}
                      </div>

                      {activeRound === displayResult.rounds.length - 1 && activeQuestion === currentRound.questions.length - 1 ? (
                        <Button 
                          onClick={submitForGrading} 
                          disabled={isGrading} 
                          className="w-full sm:w-auto text-xs font-semibold px-6 py-2.5 rounded-xl bg-(--primary) text-white hover:bg-(--primary-active) shadow-sm"
                        >
                          {isGrading ? 'Evaluating 5 Stages...' : 'Finish & Grade Interview 🎓'}
                        </Button>
                      ) : (
                        <Button 
                          onClick={nextQuestion} 
                          className="w-full sm:w-auto text-xs font-medium px-5 py-2.5 rounded-xl bg-(--primary) text-white hover:bg-(--primary-active) shadow-sm flex items-center gap-1.5"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        {/* TAB 2: FULL SOLUTIONS & MODEL ANSWERS */}
 {viewTab === 'solutions' && (
 <div className="space-y-6 animate-in fade-in">
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 md:p-8 shadow-sm">
					<h2 className="text-2xl md:text-3xl font-bold text-(--ink) mb-2">Master Solution Key & Model Code</h2>
					<p className="text-sm text-(--muted) font-normal">
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
 selectedSolutionRound === rIdx ? 'bg-(--primary) text-white shadow-xs' : 'bg-(--surface-card) text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft)'
 }`}
 >
 {r.title}
 </button>
 ))}
 </div>

 {/* Questions in selected round */}
 <div className="space-y-6">
 {displayResult.rounds[selectedSolutionRound]?.questions?.map((q, qIdx) => (
 <Card key={qIdx} className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
 <CardContent className="p-6">
 <div className="flex justify-between items-start gap-3 mb-4 border-b border-(--hairline-soft) pb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium bg-(--primary)/15 text-(--primary) border border-(--primary)/30 px-2 py-0.5 rounded-md font-medium">
                          Q{qIdx + 1}
                        </span>
                        <span className="text-xs font-semibold text-(--muted)">{q.difficulty} · {q.timeMinutes || 5} min</span>
                      </div>
                      <StructuredQuestion question={q.question} />
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

                  {/* Ideal Solution Box — Claude & ChatGPT Structured Scannable Format */}
                  <div className="space-y-4">
                    <div className="p-4 sm:p-5 rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-2xs">
                      <StructuredSolution 
                        solution={q.idealSolution} 
                        guidance={q.expectedAnswerGuidance} 
                      />
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
 <div className="bg-purple-500/10 border border-purple-500/25 p-4 rounded-xl">
 <p className="text-xs font-medium text-purple-600 dark:text-purple-400 font-semibold mb-1 flex items-center gap-1">
 <Star className="w-3.5 h-3.5 text-purple-700" /> Golden Interview Takeaway:
 </p>
 <p className="text-xs font-medium text-(--ink)">{q.keyTakeaway}</p>
 </div>
 )}
 </CardContent>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* TAB 3: INTERVIEW CHEAT SHEET */}
 {viewTab === 'cheatsheet' && (
 <div className="space-y-6 animate-in fade-in">
 <div className="bg-(--surface-card) border border-(--hairline) rounded-2xl p-6 md:p-8 shadow-sm flex justify-between items-center">
					<div>
						<h2 className="text-2xl md:text-3xl font-bold text-(--ink) mb-1.5">Personalized Interview Cheat Sheet</h2>
						<p className="text-sm text-(--muted) font-normal">
							Consolidated core principles, technical rubrics, and high-yield takeaways for {displayResult.detectedDomain || 'your target role'}.
						</p>
					</div>
					<Button
						onClick={() => window.print()}
						className="border border-(--hairline) bg-(--surface-soft) text-(--ink) hover:bg-(--surface-card) font-medium text-xs rounded-xl shadow-xs hidden sm:flex items-center gap-1.5 px-4 py-2"
					>
						<Printer className="w-4 h-4" /> Print / Save PDF
					</Button>
				</div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {displayResult.rounds.map((round, rIdx) => (
 <Card key={rIdx} className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-sm">
 <CardContent className="p-6">
 <h3 className="text-xl font-medium mb-3 border-b border-(--hairline) pb-2 flex items-center gap-2">
 <span>{round.title}</span>
 </h3>
 <div className="space-y-4">
                  {round.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-4 rounded-xl border border-(--hairline) bg-(--surface-soft)/30 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-(--primary)/10 text-(--primary) border border-(--primary)/20">
                          Q{qIdx + 1}
                        </span>
                        {q.difficulty && (
                          <span className="text-[11px] font-medium text-(--muted)">
                            {q.difficulty} · ~{q.timeMinutes || 5} min
                          </span>
                        )}
                      </div>
                      <StructuredQuestion question={q.question} compact={true} />
                      {q.keyTakeaway && (
                        <div className="text-xs sm:text-[13px] text-(--ink) bg-gradient-to-r from-(--primary)/10 via-(--primary)/5 to-transparent p-3.5 rounded-xl border border-(--primary)/25 shadow-2xs flex items-start gap-2.5">
                          <span className="text-base shrink-0 mt-0.5">💡</span>
                          <div className="leading-relaxed">
                            <span className="font-bold text-(--primary) uppercase text-[10.5px] tracking-wider block mb-0.5">High-Yield Takeaway</span>
                            <span className="font-medium">{q.keyTakeaway}</span>
                          </div>
                        </div>
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
