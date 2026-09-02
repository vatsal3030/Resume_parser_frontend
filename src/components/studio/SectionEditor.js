"use client";
import { useState } from"react";
import { Plus, Trash2, GripVertical, Sparkles } from"lucide-react";
import { Button } from"@/components/ui/button";

const SECTION_LABELS = {
 personal: { label:"Personal", color:"bg-(--primary)" },
 summary: { label:"Summary", color:"bg-(--primary-active)" },
 experience: { label:"Experience", color:"bg-(--accent-amber) text-white" },
 education: { label:"Education", color:"bg-(--accent-teal)" },
 skills: { label:"Skills", color:"bg-purple-300" },
 projects: { label:"Projects", color:"bg-orange-300" },
 certifications: { label:"Certifications", color:"bg-green-300" },
};

export function PersonalEditor({ data, onChange }) {
 const update = (field, value) => onChange({ ...data, [field]: value });
 const fields = [
 ["name","Full Name"], ["email","Email"], ["phone","Phone"],
 ["linkedin","LinkedIn URL"], ["location","Location"], ["website","Website"],
 ];
 return (
 <div className="grid grid-cols-2 gap-3">
 {fields.map(([key, label]) => (
 <input key={key} className="border border-(--hairline) p-2 font-bold text-sm focus:bg-(--primary)/20 outline-none"
 value={data?.[key] ||""} onChange={e => update(key, e.target.value)} placeholder={label} />
 ))}
 </div>
 );
}

export function SummaryEditor({ data, onChange }) {
 return (
 <textarea className="w-full border border-(--hairline) p-3 font-medium text-sm min-h-[80px] focus:bg-(--primary-active)/10 outline-none resize-none"
 value={data ||""} onChange={e => onChange(e.target.value)} placeholder="Professional summary..." />
 );
}

