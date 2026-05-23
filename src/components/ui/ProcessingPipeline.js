"use client";

import { CheckCircle2, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { JOB_STATUS } from "@/hooks/useAsyncJob";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ProcessingPipeline({ 
  status, 
  progress = 0, 
  stage = '', 
  message = '', 
  error = null,
  onRetry = null,
  onCancel = null
}) {
  if (status === JOB_STATUS.IDLE) return null;

  const isComplete = status === JOB_STATUS.COMPLETED;
  const isFailed = status === JOB_STATUS.FAILED;
  const isCancelled = status === JOB_STATUS.CANCELLED;
  const isProcessing = [JOB_STATUS.QUEUED, JOB_STATUS.PROCESSING, JOB_STATUS.GENERATING, JOB_STATUS.FINALIZING].includes(status);

  // Derive visual progress bar width
  const visualProgress = isComplete ? 100 : (progress || 5);

  return (
    <Card className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_#000] overflow-hidden animate-in fade-in zoom-in duration-300">
      <CardContent className="p-0">
        
        {/* Header Status Bar */}
        <div className={`p-4 border-b-4 border-brutal-black flex items-center justify-between ${
          isComplete ? 'bg-brutal-green' :
          isFailed ? 'bg-red-500 text-white' :
          isCancelled ? 'bg-gray-300' :
          'bg-brutal-yellow'
        }`}>
          <div className="flex items-center gap-3">
            {isProcessing && <Loader2 className="w-6 h-6 animate-spin" />}
            {isComplete && <CheckCircle2 className="w-6 h-6" />}
            {isFailed && <XCircle className="w-6 h-6" />}
            {isCancelled && <AlertTriangle className="w-6 h-6" />}
            
            <h3 className="font-black text-xl uppercase tracking-wider">
              {isComplete ? 'Task Completed' :
               isFailed ? 'Task Failed' :
               isCancelled ? 'Task Cancelled' :
               status === JOB_STATUS.QUEUED ? 'In Queue' :
               'Processing'}
            </h3>
          </div>
          
          <div className="font-bold text-lg">
            {visualProgress}%
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-4 bg-brutal-bg w-full border-b-4 border-brutal-black relative overflow-hidden">
          <div 
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out border-r-4 border-brutal-black ${
              isComplete ? 'bg-brutal-green' :
              isFailed ? 'bg-red-500' :
              'bg-brutal-pink'
            }`}
            style={{ width: `${visualProgress}%` }}
          />
          {/* Subtle animated stripes overlay if processing */}
          {isProcessing && (
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] animate-[pan_20s_linear_infinite]" />
          )}
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-1">
              {stage || 'Current Stage'}
            </p>
            <p className="text-xl font-bold">
              {error ? error : (message || 'Please wait while AI processes your request...')}
            </p>
          </div>

          {/* Action Buttons (Retry / Cancel) */}
          {(isFailed || isProcessing) && (onRetry || onCancel) && (
            <div className="flex gap-4 mt-6 border-t-2 border-dashed border-gray-300 pt-6">
              {isFailed && onRetry && (
                <Button 
                  onClick={onRetry} 
                  variant="brutal" 
                  className="bg-brutal-blue text-black w-full shadow-brutal-sm border-2 font-bold"
                >
                  Retry Request
                </Button>
              )}
              {isProcessing && onCancel && (
                <Button 
                  onClick={onCancel} 
                  variant="outline" 
                  className="w-full border-2 border-brutal-black shadow-[2px_2px_0_#000] font-bold text-gray-700 hover:bg-gray-100"
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
