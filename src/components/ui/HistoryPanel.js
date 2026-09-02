"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Pin, PinOff, Trash2, ChevronLeft, Clock } from "lucide-react";
import api from "@/lib/api";
import { formatDate as globalFormatDate } from "@/lib/formatDate";

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
 * Claude Editorial Glassmorphic Design.
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
      fetchHistory();
    } catch (err) {
      console.error("Pin toggle error:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await api.delete(`/history/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all unpinned sessions for this tool?")) return;
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
      className={`w-full md:w-64 border-r border-(--hairline) bg-(--canvas) flex flex-col h-full transition-colors ${className}`}
      role="complementary"
      aria-label="History panel"
    >
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-(--hairline) flex items-center justify-between bg-(--surface-soft)/50">
        <h2 className="font-serif text-base text-(--ink) flex items-center gap-2">
          <Clock className="w-4 h-4 text-(--primary)" />
          <span>Past Sessions</span>
        </h2>
        {onToggle && (
          <button 
            onClick={onToggle} 
            className="p-1 rounded-md text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors" 
            aria-label="Close history"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search & Actions */}
      <div className="p-3 border-b border-(--hairline-soft) flex flex-col gap-2 bg-(--surface-card)">
        <div className="flex items-center gap-2 border border-(--hairline) rounded-xl px-2.5 py-1.5 bg-(--surface-soft)/70 focus-within:border-(--primary) focus-within:ring-1 focus-within:ring-(--primary)/20 transition-all">
          <Search className="w-3.5 h-3.5 text-(--muted)" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search sessions..."
            className="w-full text-xs text-(--ink) focus:outline-none bg-transparent placeholder:text-(--muted-soft)"
          />
        </div>
        {items.length > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] text-(--muted-soft)">{items.length} items</span>
            <button
              onClick={handleClearAll}
              className="text-[11px] text-(--muted) hover:text-(--error) transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-(--hairline-soft) bg-(--surface-soft) p-3 animate-pulse">
                <div className="h-3.5 bg-(--hairline) rounded w-3/4 mb-2" />
                <div className="h-2.5 bg-(--hairline) rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-(--muted)">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-(--primary)" />
            <p className="text-xs font-medium">No history yet</p>
            <p className="text-[11px] text-(--muted-soft) mt-0.5">Outputs will appear here</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = item.id === activeId;
              return (
                <li 
                  key={item.id} 
                  className={`rounded-xl border transition-all duration-150 ${
                    isActive 
                      ? "bg-(--surface-card) border-(--primary)/60 shadow-sm ring-1 ring-(--primary)/20" 
                      : "bg-(--surface-soft)/50 border-(--hairline-soft) hover:bg-(--surface-card) hover:border-(--hairline)"
                  }`}
                >
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
                          <span className="text-xs">{TOOL_ICONS[item.toolType] || "📄"}</span>
                          {item.isPinned && <Pin className="w-3 h-3 text-(--primary) fill-(--primary)" />}
                          <span className="text-[10px] uppercase font-medium tracking-wider text-(--muted-soft)">
                            {item.toolType?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => handleRenameSubmit(e, item.id)}
                            onBlur={(e) => handleRenameSubmit({ ...e, key: 'Enter' }, item.id)}
                            autoFocus
                            className="w-full text-xs font-medium border border-(--primary) rounded px-1 py-0.5 focus:outline-none bg-(--surface-card) text-(--ink)"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <p className="text-xs font-medium text-(--ink) truncate">{item.title}</p>
                        )}
                        <p className="text-[10px] text-(--muted-soft) mt-1">{formatDate(item.createdAt)}</p>
                      </div>

                      {loadingId === item.id ? (
                        <div className="flex items-center gap-1 opacity-100 pr-1 shrink-0">
                          <span className="w-3.5 h-3.5 rounded-full border-2 border-(--hairline) border-t-(--primary) animate-spin inline-block"></span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={(e) => handleRenameStart(e, item)}
                            className="p-1 rounded text-(--muted-soft) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
                            aria-label="Rename"
                            title="Rename"
                          >
                            ✎
                          </button>
                          <button
                            onClick={(e) => handlePin(e, item.id, item.isPinned)}
                            className="p-1 rounded text-(--muted-soft) hover:text-(--primary) hover:bg-(--surface-soft) transition-colors"
                            aria-label={item.isPinned ? "Unpin" : "Pin"}
                            title={item.isPinned ? "Unpin" : "Pin"}
                          >
                            {item.isPinned ? <PinOff className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, item.id)}
                            className="p-1 rounded text-(--muted-soft) hover:text-(--error) hover:bg-(--surface-soft) transition-colors"
                            aria-label="Delete"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-(--hairline-soft) bg-(--surface-soft) text-xs text-(--muted)">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="hover:text-(--ink) disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <span>{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="hover:text-(--ink) disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </aside>
  );
}
