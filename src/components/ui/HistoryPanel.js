"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Pin, PinOff, Trash2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { BrutalBadge } from "@/components/ui/BrutalBadge";

import api from "@/lib/api";
import { formatDate as globalFormatDate } from "@/lib/formatDate";

const TOOL_COLORS = {
  RESUME_ANALYSIS: "bg-brutal-blue",
  TAILOR: "bg-brutal-yellow",
  COVER_LETTER: "bg-brutal-pink",
  MOCK_INTERVIEW: "bg-brutal-mint",
  ROADMAP: "bg-purple-300",
  PORTFOLIO: "bg-orange-300",
  GITHUB_ANALYSIS: "bg-green-300",
};

const TOOL_ICONS = {
  RESUME_ANALYSIS: "📄",
  TAILOR: "✂️",
  COVER_LETTER: "✉️",
  MOCK_INTERVIEW: "🎤",
  ROADMAP: "🗺️",
  PORTFOLIO: "🌐",
  GITHUB_ANALYSIS: "🐙",
};

/**
 * HistoryPanel — Collapsible sidebar for browsing past AI tool outputs.
 * 
 * @param {string} toolType - Filter by tool type (optional)
 * @param {function} onSelect - Called with the full tool output when an item is clicked
 * @param {boolean} isOpen - Controlled open state
 * @param {function} onToggle - Toggle callback
 * @param {string} className - Additional classes
 * @param {string} activeId - Currently active item ID for highlighting
 */
export function HistoryPanel({ toolType, onSelect, isOpen = true, onToggle, className = "", activeId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (toolType) params.set("tool_type", toolType);
      if (search) params.set("search", search);

      const res = await api.get(`/history?${params}`);
      setItems(res.data.items || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [toolType, search, page]);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, fetchHistory]);

  useEffect(() => {
    const handleRefresh = () => {
      if (isOpen) fetchHistory();
    };
    window.addEventListener("HISTORY_REFRESH", handleRefresh);
    return () => window.removeEventListener("HISTORY_REFRESH", handleRefresh);
  }, [isOpen, fetchHistory]);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loadingId, setLoadingId] = useState(null);

  const handlePin = async (e, id, currentPinned) => {
    e.stopPropagation();
    try {
      await api.put(`/history/${id}`, { isPinned: !currentPinned });
      fetchHistory(); // Refresh to reorder
    } catch (err) {
      console.error("Pin toggle error:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this history item?")) return;
    try {
      await api.delete(`/history/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all non-pinned history items for this tool? This action is irreversible.")) return;
    try {
      await api.delete(`/history/clear?tool_type=${toolType}`);
      fetchHistory();
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  const handleRenameStart = (e, item) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditTitle(item.title);
  };

  const handleRenameSubmit = async (e, id) => {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;
    try {
      await api.put(`/history/${id}`, { title: editTitle });
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, title: editTitle } : item));
      setEditingId(null);
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  const handleSelect = async (item) => {
    if (editingId === item.id || loadingId) return;
    setLoadingId(item.id);
    try {
      const res = await api.get(`/history/${item.id}`);
      onSelect?.(res.data);
    } catch (err) {
      console.error("History detail fetch error:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (dateStr) => globalFormatDate(dateStr, { showTime: true });

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      className={`w-full md:w-64 border-r-4 border-brutal-black bg-brutal-bg flex flex-col h-full ${className}`}
      role="complementary"
      aria-label="History panel"
    >
      {/* Header */}
      <div className="bg-brutal-yellow px-4 py-4 border-b-4 border-brutal-black flex items-center justify-between">
        <h2 className="font-black text-lg uppercase tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4" />
          History
        </h2>
        {onToggle && (
          <button onClick={onToggle} className="hover:bg-yellow-400 p-1 transition-colors" aria-label="Close history">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search & Clear All */}
      <div className="p-4 border-b-4 border-brutal-black flex flex-col gap-3 bg-brutal-yellow/20">
        <div className="flex items-center gap-2 border-2 border-brutal-black px-2 bg-white shadow-[2px_2px_0_#000] focus-within:shadow-[4px_4px_0_#000] focus-within:-translate-y-0.5 transition-all">
          <Search className="w-4 h-4 text-brutal-black" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search history..."
            className="w-full py-2 text-sm font-bold text-brutal-black focus:outline-none bg-transparent placeholder:text-gray-400"
          />
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="w-full py-2 border-2 border-brutal-black bg-brutal-pink hover:bg-pink-400 text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            🗑️ Delete All
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 border-2 border-gray-200 skeleton-shimmer" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase">No history yet</p>
            <p className="text-xs text-gray-400 mt-1">Run an AI tool to see results here</p>
          </div>
        ) : (
          <ul className="divide-y-2 divide-brutal-black flex flex-col p-2 gap-2">
            {items.map((item) => (
              <li key={item.id} className={`border-2 border-brutal-black bg-white transition-all shadow-[2px_2px_0_#000] hover:shadow-[4px_4px_0_#000] hover:-translate-y-0.5 ${item.id === activeId ? "bg-brutal-yellow shadow-[4px_4px_0_#000] -translate-y-0.5" : ""}`}>
                <div
                  onClick={() => handleSelect(item)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSelect(item); }}
                  role="button"
                  tabIndex={0}
                  className="w-full text-left p-3 group cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{TOOL_ICONS[item.toolType] || "🤖"}</span>
                        {item.isPinned && <Pin className="w-3 h-3 text-brutal-yellow fill-brutal-yellow" />}
                      </div>
                      {editingId === item.id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => handleRenameSubmit(e, item.id)}
                          onBlur={(e) => handleRenameSubmit({ ...e, key: 'Enter' }, item.id)}
                          autoFocus
                          className="w-full text-xs font-bold border-2 border-brutal-black px-1 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-xs font-bold truncate">{item.title}</p>
                      )}
                      <p className="text-[10px] text-gray-500 mt-0.5">{formatDate(item.createdAt)}</p>
                      {loadingId === item.id ? (
                        <div className="flex items-center gap-1 opacity-100 pr-2">
                           <span className="w-4 h-4 rounded-full border-2 border-brutal-black border-t-brutal-yellow animate-spin inline-block"></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleRenameStart(e, item)}
                            className="p-1 border-2 border-transparent hover:border-brutal-black hover:bg-brutal-blue transition-colors text-brutal-black"
                            aria-label="Rename"
                          >
                            <span className="text-[10px] font-bold">✎</span>
                          </button>
                          <button
                            onClick={(e) => handlePin(e, item.id, item.isPinned)}
                            className="p-1 border-2 border-transparent hover:border-brutal-black hover:bg-brutal-yellow transition-colors"
                            aria-label={item.isPinned ? "Unpin" : "Pin"}
                          >
                            {item.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1 border-2 border-transparent hover:border-brutal-black hover:bg-brutal-pink transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-brutal-black" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t-4 border-brutal-black bg-brutal-yellow">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-bold disabled:opacity-30"
          >
            ← Prev
          </button>
          <span className="text-xs font-bold">{page}/{totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs font-bold disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </aside>
  );
}
