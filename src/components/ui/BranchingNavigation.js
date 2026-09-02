import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, GitBranch } from 'lucide-react';
import api from '@/lib/api';
import { ModelBadge } from './ModelBadge';

export function BranchingNavigation({ activeResult, toolType, onSelect }) {
 const [matchingItems, setMatchingItems] = useState([]);
 const [currentIndex, setCurrentIndex] = useState(-1);
 const [loading, setLoading] = useState(false);
 const lastFetchedIdRef = useRef(null);

 // Normalize inputs to easily compare them
 const getInputs = useCallback((item) => {
 if (!item) return {};
 const payload = item.outputPayload || item;
 return payload?._meta?.inputs || item.inputSummary || {};
 }, []);

 const fetchVersions = useCallback(async () => {
 if (!activeResult) return;
 const activeId = activeResult.id || activeResult.aiJobId;
 // Skip if we already fetched for this exact result
 if (activeId && activeId === lastFetchedIdRef.current) return;
 lastFetchedIdRef.current = activeId;

 setLoading(true);
 try {
 // Get all history items for this toolType (large limit to catch all runs)
 const res = await api.get(`/history?limit=100&tool_type=${toolType}`);
 const historyItems = res.data.items || [];
 
 const currentInputs = getInputs(activeResult);
 
 // Filter for items that have the same inputs
 const filtered = historyItems.filter(item => {
 const itemInputs = getInputs(item);
 
 switch (toolType) {
 case 'TAILOR':
 return itemInputs.resumeId === currentInputs.resumeId && 
 (itemInputs.jobDescription === currentInputs.jobDescription || 
 (itemInputs.jobDescriptionSnippet && currentInputs.jobDescriptionSnippet &&
 itemInputs.jobDescriptionSnippet.substring(0, 50) === currentInputs.jobDescriptionSnippet.substring(0, 50)));
 case 'COVER_LETTER':
 return itemInputs.resumeId === currentInputs.resumeId && 
 (itemInputs.jobDescription === currentInputs.jobDescription ||
 (itemInputs.jobDescriptionSnippet && currentInputs.jobDescriptionSnippet &&
 itemInputs.jobDescriptionSnippet.substring(0, 50) === currentInputs.jobDescriptionSnippet.substring(0, 50))) &&
 itemInputs.company === currentInputs.company;
 case 'MOCK_INTERVIEW':
 case 'ROADMAP':
 return itemInputs.resumeId === currentInputs.resumeId && 
 itemInputs.targetRole === currentInputs.targetRole;
 case 'PORTFOLIO':
 return itemInputs.resumeId === currentInputs.resumeId;
 case 'GITHUB_ANALYSIS':
 return itemInputs.githubUsername === currentInputs.githubUsername;
 default:
 return false;
 }
 });

 // Sort by createdAt ASC (oldest first) so that indices are chronological
 filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
 
 const activeJobId = activeResult.aiJobId || activeResult._meta?.aiJobId;
 
 let index = filtered.findIndex(item => 
 (activeId && item.id === activeId) || 
 (activeJobId && item.aiJobId === activeJobId)
 );

 // If activeResult is a live result that was just generated, add it to the end
 if (index === -1) {
 filtered.push(activeResult);
 index = filtered.length - 1;
 }

 setMatchingItems(filtered);
 setCurrentIndex(index);
 } catch (err) {
 console.error("Failed to fetch version branches:", err);
 } finally {
 setLoading(false);
 }
 }, [activeResult, toolType, getInputs]);

 useEffect(() => {
 fetchVersions();
 // Only re-fetch when activeResult.id changes, not on every render
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeResult?.id]);

 // Listen to HISTORY_REFRESH events to refetch (e.g. after a new tailoring completes)
 useEffect(() => {
 const handleRefresh = () => {
 lastFetchedIdRef.current = null; // Reset to allow re-fetch
 fetchVersions();
 };
 window.addEventListener("HISTORY_REFRESH", handleRefresh);
 return () => window.removeEventListener("HISTORY_REFRESH", handleRefresh);
 }, [fetchVersions]);

 const handleNavigate = (newIndex) => {
 if (newIndex >= 0 && newIndex < matchingItems.length) {
 const selected = matchingItems[newIndex];
 onSelect(selected);
 }
 };

  const meta = activeResult?.outputPayload?._meta || activeResult?._meta;

  if (!meta && matchingItems.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-(--hairline) bg-(--surface-card) mb-4 shadow-xs">
      {/* Model info */}
      <div className="flex items-center gap-2">
        {meta ? (
          <ModelBadge meta={meta} />
        ) : (
          <span className="text-xs text-(--muted)">Standard Engine</span>
        )}
      </div>

      {/* Switcher Controls */}
      {matchingItems.length > 1 && (
        <div className="flex items-center gap-1.5 bg-(--surface-soft) border border-(--hairline-soft) rounded-lg p-0.5">
          <button
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="p-1 rounded text-(--muted) hover:text-(--ink) hover:bg-(--surface-card) disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Previous version"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          
          <div className="flex items-center gap-1 px-1.5 text-[11px] font-medium text-(--ink) select-none">
            <GitBranch className="w-3 h-3 text-(--primary)" />
            <span>Version {currentIndex + 1} of {matchingItems.length}</span>
          </div>

          <button
            onClick={() => handleNavigate(currentIndex + 1)}
            disabled={currentIndex >= matchingItems.length - 1}
            className="p-1 rounded text-(--muted) hover:text-(--ink) hover:bg-(--surface-card) disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Next version"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
