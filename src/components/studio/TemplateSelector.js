"use client";
import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { BrutalModal } from "@/components/ui/BrutalModal";
import api from "@/lib/api";

const API = process.env.NEXT_PUBLIC_API_URL;

const CATEGORY_COLORS = {
  modern: "bg-brutal-blue text-white",
  classic: "bg-brutal-black text-white",
  minimal: "bg-gray-200",
  creative: "bg-purple-300",
  academic: "bg-brutal-yellow",
};

export function TemplateSelector({ isOpen, onClose, onSelect, currentTemplateId }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    api.get(`/studio/templates`)
      .then(r => setTemplates(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [isOpen]);

  return (
    <BrutalModal isOpen={isOpen} onClose={onClose} title="Choose Template" size="lg">
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-40 bg-gray-100 border-4 border-brutal-black skeleton-shimmer" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4">
          {templates.map(t => (
            <button key={t.id} onClick={() => { onSelect(t); onClose(); }}
              className={`relative p-4 border-4 border-brutal-black text-left transition-all hover:shadow-brutal ${
                currentTemplateId === t.id ? "bg-brutal-mint shadow-brutal" : "bg-white hover:bg-gray-50"
              }`}>
              {currentTemplateId === t.id && (
                <div className="absolute top-2 right-2 bg-brutal-black text-white p-1"><Check className="w-3 h-3" /></div>
              )}
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border border-brutal-black ${CATEGORY_COLORS[t.category] || "bg-gray-100"}`}>
                {t.category}
              </span>
              <h3 className="font-black text-sm mt-2">{t.name}</h3>
              <p className="text-[10px] text-gray-500 mt-1">{t.description}</p>
              <div className="mt-2 text-[10px] font-bold">{t.templateData?.layout || "single-column"}</div>
            </button>
          ))}
        </div>
      )}
    </BrutalModal>
  );
}
