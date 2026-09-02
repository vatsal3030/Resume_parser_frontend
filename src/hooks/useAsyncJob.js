"use client";

import { useState, useEffect, useRef, useCallback } from"react";
import api from"@/lib/api";
import { useToast } from"@/components/ui/toast";

export const JOB_STATUS = {
 IDLE: 'IDLE',
 QUEUED: 'QUEUED',
 PROCESSING: 'PROCESSING',
 GENERATING: 'GENERATING',
 FINALIZING: 'FINALIZING',
 COMPLETED: 'COMPLETED',
 FAILED: 'FAILED',
 CANCELLED: 'CANCELLED',
};

// Initial state for a job
const INITIAL_STATE = {
 status: JOB_STATUS.IDLE,
 progress: 0,
 stage: '',
 message: '',
 result: null,
 error: null,
};

export function useAsyncJob({ 
 onComplete = null, 
 onError = null,
 pollInterval = 3000, 
 maxRetries = 3,
 timeoutMs = 120000 // 2 minutes default timeout
} = {}) {
 const [jobId, setJobId] = useState(null);
 const [jobState, setJobState] = useState(INITIAL_STATE);
 const [retryCount, setRetryCount] = useState(0);
 
 const pollTimerRef = useRef(null);
 const startTimeRef = useRef(null);
 const completedJobIdRef = useRef(null);
 const toast = useToast();

 const clearTimer = () => {
 if (pollTimerRef.current) {
 clearInterval(pollTimerRef.current);
 pollTimerRef.current = null;
 }
 };

 const startJob = useCallback(async (endpoint, payload) => {
 setJobState({ ...INITIAL_STATE, status: JOB_STATUS.QUEUED, message: 'Initiating request...' });
 setRetryCount(0);
 setJobId(null);
 clearTimer();
 startTimeRef.current = Date.now();
 completedJobIdRef.current = null;

 try {
 const res = await api.post(endpoint, payload);
 // The backend should return { jobId: '...' }
 if (res.data?.jobId) {
 setJobId(res.data.jobId);
 setJobState(prev => ({ ...prev, status: JOB_STATUS.PROCESSING, message: 'Job queued successfully.' }));
 } else {
 throw new Error('No Job ID returned from server.');
 }
 } catch (err) {
 console.error("Job Start Error:", err);
 const status = err.response?.status;
 const serverMsg = err.response?.data?.message || err.response?.data?.error?.message || err.response?.data?.error;
 
 let errorMessage;
 if (status === 400) {
 errorMessage = serverMsg || 'Missing required fields. Please fill in all inputs.';
 } else if (status === 401) {
 errorMessage = 'Session expired. Please log in again.';
 } else if (status === 402) {
 errorMessage = serverMsg || 'Insufficient credits. Please purchase more credits to continue.';
 } else if (status === 404) {
 errorMessage = serverMsg || 'The selected resource was not found. Please try again.';
 } else if (status === 429) {
 errorMessage = serverMsg || 'Rate limit exceeded. Please wait before trying again.';
 } else if (status === 500) {
 errorMessage = 'Server error. Please try again in a moment.';
 } else if (!err.response) {
 errorMessage = 'Cannot connect to the server. Is the backend running?';
 } else {
 errorMessage = serverMsg || err.message || 'Failed to start job.';
 }
 
 setJobState(prev => ({ 
 ...prev, 
 status: JOB_STATUS.FAILED, 
 error: errorMessage
 }));
 if (onError) onError(err);
 }
 }, [onError]);

 const pollJobStatus = useCallback(async (currentJobId) => {
 try {
 if (startTimeRef.current && Date.now() - startTimeRef.current > timeoutMs) {
 clearTimer();
 setJobState(s => ({ 
 ...s, 
 status: JOB_STATUS.FAILED, 
 error: 'Job timed out. The server took too long to respond.' 
 }));
 if (onError) onError(new Error('Job timeout'));
 return;
 }

 const res = await api.get(`/resumes/jobs/${currentJobId}`); // Assumes jobs are currently under /resumes/jobs/
 const data = res.data;

 // In the future, this schema should map exactly to the backend unified schema.
 // Current backend schema: { status: 'COMPLETED' | 'FAILED' | 'PROCESSING', resultPayload: ... }
 
 let newStatus = data.status === 'COMPLETED' ? JOB_STATUS.COMPLETED : 
 data.status === 'FAILED' ? JOB_STATUS.FAILED : 
 JOB_STATUS.PROCESSING;

 // Map progress based on what the backend provides, or simulate if it doesn't provide it yet.
 // Use existing state progress to prevent overwriting fake incrementing progress
 const progress = data.progressPercentage || (newStatus === JOB_STATUS.COMPLETED ? 100 : (prev => prev.progress || 10));
 const stage = data.currentStage || 'Processing';
 const message = data.message || (newStatus === JOB_STATUS.PROCESSING ? 'AI is working...' : '');

 setJobState(prev => ({
 ...prev,
 status: newStatus,
 progress: typeof progress === 'function' ? progress(prev) : progress,
 stage,
 message,
 result: newStatus === JOB_STATUS.COMPLETED ? data.resultPayload : null,
 }));

 if (newStatus === JOB_STATUS.COMPLETED && completedJobIdRef.current !== currentJobId) {
 completedJobIdRef.current = currentJobId;
 clearTimer();
 window.dispatchEvent(new Event("HISTORY_REFRESH"));
 if (onComplete) onComplete(data.resultPayload);
 } else if (newStatus === JOB_STATUS.FAILED && completedJobIdRef.current !== currentJobId) {
 completedJobIdRef.current = currentJobId;
 clearTimer();
 const errorMsg = data.errorMessage || data.error?.message || 'Generation failed.';
 setJobState(prev => ({ ...prev, error: errorMsg }));
 if (onError) onError(new Error(errorMsg));
 }
 
 // Reset retries on successful poll
 setRetryCount(0);

 } catch (err) {
 console.error("Polling Error:", err);
 
 // Exponential Backoff implementation
 const nextCount = retryCount + 1;
 
 if (nextCount > maxRetries) {
 clearTimer();
 setJobState(s => ({ 
 ...s, 
 status: JOB_STATUS.FAILED, 
 error: 'Lost connection to job status after multiple retries.' 
 }));
 // Removed toast.error to prevent spam. Component UI will handle the error state.
 if (onError) onError(err);
 } else {
 // Adjust timer interval based on retry count
 clearTimer();
 const nextInterval = pollInterval * Math.pow(1.5, nextCount);
 pollTimerRef.current = setInterval(() => pollJobStatus(currentJobId), nextInterval);
 // Removed toast.warning to prevent UI spam during backoff.
 }
 setRetryCount(nextCount);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [retryCount, maxRetries, pollInterval, onComplete, onError, toast, timeoutMs]);

 useEffect(() => {
 let progressInterval;
 if (jobState.status === JOB_STATUS.PROCESSING || jobState.status === JOB_STATUS.QUEUED) {
 progressInterval = setInterval(() => {
 setJobState(prev => {
 if (prev.progress < 90) {
 // Increment by 2-5% randomly
 const increment = Math.floor(Math.random() * 4) + 2;
 return { ...prev, progress: Math.min(prev.progress + increment, 90) };
 }
 return prev;
 });
 }, 800);
 }
 
 return () => {
 if (progressInterval) clearInterval(progressInterval);
 };
 }, [jobState.status]);

 useEffect(() => {
 if (jobId && jobState.status === JOB_STATUS.PROCESSING) {
 clearTimer();
 // Initial poll immediately, then interval
 pollJobStatus(jobId);
 pollTimerRef.current = setInterval(() => pollJobStatus(jobId), pollInterval);
 }
 
 return () => clearTimer();
 }, [jobId, jobState.status, pollInterval, pollJobStatus]);

 const cancelJob = useCallback(() => {
 clearTimer();
 setJobState(prev => ({ ...prev, status: JOB_STATUS.CANCELLED, message: 'Job cancelled by user.' }));
 // Future: Hit API endpoint to cancel job on backend
 }, []);

 const resetJob = useCallback(() => {
 clearTimer();
 setJobId(null);
 setJobState(INITIAL_STATE);
 setRetryCount(0);
 }, []);

 const monitorJob = useCallback((id) => {
 setJobId(id);
 setJobState({
 status: JOB_STATUS.PROCESSING,
 progress: 0,
 stage: 'Monitoring',
 message: 'Checking job status...',
 result: null,
 error: null,
 });
 startTimeRef.current = Date.now();
 completedJobIdRef.current = null;
 }, []);

 return {
 jobId,
 ...jobState,
 startJob,
 monitorJob,
 cancelJob,
 resetJob,
 };
}
