"use client";
import { useState, useEffect } from"react";
import { Check, ArrowRight } from"lucide-react";
import { BrutalModal } from"@/components/ui/BrutalModal";
import api from"@/lib/api";

const CATEGORY_COLORS = {
 modern:"bg-(--accent-amber) text-white",
 classic:"bg-(--surface-dark) text-white",
 minimal:"bg-gray-200 text-black",
 creative:"bg-purple-300 text-black",
 academic:"bg-(--primary) text-black",
};

export const BUILTIN_TEMPLATES = [
 {
 id:"tpl_modern_tech",
 name:"Modern Tech",
 description:"Clean single-column format with vibrant blue accents, optimized for software engineers and tech roles.",
 category:"modern",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"Inter, -apple-system, sans-serif",
 fontSize: 10.5,
 accentColor:"#2563EB",
 primaryColor:"#111827",
 }
 },
 {
 id:"tpl_minimal_exec",
 name:"Minimal Executive",
 description:"Sleek, high-density layout with elegant typography. Maximum ATS compatibility for leadership and management.",
 category:"minimal",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"Georgia, serif",
 fontSize: 10.5,
 accentColor:"#000000",
 primaryColor:"#1A1A1A",
 }
 },
 {
 id:"tpl_classic_pro",
 name:"Classic Professional",
 description:"Traditional corporate styling with subtle navy accents. Perfect for finance, consulting, and enterprise.",
 category:"classic",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"Times New Roman, serif",
 fontSize: 11,
 accentColor:"#1E3A8A",
 primaryColor:"#1F2937",
 }
 },
 {
 id:"tpl_silicon_valley",
 name:"Silicon Valley Compact",
 description:"Ultra-compact 1-page format with emerald highlights and bullet point emphasis. Ideal for fast-paced startups.",
 category:"modern",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
 fontSize: 10,
 accentColor:"#059669",
 primaryColor:"#111827",
 }
 },
 {
 id:"tpl_creative_designer",
 name:"Creative Developer",
 description:"Distinctive neo-brutalist flair with violet borders and bold section headers for creative technologists.",
 category:"creative",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"Space Grotesk, sans-serif",
 fontSize: 10.5,
 accentColor:"#7C3AED",
 primaryColor:"#0F172A",
 }
 },
 {
 id:"tpl_academic_scholar",
 name:"Academic & Research",
 description:"Comprehensive layout with dedicated sections for publications, research, and thesis work.",
 category:"academic",
 isFree: true,
 templateData: {
 layout:"single-column",
 fontFamily:"Garamond, Georgia, serif",
 fontSize: 11,
 accentColor:"#D97706",
 primaryColor:"#18181B",
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
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="p-5 rounded-2xl border border-(--hairline) bg-(--surface-card) animate-pulse space-y-3 min-h-55">
 <div className="h-4 bg-(--surface-soft) rounded-full w-20" />
 <div className="h-5 bg-(--surface-soft) rounded-lg w-3/4" />
 <div className="h-3 bg-(--surface-soft) rounded-lg w-full" />
 <div className="h-3 bg-(--surface-soft) rounded-lg w-2/3" />
 </div>
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2 max-h-[70vh] overflow-y-auto">
 {templates.map(t => (
 <button 
 key={t.id} 
 type="button"
 onClick={() => { onSelect(t); onClose(); }}
 className={`relative p-5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-55 ${
 currentTemplateId === t.id 
 ? "bg-(--surface-card) border-(--primary) ring-1 ring-(--primary)/40 shadow-sm" 
 : "bg-(--surface-card) border-(--hairline) hover:border-(--primary)/40 hover:bg-(--surface-soft) shadow-xs"
 }`}
 >
 <div>
 <div className="flex items-center justify-between gap-2 mb-3">
 <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-(--hairline-soft) bg-(--surface-soft) text-(--muted)">
 {t.category}
 </span>
 {currentTemplateId === t.id && (
 <span className="flex items-center gap-1 bg-(--primary) text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-xs">
 <Check className="w-3 h-3" /> ACTIVE
 </span>
 )}
 </div>
 <h3 className="font-serif font-medium text-base text-(--ink)">{t.name}</h3>
 <p className="text-xs text-(--muted) mt-2 leading-relaxed">{t.description}</p>
 </div>

 <div className="pt-4 border-t border-(--hairline-soft) flex items-center justify-between text-xs text-(--muted-soft)">
 <span>{t.columns === 2 ? "Two Column" : "Single Column"}</span>
 <span className="font-mono text-[11px] text-(--primary)">ATS: {t.atsTarget || "90+"}%</span>
 </div>
 </button>
 ))}
 </div>
 )}
 </BrutalModal>
 );
}
