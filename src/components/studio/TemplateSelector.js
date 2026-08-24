"use client";
import { useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";
import { BrutalModal } from "@/components/ui/BrutalModal";
import api from "@/lib/api";

const CATEGORY_COLORS = {
  modern: "bg-brutal-blue text-white",
  classic: "bg-brutal-black text-white",
  minimal: "bg-gray-200 text-black",
  creative: "bg-purple-300 text-black",
  academic: "bg-brutal-yellow text-black",
};

export const BUILTIN_TEMPLATES = [
  {
    id: "tpl_modern_tech",
    name: "Modern Tech",
    description: "Clean single-column format with vibrant blue accents, optimized for software engineers and tech roles.",
    category: "modern",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "Inter, -apple-system, sans-serif",
      fontSize: 10.5,
      accentColor: "#2563EB",
      primaryColor: "#111827",
    }
  },
  {
    id: "tpl_minimal_exec",
    name: "Minimal Executive",
    description: "Sleek, high-density layout with elegant typography. Maximum ATS compatibility for leadership and management.",
    category: "minimal",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "Georgia, serif",
      fontSize: 10.5,
      accentColor: "#000000",
      primaryColor: "#1A1A1A",
    }
  },
  {
    id: "tpl_classic_pro",
    name: "Classic Professional",
    description: "Traditional corporate styling with subtle navy accents. Perfect for finance, consulting, and enterprise.",
    category: "classic",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "Times New Roman, serif",
      fontSize: 11,
      accentColor: "#1E3A8A",
      primaryColor: "#1F2937",
    }
  },
  {
    id: "tpl_silicon_valley",
    name: "Silicon Valley Compact",
    description: "Ultra-compact 1-page format with emerald highlights and bullet point emphasis. Ideal for fast-paced startups.",
    category: "modern",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 10,
      accentColor: "#059669",
      primaryColor: "#111827",
    }
  },
  {
    id: "tpl_creative_designer",
    name: "Creative Developer",
    description: "Distinctive neo-brutalist flair with violet borders and bold section headers for creative technologists.",
    category: "creative",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "Space Grotesk, sans-serif",
      fontSize: 10.5,
      accentColor: "#7C3AED",
      primaryColor: "#0F172A",
    }
  },
  {
    id: "tpl_academic_scholar",
    name: "Academic & Research",
    description: "Comprehensive layout with dedicated sections for publications, research, and thesis work.",
    category: "academic",
    isFree: true,
    templateData: {
      layout: "single-column",
      fontFamily: "Garamond, Georgia, serif",
      fontSize: 11,
      accentColor: "#D97706",
      primaryColor: "#18181B",
    }
  }
];

export function TemplateSelector({ isOpen, onClose, onSelect, currentTemplateId }) {
  const [templates, setTemplates] = useState(BUILTIN_TEMPLATES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get('/studio/templates')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length > 0) {
          setTemplates(r.data);
        } else {
          setTemplates(BUILTIN_TEMPLATES);
        }
      })
      .catch(() => setTemplates(BUILTIN_TEMPLATES))
      .finally(() => setLoading(false));
  }, [isOpen]);

  return (
    <BrutalModal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Choose Template" 
      description="Select an ATS-optimized layout for your resume"
      maxWidth="max-w-5xl"
    >
      {loading && templates.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 border-4 border-brutal-black bg-white animate-pulse space-y-3 min-h-[220px]">
              <div className="h-5 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-300 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 max-h-[70vh] overflow-y-auto">
          {templates.map(t => (
            <button 
              key={t.id} 
              type="button"
              onClick={() => { onSelect(t); onClose(); }}
              className={`relative p-5 border-4 border-brutal-black text-left transition-all flex flex-col justify-between min-h-[220px] ${
                currentTemplateId === t.id 
                  ? "bg-brutal-mint shadow-[6px_6px_0_#000] -translate-y-1 ring-2 ring-black" 
                  : "bg-white hover:bg-yellow-50 hover:shadow-[6px_6px_0_#000] hover:-translate-y-1"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 border-2 border-brutal-black shadow-[2px_2px_0_#000] ${CATEGORY_COLORS[t.category] || "bg-gray-100 text-black"}`}>
                    {t.category}
                  </span>
                  {currentTemplateId === t.id && (
                    <span className="flex items-center gap-1 bg-brutal-black text-white text-[11px] font-black px-2 py-0.5 shadow-[2px_2px_0_#000]">
                      <Check className="w-3.5 h-3.5" /> ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="font-black text-lg text-brutal-black tracking-tight">{t.name}</h3>
                <p className="text-xs text-gray-700 font-medium mt-2 leading-relaxed">{t.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t-2 border-dashed border-gray-300 flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-gray-600 capitalize truncate">
                  {t.templateData?.layout ? t.templateData.layout.replace('-', ' ') : "Single Column"}
                </span>
                <span className="font-black text-black uppercase flex items-center gap-1 shrink-0 group-hover:translate-x-1 transition-transform">
                  SELECT <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </BrutalModal>
  );
}
