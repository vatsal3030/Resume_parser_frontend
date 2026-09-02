"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { JOB_STATUS } from '@/hooks/useAsyncJob';
import { Loader2, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function ProcessingPipeline({ 
  status, 
  progress, 
  stage, 
  message, 
  error, 
  onRetry, 
  onCancel 
}) {
  if (!status || status === JOB_STATUS.IDLE) return null;

  const isComplete = status === JOB_STATUS.COMPLETED;
  const isFailed = status === JOB_STATUS.FAILED;
  const isCancelled = status === JOB_STATUS.CANCELLED;
  const isProcessing = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  const visualProgress = isComplete ? 100 : (progress || 8);

  return (
    <Card className="bg-(--surface-card) border border-(--hairline) rounded-2xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <CardContent className="p-0">
        
        {/* Header Status Bar */}
        <div className="px-5 py-4 border-b border-(--hairline) flex items-center justify-between bg-(--surface-soft)/60">
          <div className="flex items-center gap-3">
            {isProcessing && <Loader2 className="w-5 h-5 animate-spin text-(--primary)" />}
            {isComplete && <CheckCircle2 className="w-5 h-5 text-(--success)" />}
            {isFailed && <XCircle className="w-5 h-5 text-(--error)" />}
            {isCancelled && <AlertTriangle className="w-5 h-5 text-(--muted)" />}
            
            <h3 className="font-serif font-medium text-base text-(--ink)">
              {isComplete ? 'Task Completed' :
               isFailed ? 'Task Failed' :
               isCancelled ? 'Task Cancelled' :
               status === JOB_STATUS.QUEUED ? 'In Queue...' :
               'Processing Request...'}
            </h3>
          </div>
          
          <div className="font-mono text-xs font-semibold text-(--primary)">
            {visualProgress}%
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-1.5 bg-(--surface-soft) w-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ease-out rounded-full ${
              isComplete ? 'bg-(--success)' :
              isFailed ? 'bg-(--error)' :
              'bg-(--primary)'
            }`}
            style={{ width: `${visualProgress}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="mb-2">
            <p className="text-xs uppercase tracking-wider font-medium text-(--muted) mb-1.5">
              {stage || 'Current Stage'}
            </p>
            <p className="text-sm font-medium text-(--ink) leading-relaxed">
              {error ? error : (message || 'Please wait while AI processes your request...')}
            </p>
          </div>

          {/* Action Buttons (Retry / Cancel) */}
          {(isFailed || isProcessing) && (onRetry || onCancel) && (
            <div className="flex gap-3 mt-5 border-t border-(--hairline-soft) pt-4">
              {isFailed && onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="default" 
                  className="w-full py-2.5 text-xs"
                >
                  Retry Request
                </Button>
              )}
              {isProcessing && onCancel && (
                <Button 
                  onClick={onCancel} 
                  variant="secondary" 
                  className="w-full py-2.5 text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