export function ExperienceEditor({ data = [], onChange, onAIRewrite, loadingAI }) {
 const update = (idx, field, value) => {
 const next = [...data]; next[idx] = { ...next[idx], [field]: value }; onChange(next);
 };
 const updateBullet = (idx, bIdx, value) => {
 const next = [...data]; const bullets = [...(next[idx].bullets || [])]; bullets[bIdx] = value;
 next[idx] = { ...next[idx], bullets }; onChange(next);
 };
 const addEntry = () => onChange([...data, { id: `exp-${Date.now()}`, company:"", role:"", duration:"", bullets: [""] }]);
 const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx));
 const addBullet = (idx) => { const next = [...data]; next[idx].bullets = [...(next[idx].bullets || []),""]; onChange(next); };
 const removeBullet = (idx, bIdx) => { const next = [...data]; next[idx].bullets = next[idx].bullets.filter((_, i) => i !== bIdx); onChange(next); };

 return (
 <div className="space-y-4">
 {data.map((exp, i) => (
 <div key={exp.id || i} className="p-3 border border-(--hairline) bg-slate-50 relative group">
 <button onClick={() => removeEntry(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200">
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 <div className="grid grid-cols-2 gap-2 mb-3">
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={exp.role} onChange={e => update(i,"role", e.target.value)} placeholder="Role" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={exp.company} onChange={e => update(i,"company", e.target.value)} placeholder="Company" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs col-span-2" value={exp.duration} onChange={e => update(i,"duration", e.target.value)} placeholder="Duration" />
 </div>
 {(exp.bullets || []).map((b, bIdx) => (
 <div key={bIdx} className="mb-2">
 <div className="flex gap-1">
 <textarea className="flex-1 border border-(--hairline) p-1.5 text-xs min-h-[40px]" value={b} onChange={e => updateBullet(i, bIdx, e.target.value)} />
 <button onClick={() => removeBullet(i, bIdx)} className="px-1 hover:bg-red-200"><Trash2 className="w-3 h-3" /></button>
 </div>
 {onAIRewrite && (
 <div className="flex gap-1 mt-1">
 <button disabled={loadingAI === `${i}-${bIdx}`} onClick={() => onAIRewrite(i, bIdx, b,"enhance")}
 className="h-5 px-1.5 text-[9px] font-bold border border-(--hairline) bg-(--primary) hover:bg-yellow-300 flex items-center gap-0.5">
 <Sparkles className="w-2.5 h-2.5" /> Enhance
 </button>
 <button disabled={loadingAI === `${i}-${bIdx}`} onClick={() => onAIRewrite(i, bIdx, b,"quantify")}
 className="h-5 px-1.5 text-[9px] font-bold border border-(--hairline) bg-(--accent-teal) hover:bg-green-300 flex items-center gap-0.5">
 <Sparkles className="w-2.5 h-2.5" /> Quantify
 </button>
 </div>
 )}
 </div>
 ))}
 <button onClick={() => addBullet(i)} className="w-full mt-1 border-dashed border border-(--hairline) h-6 text-[10px] font-bold hover:bg-slate-200">+ Bullet</button>
 </div>
 ))}
 <Button onClick={addEntry} variant="ghost" className="w-full border border-dashed border-(--hairline) font-bold text-xs h-8">
 <Plus className="w-3 h-3 mr-1" /> Add Role
 </Button>
 </div>
 );
}

export function EducationEditor({ data = [], onChange }) {
 const update = (idx, field, value) => { const next = [...data]; next[idx] = { ...next[idx], [field]: value }; onChange(next); };
 const addEntry = () => onChange([...data, { id: `edu-${Date.now()}`, school:"", degree:"", duration:"", gpa:"" }]);
 const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx));
 return (
 <div className="space-y-3">
 {data.map((edu, i) => (
 <div key={edu.id || i} className="p-3 border border-(--hairline) bg-slate-50 relative group">
 <button onClick={() => removeEntry(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200">
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 <div className="grid grid-cols-2 gap-2">
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={edu.school} onChange={e => update(i,"school", e.target.value)} placeholder="School" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={edu.degree} onChange={e => update(i,"degree", e.target.value)} placeholder="Degree" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={edu.duration} onChange={e => update(i,"duration", e.target.value)} placeholder="Duration" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={edu.gpa ||""} onChange={e => update(i,"gpa", e.target.value)} placeholder="GPA (optional)" />
 </div>
 </div>
 ))}
 <Button onClick={addEntry} variant="ghost" className="w-full border border-dashed border-(--hairline) font-bold text-xs h-8">
 <Plus className="w-3 h-3 mr-1" /> Add Education
 </Button>
 </div>
 );
}

export function SkillsEditor({ data = [], onChange }) {
 const [newSkill, setNewSkill] = useState("");
 const [isAdding, setIsAdding] = useState(false);

 const addSkill = () => { 
 if (newSkill.trim()) {
 onChange([...data, newSkill.trim()]); 
 setNewSkill("");
 setIsAdding(false);
 }
 };

 const removeSkill = (idx) => onChange(data.filter((_, i) => i !== idx));
 
 return (
 <div>
 <div className="flex flex-wrap gap-2 mb-3">
 {data.map((s, i) => (
 <span key={i} className="text-xs font-bold px-2 py-1 bg-slate-200 border border-(--hairline) flex items-center gap-1">
 {s}
 <button onClick={() => removeSkill(i)} className="hover:text-red-500 ml-1">×</button>
 </span>
 ))}
 </div>
 {isAdding ? (
 <div className="flex gap-2 items-center">
 <input 
 autoFocus
 className="border border-(--hairline) p-1.5 font-bold text-xs outline-none focus:bg-purple-100" 
 value={newSkill} 
 onChange={e => setNewSkill(e.target.value)} 
 onKeyDown={e => e.key === 'Enter' && addSkill()}
 placeholder="Skill name..." 
 />
 <Button onClick={addSkill} variant="ghost" className="border border-(--hairline) bg-(--primary) hover:bg-yellow-300 font-bold text-xs h-7 px-3">
 Add
 </Button>
 <button onClick={() => { setIsAdding(false); setNewSkill(""); }} className="text-xs font-bold hover:underline">Cancel</button>
 </div>
 ) : (
 <Button onClick={() => setIsAdding(true)} variant="ghost" className="border border-dashed border-(--hairline) font-bold text-xs h-7 px-2">
 <Plus className="w-3 h-3 mr-1" /> Add Skill
 </Button>
 )}
 </div>
 );
}

export function ProjectsEditor({ data = [], onChange }) {
 const update = (idx, field, value) => { const next = [...data]; next[idx] = { ...next[idx], [field]: value }; onChange(next); };
 const addEntry = () => onChange([...data, { id: `proj-${Date.now()}`, name:"", description:"", url:"", technologies: [] }]);
 const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx));
 
 return (
 <div className="space-y-3">
 {data.map((proj, i) => (
 <div key={proj.id || i} className="p-3 border border-(--hairline) bg-slate-50 relative group">
 <button onClick={() => removeEntry(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200">
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 <div className="grid grid-cols-2 gap-2 mb-2">
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={proj.name} onChange={e => update(i,"name", e.target.value)} placeholder="Project Name" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={proj.url ||""} onChange={e => update(i,"url", e.target.value)} placeholder="URL (optional)" />
 </div>
 <textarea className="w-full border border-(--hairline) p-1.5 text-xs min-h-[50px] mb-2 resize-none" value={proj.description} onChange={e => update(i,"description", e.target.value)} placeholder="Project Description" />
 <input className="w-full border border-(--hairline) p-1.5 font-bold text-xs" value={(proj.technologies || []).join(",")} onChange={e => update(i,"technologies", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Technologies (comma separated)" />
 </div>
 ))}
 <Button onClick={addEntry} variant="ghost" className="w-full border border-dashed border-(--hairline) font-bold text-xs h-8">
 <Plus className="w-3 h-3 mr-1" /> Add Project
 </Button>
 </div>
 );
}

export function CertificationsEditor({ data = [], onChange }) {
 const update = (idx, field, value) => { const next = [...data]; next[idx] = { ...next[idx], [field]: value }; onChange(next); };
 const addEntry = () => onChange([...data, { id: `cert-${Date.now()}`, name:"", issuer:"", date:"" }]);
 const removeEntry = (idx) => onChange(data.filter((_, i) => i !== idx));

 return (
 <div className="space-y-3">
 {data.map((cert, i) => (
 <div key={cert.id || i} className="p-3 border border-(--hairline) bg-slate-50 relative group">
 <button onClick={() => removeEntry(i)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-200">
 <Trash2 className="w-3 h-3 text-red-500" />
 </button>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={cert.name} onChange={e => update(i,"name", e.target.value)} placeholder="Certification Name" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={cert.issuer} onChange={e => update(i,"issuer", e.target.value)} placeholder="Issuer (e.g. AWS)" />
 <input className="border border-(--hairline) p-1.5 font-bold text-xs" value={cert.date} onChange={e => update(i,"date", e.target.value)} placeholder="Date" />
 </div>
 </div>
 ))}
 <Button onClick={addEntry} variant="ghost" className="w-full border border-dashed border-(--hairline) font-bold text-xs h-8">
 <Plus className="w-3 h-3 mr-1" /> Add Certification
 </Button>
 </div>
 );
}

export function SectionWrapper({ sectionKey, children }) {
  const info = SECTION_LABELS[sectionKey] || { label: sectionKey, color: "bg-(--surface-soft)" };
  return (
    <section className="mb-4 rounded-2xl border border-(--hairline) bg-(--surface-card) p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <GripVertical className="w-4 h-4 text-(--muted) cursor-grab" />
        <h2 className="text-xs font-serif font-medium text-(--ink) px-2.5 py-0.5 rounded-full border border-(--hairline-soft) bg-(--surface-soft)">
          {info.label}
        </h2>
      </div>
      {children}
    </section>
  );
}
