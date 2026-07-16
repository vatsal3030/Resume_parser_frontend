"use client";
import React, { useState, useEffect } from "react";
import { Trash2, RotateCcw, AlertTriangle, Clock } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { Button } from "@/components/ui/button";
import { BrutalBadge } from "@/components/ui/BrutalBadge";
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
    if (days <= 3) return "text-red-600";
    if (days <= 7) return "text-orange-600";
    return "text-gray-500";
  };

  return (
    <PageShell
      title="Trash"
      subtitle="Items are permanently deleted after 30 days"
      subtitleColor="bg-red-200"
      actions={
        items.length > 0 && (
          <Button variant="pink" onClick={() => setConfirmEmpty(true)} className="bg-red-400 hover:bg-red-500">
            <Trash2 className="w-4 h-4 mr-2" /> Empty Trash
          </Button>
        )
      }
    >
      {error && <ErrorBanner message={error} onRetry={fetchTrash} onDismiss={() => setError(null)} className="mb-6" />}

      {loading ? (
        <div className="space-y-8 animate-pulse">
          {/* Group 1 skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <div className="h-4 bg-gray-300 rounded w-28" />
              <div className="h-5 bg-gray-200 border border-gray-300 rounded w-6" />
            </div>
            <div className="space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-4 border-brutal-black shadow-brutal">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-3/5 mb-2" />
                    <div className="flex items-center gap-3">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-8 bg-gray-200 border-2 border-gray-300 rounded w-20" />
                    <div className="h-8 bg-gray-100 border-2 border-gray-300 rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Group 2 skeleton */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-gray-300 rounded" />
              <div className="h-4 bg-gray-300 rounded w-24" />
              <div className="h-5 bg-gray-200 border border-gray-300 rounded w-6" />
            </div>
            <div className="space-y-2">
              {[1].map(i => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border-4 border-brutal-black shadow-brutal">
                  <div className="flex-1 min-w-0">
                    <div className="h-4 bg-gray-300 rounded w-2/5 mb-2" />
                    <div className="flex items-center gap-3">
                      <div className="h-3 bg-gray-200 rounded w-24" />
                      <div className="h-3 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <div className="h-8 bg-gray-200 border-2 border-gray-300 rounded w-20" />
                    <div className="h-8 bg-gray-100 border-2 border-gray-300 rounded w-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Trash2 className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-black uppercase mb-2">Trash is Empty</h2>
          <p className="font-bold text-gray-500">Deleted items will appear here for 30 days</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, typeItems]) => (
            <div key={type}>
              <h3 className="font-black uppercase tracking-tight text-sm mb-3 flex items-center gap-2">
                <span>{TOOL_ICONS[type] || "🗑️"}</span>
                {TOOL_LABELS[type] || type}
                <BrutalBadge variant="default" size="sm">{typeItems.length}</BrutalBadge>
              </h3>

              <div className="space-y-2">
                {typeItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-white border-4 border-brutal-black shadow-brutal hover:shadow-brutal-sm transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-gray-400">
                          Deleted {formatDate(item.deletedAt)}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${getDaysColor(item.daysRemaining)}`}>
                          <Clock className="w-3 h-3" />
                          {item.daysRemaining} days left
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button variant="mint" size="sm" onClick={() => handleRestore(item.id)}>
                        <RotateCcw className="w-3 h-3 mr-1" /> Restore
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePermanentDelete(item.id)}
                        className="hover:bg-red-100 hover:border-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
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
