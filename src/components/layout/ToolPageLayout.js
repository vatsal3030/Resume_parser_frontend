"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Clock } from "lucide-react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HistoryPanel } from "@/components/ui/HistoryPanel";
import { PageShell } from "@/components/ui/PageShell";
import api from "@/lib/api";

function SearchParamLoader({ onHistorySelect, onJobIdFound, activeOutputId }) {
  const searchParams = useSearchParams();
  const params = useParams();
  const outputId = params?.id || searchParams.get('outputId');
  const jobId = searchParams.get('jobId');
  const processedOutputRef = useRef(null);
  const processedJobRef = useRef(null);

  useEffect(() => {
    if (outputId && onHistorySelect && outputId !== processedOutputRef.current && outputId !== activeOutputId) {
      processedOutputRef.current = outputId;
      api.get(`/history/${outputId}`)
        .then(res => {
          onHistorySelect(res.data);
        })
        .catch(err => console.error("Failed to load output from dynamic route/query param:", err));
    }
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
 * @param {string}   title          - Page title
 * @param {string}   subtitle       - Subtitle text
 * @param {string}   subtitleColor  - Brutalist color class for subtitle bg
 * @param {string}   toolType       - Tool type filter for history panel (e.g. 'COVER_LETTER')
 * @param {function} onHistorySelect - Called with full history item when user selects from history
 * @param {object}   historyResult  - Currently loaded history item (or null)
 * @param {function} onClearHistory - Called when user clears loaded history
 * @param {React.ReactNode} children - Tool page content
 * @param {React.ReactNode} headerActions - Additional actions for the header
 */
export function ToolPageLayout({
  title,
  subtitle,
  subtitleColor = "bg-brutal-yellow",
  toolType,
  onHistorySelect,
  historyResult,
  onClearHistory,
  onJobIdFound,
  children,
  headerActions,
  fullWidth = true,
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  // Compute basePath from current pathname (e.g. /dashboard/tools/roadmap or /dashboard/analyze)
  const segments = pathname.split('/');
  const isTool = segments[2] === 'tools';
  const basePath = isTool ? segments.slice(0, 4).join('/') : segments.slice(0, 3).join('/');

  // Sync historyResult?.id to URL route path
  useEffect(() => {
    if (historyResult?.id && toolType) {
      const currentId = params?.id || searchParams.get('outputId');
      if (currentId !== historyResult.id) {
        const queryParams = new URLSearchParams(searchParams.toString());
        queryParams.delete('outputId'); // Path is primary now
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        router.replace(`${basePath}/${historyResult.id}${queryString}`);
      }
    }
  }, [historyResult, toolType, basePath, pathname, router, searchParams, params?.id]);

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
        />
      </Suspense>
      {/* History Panel */}
      {toolType && (
        <HistoryPanel
          toolType={toolType}
          onSelect={(item) => {
             // Don't auto-close history panel when clicking, let user browse
             onHistorySelect(item);
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
          subtitleColor={subtitleColor}
          fullWidth={fullWidth}
          actions={
            <div className="flex items-center gap-2">
              {headerActions}
              {toolType && (
                <Button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="gap-2 bg-brutal-yellow text-black border-2 border-brutal-black hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] transition-all"
                >
                  <Clock className="w-4 h-4" />
                  {historyOpen ? "Hide History" : "View History"}
                </Button>
              )}
            </div>
          }
        >
          {/* History loaded indicator */}
          {historyResult && (
            <div className="bg-brutal-bg border-4 border-brutal-black p-4 flex items-center justify-between mb-8 animate-in fade-in zoom-in duration-300 shadow-[8px_8px_0_#000]">
              <span className="text-base font-black uppercase text-brutal-black flex items-center gap-2">
                <Clock className="w-5 h-5 text-brutal-blue" />
                Viewing past result: <span className="text-brutal-blue bg-white px-2 py-0.5 border-2 border-brutal-black">{historyResult.title}</span>
              </span>
              <Button
                onClick={handleClear}
                variant="brutal"
                className="bg-brutal-yellow text-black text-sm px-4 py-2 hover:-translate-y-0.5"
              >
                + Start New Analysis
              </Button>
            </div>
          )}

          {children}
        </PageShell>
      </div>
    </div>
  );
}
