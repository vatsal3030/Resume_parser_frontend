"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Clock } from "lucide-react";
import { useSearchParams, useRouter, usePathname, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HistoryPanel } from "@/components/ui/HistoryPanel";
import { PageShell } from "@/components/ui/PageShell";
import api from "@/lib/api";

function SearchParamLoader({ onHistorySelect, onJobIdFound }) {
  const searchParams = useSearchParams();
  const params = useParams();
  const outputId = params?.id || searchParams.get('outputId');
  const jobId = searchParams.get('jobId');
  const processedOutputRef = useRef(null);
  const processedJobRef = useRef(null);

  useEffect(() => {
    if (outputId && onHistorySelect && outputId !== processedOutputRef.current) {
      processedOutputRef.current = outputId;
      api.get(`/history/${outputId}`)
        .then(res => {
          onHistorySelect(res.data);
        })
        .catch(err => console.error("Failed to load output from dynamic route/query param:", err));
    }
  }, [outputId, onHistorySelect]);

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

  // Sync historyResult?.id to URL route path and localStorage
  useEffect(() => {
    if (historyResult?.id && toolType) {
      localStorage.setItem(`last_loaded_output_${toolType}`, historyResult.id);
      const currentId = params?.id || searchParams.get('outputId');
      if (currentId !== historyResult.id) {
        const queryParams = new URLSearchParams(searchParams.toString());
        queryParams.delete('outputId'); // Path is primary now
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        router.replace(`${basePath}/${historyResult.id}${queryString}`);
      }
    }
  }, [historyResult, toolType, basePath, pathname, router, searchParams, params?.id]);

  // Fallback to localStorage if path id and search params are missing outputId
  useEffect(() => {
    const id = params?.id || searchParams.get('outputId');
    if (!id && toolType) {
      const lastId = localStorage.getItem(`last_loaded_output_${toolType}`);
      if (lastId) {
        const queryParams = new URLSearchParams(searchParams.toString());
        queryParams.delete('outputId');
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        router.replace(`${basePath}/${lastId}${queryString}`);
      }
    }
  }, [params?.id, searchParams, toolType, basePath, pathname, router]);

  const handleClear = () => {
    if (toolType) {
      localStorage.removeItem(`last_loaded_output_${toolType}`);
    }
    const queryParams = new URLSearchParams(searchParams.toString());
    queryParams.delete('outputId');
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    router.replace(`${basePath}${queryString}`);
    if (onClearHistory) {
      onClearHistory();
    }
  };

  return (
    <div className="flex h-full">
      <Suspense fallback={null}>
        <SearchParamLoader onHistorySelect={onHistorySelect} onJobIdFound={onJobIdFound} />
      </Suspense>
      {/* History Panel */}
      {toolType && (
        <HistoryPanel
          toolType={toolType}
          onSelect={onHistorySelect}
          isOpen={historyOpen}
          onToggle={() => setHistoryOpen(!historyOpen)}
          activeId={historyResult?.id}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <PageShell
          title={title}
          subtitle={subtitle}
          subtitleColor={subtitleColor}
          actions={
            <div className="flex items-center gap-2">
              {headerActions}
              {toolType && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="gap-2"
                >
                  <Clock className="w-4 h-4" />
                  {historyOpen ? "Hide" : "History"}
                </Button>
              )}
            </div>
          }
        >
          {/* History loaded indicator */}
          {historyResult && (
            <div className="bg-brutal-blue/30 border-2 border-brutal-black p-3 flex items-center justify-between mb-6 animate-fade-in">
              <span className="text-xs font-bold">
                📂 Loaded from history: {historyResult.title}
              </span>
              <button
                onClick={handleClear}
                className="text-xs font-bold underline hover:no-underline"
              >
                Clear
              </button>
            </div>
          )}

          {children}
        </PageShell>
      </div>
    </div>
  );
}
