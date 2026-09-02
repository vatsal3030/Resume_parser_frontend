"use client";
import React, { useState, useEffect } from "react";
import { Trash2, RotateCcw, Clock } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import api from "@/lib/api";
import { formatDate } from "@/lib/formatDate";

const TOOL_ICONS = {
  RESUME_ANALYSIS: "📄", TAILOR: "✂️", COVER_LETTER: "✉️",
  MOCK_INTERVIEW: "🎤", ROADMAP: "🗺️", PORTFOLIO: "🌐", GITHUB_ANALYSIS: "🐙",
};

const TOOL_LABELS = {
  RESUME_ANALYSIS: "Resume Analysis", TAILOR: "Tailoring", COVER_LETTER: "Cover Letter",
  MOCK_INTERVIEW: "Mock Interview", ROADMAP: "Roadmap", PORTFOLIO: "Portfolio", GITHUB_ANALYSIS: "GitHub",
};

export default function TrashPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [emptyLoading, setEmptyLoading] = useState(false);

  const fetchTrash = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/history/trash`);
      setItems(res.data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (id) => {
    try {
      await api.post(`/history/${id}/restore`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to restore item");
    }
  };

  const handlePermanentDelete = async (id) => {
    try {
      await api.delete(`/history/${id}/permanent`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to permanently delete item");
    }
  };

  const handleEmptyTrash = async () => {
    setEmptyLoading(true);
    try {
      await api.delete(`/history/trash/empty`);
      setItems([]);
      setConfirmEmpty(false);
    } catch (err) {
      setError("Failed to empty trash");
    } finally {
      setEmptyLoading(false);
    }
  };

  // Group by tool type
  const grouped = items.reduce((acc, item) => {
    const type = item.toolType || "OTHER";
    if (!acc[type]) acc[type] = [];
    acc[type].push(item);
    return acc;
  }, {});

  const getDaysColor = (days) => {
    if (days <= 3) return "text-red-500";
    if (days <= 7) return "text-amber-500";
    return "text-(--muted)";
  };

  return (
    <PageShell
      title="Trash"
      subtitle="Items are permanently deleted after 30 days"
      actions={
        items.length > 0 && (
          <Button variant="destructive" onClick={() => setConfirmEmpty(true)} className="text-xs px-3.5">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Empty Trash
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} onRetry={fetchTrash} onDismiss={() => setError(null)} className="mb-6" />}

      {loading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2].map(g => (
            <div key={g} className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 bg-(--surface-soft) rounded" />
                <div className="h-3.5 bg-(--surface-soft) rounded-md w-28" />
                <div className="h-4 bg-(--surface-soft) rounded-full w-6" />
              </div>
              <div className="space-y-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-(--surface-card) border border-(--hairline) shadow-xs">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3.5 bg-(--surface-soft) rounded-md w-3/5" />
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 bg-(--surface-soft) rounded w-20" />
                        <div className="h-2.5 bg-(--surface-soft) rounded w-16" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <div className="h-7 bg-(--surface-soft) rounded-lg w-16" />
                      <div className="h-7 bg-(--surface-soft) rounded-lg w-7" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card)">
          <Trash2 className="w-12 h-12 text-(--muted) mx-auto mb-3 opacity-40" />
          <h2 className="text-base font-serif font-medium text-(--ink) mb-1">Trash is Empty</h2>
          <p className="text-xs text-(--muted)">Deleted items will appear here for 30 days before permanent deletion.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-sm">{TOOL_ICONS[type] || "🗑️"}</span>
                <h3 className="font-medium text-xs text-(--ink)">{TOOL_LABELS[type] || type}</h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-(--surface-soft) border border-(--hairline-soft) text-(--muted)">
                  {typeItems.length}
                </span>
              </div>

              <div className="space-y-2">
                {typeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-(--surface-card) hover:bg-(--surface-soft) border border-(--hairline) shadow-xs transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs text-(--ink) truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-(--muted)">
                          Deleted {formatDate(item.deletedAt)}
                        </span>
                        <span className={`text-[10px] font-medium flex items-center gap-1 ${getDaysColor(item.daysRemaining)}`}>
                          <Clock className="w-3 h-3" />
                          {item.daysRemaining} days left
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="secondary" size="sm" onClick={() => handleRestore(item.id)} className="text-xs">
                        <RotateCcw className="w-3 h-3 mr-1" /> Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePermanentDelete(item.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 p-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Trash Confirmation */}
      <ConfirmDialog
        isOpen={confirmEmpty}
        onClose={() => setConfirmEmpty(false)}
        onConfirm={handleEmptyTrash}
        title="Empty Trash?"
        message="This will permanently delete ALL items in your trash. This action cannot be undone."
        confirmLabel="Empty Trash"
        confirmText="DELETE ALL"
        variant="danger"
        loading={emptyLoading}
      />
    </PageShell>
  );
}
