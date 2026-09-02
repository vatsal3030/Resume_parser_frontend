"use client";
import React, { useState, useEffect, useRef, Suspense } from"react";
import { Clock } from"lucide-react";
import { useSearchParams, useRouter, usePathname, useParams } from"next/navigation";
import { Button } from"@/components/ui/button";
import { HistoryPanel } from"@/components/ui/HistoryPanel";
import { PageShell } from"@/components/ui/PageShell";
import { ResultSkeleton } from"@/components/ui/ResultSkeleton";
import api from"@/lib/api";

// UUID v4 pattern for validating outputIds before API calls
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function SearchParamLoader({ onHistorySelect, onJobIdFound, activeOutputId, onLoadingChange }) {
 const searchParams = useSearchParams();
 const params = useParams();
 // For catch-all routes like [[...id]], params.id is an array
 const rawId = params?.id;
 const outputId = Array.isArray(rawId) ? rawId[0] : (rawId || searchParams.get('outputId'));
 const jobId = searchParams.get('jobId');
 const processedOutputRef = useRef(null);
 const processedJobRef = useRef(null);

  useEffect(() => {
    const isValidId = outputId && typeof outputId === 'string' && outputId !== 'undefined' && outputId !== 'null' && outputId.trim().length > 0;
    if (isValidId && onHistorySelect && outputId !== processedOutputRef.current && outputId !== activeOutputId) {
      processedOutputRef.current = outputId;
      if (onLoadingChange) onLoadingChange(true);
      api.get(`/history/${outputId}`)
        .then(res => {
          onHistorySelect(res.data);
        })
        .catch(err => {
          if (err.response?.status !== 404) {
            console.error("Failed to load output from dynamic route/query param:", err);
          }
        })
        .finally(() => {
          if (onLoadingChange) onLoadingChange(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outputId, onHistorySelect, activeOutputId]);

 useEffect(() => {
 if (jobId && onJobIdFound && jobId !== processedJobRef.current) {
 processedJobRef.current = jobId;
 onJobIdFound(jobId);
 }
 }, [jobId, onJobIdFound]);

 return null;
}

/**
 * ToolPageLayout — Reusable layout wrapper for any AI tool page.
 * Provides: PageShell header, optional HistoryPanel sidebar, and history-loaded indicator.
 *
 * @param {string} title - Page title
 * @param {string} subtitle - Subtitle text
 * @param {string} subtitleColor - Brutalist color class for subtitle bg
 * @param {string} toolType - Tool type filter for history panel (e.g. 'COVER_LETTER')
 * @param {function} onHistorySelect - Called with full history item when user selects from history
 * @param {object} historyResult - Currently loaded history item (or null)
 * @param {function} onClearHistory - Called when user clears loaded history
 * @param {React.ReactNode} children - Tool page content
 * @param {React.ReactNode} headerActions - Additional actions for the header
 */
export function ToolPageLayout({
 title,
 subtitle,
 toolType,
 onHistorySelect,
 historyResult,
 activeResult,
 onClearHistory,
 onJobIdFound,
 children,
 headerActions,
 fullWidth = true,
}) {
 const [historyOpen, setHistoryOpen] = useState(false);
 const [isLoadingHistory, setIsLoadingHistory] = useState(false);
 const router = useRouter();
 const pathname = usePathname();
 const searchParams = useSearchParams();
 const params = useParams();
 const lastSyncedIdRef = useRef(null);

 // Compute basePath from current pathname (e.g. /dashboard/tools/roadmap or /dashboard/analyze)
 const segments = pathname.split('/');
 const isTool = segments[2] === 'tools';
 const basePath = isTool ? segments.slice(0, 4).join('/') : segments.slice(0, 3).join('/');

 const targetResult = activeResult || historyResult;
 const targetId = targetResult?.id || targetResult?.aiJobId;

 // Sync targetId to URL route path — uses ref to prevent infinite loop
 useEffect(() => {
 if (targetId && toolType && targetId !== lastSyncedIdRef.current) {
 lastSyncedIdRef.current = targetId;
 const rawId = params?.id;
 const currentId = Array.isArray(rawId) ? rawId[0] : (rawId || searchParams.get('outputId'));
 if (currentId !== targetId) {
 const queryParams = new URLSearchParams(searchParams.toString());
 queryParams.delete('outputId'); // Path is primary now
 const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
 router.replace(`${basePath}/${targetId}${queryString}`);
 }
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [targetId, toolType, basePath, router]);

 const handleClear = () => {
 const queryParams = new URLSearchParams(searchParams.toString());
 queryParams.delete('outputId');
 const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
 router.replace(`${basePath}${queryString}`);
 if (onClearHistory) {
 onClearHistory();
 }
 };

 return (
 <div className="flex h-full relative overflow-hidden">
 <Suspense fallback={null}>
 <SearchParamLoader 
 onHistorySelect={onHistorySelect} 
 onJobIdFound={onJobIdFound} 
 activeOutputId={historyResult?.id}
 onLoadingChange={setIsLoadingHistory}
 />
 </Suspense>
 {/* History Panel */}
 {toolType && (
 <HistoryPanel
 toolType={toolType}
 onSelect={(item) => {
 // Don't auto-close history panel when clicking, let user browse
 setIsLoadingHistory(true);
 onHistorySelect(item);
 // Brief delay to allow state transition, then clear loading
 setTimeout(() => setIsLoadingHistory(false), 300);
 }}
 isOpen={historyOpen}
 onToggle={() => setHistoryOpen(!historyOpen)}
 activeId={historyResult?.id}
 />
 )}

 {/* Main Content */}
 <div className="flex-1 min-w-0 overflow-y-auto">
 <PageShell
 title={title}
 subtitle={subtitle}
 fullWidth={fullWidth}
 actions={
 <div className="flex items-center gap-2">
 {headerActions}
          {toolType && (
            <button
              onClick={() => setHistoryOpen(!historyOpen)}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) text-(--ink) transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-(--primary)" />
              {historyOpen ? "Hide History" : "View History"}
            </button>
          )}
        </div>
      }
    >
      {/* History loaded indicator — Floating Glass Pill */}
      {historyResult && (
        <div className="rounded-2xl border border-(--primary)/30 bg-(--surface-card)/90 backdrop-blur-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 animate-in fade-in duration-200 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-(--primary)/10 text-(--primary) flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-(--muted) font-medium">Viewing Past Session</p>
              <p className="text-sm font-medium text-(--ink) truncate">{historyResult.title}</p>
            </div>
          </div>
          <button
            onClick={handleClear}
            className="px-4 py-2 rounded-xl bg-(--primary) text-white text-xs font-medium hover:bg-(--primary-active) transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            + Start New Session
          </button>
        </div>
      )}

 {/* Loading skeleton while fetching history */}
 {isLoadingHistory && (
 <ResultSkeleton />
 )}

 {/* Actual page content — hidden while loading history, smooth transition in */}
 <div className={`transition-opacity duration-300 ${isLoadingHistory ? 'opacity-0 pointer-events-none h-0 overflow-hidden' : 'opacity-100'}`}>
 {typeof children === 'function' ? children({ isLoadingHistory }) : children}
 </div>
 </PageShell>
 </div>
 </div>
 );
}
