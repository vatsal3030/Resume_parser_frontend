import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, GitBranch } from 'lucide-react';
import api from '@/lib/api';
import { ModelBadge } from './ModelBadge';

export function BranchingNavigation({ activeResult, toolType, onSelect }) {
  const [matchingItems, setMatchingItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Normalize inputs to easily compare them
  const getInputs = useCallback((item) => {
    if (!item) return {};
    const payload = item.outputPayload || item;
    return payload?._meta?.inputs || item.inputSummary || {};
  }, []);

  const fetchVersions = useCallback(async () => {
    if (!activeResult) return;
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
      
      // If our activeResult is a live result (not in history yet), or we want to make sure it is in the list
      // Let's find by id or by aiJobId
      const activeId = activeResult.id;
      const activeJobId = activeResult.aiJobId || activeResult._meta?.aiJobId;
      
      let index = filtered.findIndex(item => 
        (activeId && item.id === activeId) || 
        (activeJobId && item.aiJobId === activeJobId)
      );

      // If activeResult is a live result that was just generated, it might not be in the fetched history list yet,
      // but wait, we want to include it. Let's add it to the end if not found
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
  }, [activeResult, fetchVersions]);

  // Listen to HISTORY_REFRESH events to refetch (e.g. after a new tailoring completes)
  useEffect(() => {
    const handleRefresh = () => {
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-4 border-brutal-black p-4 bg-slate-50 shadow-brutal-sm gap-4 mb-4">
      {/* Model Badge */}
      <div className="flex-1">
        <div className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
          Generation Details
        </div>
        {meta ? (
          <ModelBadge meta={meta} />
        ) : (
          <span className="text-sm font-bold text-gray-400">No model metadata available</span>
        )}
      </div>

      {/* Switcher Controls */}
      {matchingItems.length > 1 && (
        <div className="flex items-center gap-3 self-end sm:self-auto bg-white border-2 border-brutal-black p-1 shadow-[2px_2px_0_rgba(0,0,0,1)]">
          <button
            onClick={() => handleNavigate(currentIndex - 1)}
            disabled={currentIndex <= 0}
            className="p-1 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-brutal-black"
            title="Previous version"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 px-2 text-sm font-black select-none">
            <GitBranch className="w-4 h-4 text-brutal-blue" />
            <span>Version {currentIndex + 1} of {matchingItems.length}</span>
          </div>

          <button
            onClick={() => handleNavigate(currentIndex + 1)}
            disabled={currentIndex >= matchingItems.length - 1}
            className="p-1 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-brutal-black"
            title="Next version"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
