"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Save, Download, FileText, Code, LayoutTemplate, Plus, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import { useToast } from "@/components/ui/toast";
import { TemplateSelector } from "@/components/studio/TemplateSelector";
import { PersonalEditor, SummaryEditor, ExperienceEditor, EducationEditor, SkillsEditor, ProjectsEditor, CertificationsEditor, SectionWrapper } from "@/components/studio/SectionEditor";
import { ResumePreview } from "@/components/studio/ResumePreview";
import { ATSScoreIndicator } from "@/components/studio/ATSScoreIndicator";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSectionWrapper } from "@/components/studio/SortableSectionWrapper";

const API = process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_DATA = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "", website: "" },
  summary: "", experience: [], education: [], skills: [], projects: [], certifications: [],
};
const DEFAULT_ORDER = ["personal", "summary", "experience", "education", "skills", "projects", "certifications"];

export default function ResumeStudio() {
  // Resume list vs editor mode
  const [mode, setMode] = useState("list"); // "list" | "editor"
  const [resumes, setResumes] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Editor state
  const [resumeId, setResumeId] = useState(null);
  const [title, setTitle] = useState("Untitled Resume");
  const [data, setData] = useState(DEFAULT_DATA);
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_ORDER);
  const [styleConfig, setStyleConfig] = useState({});
  const [templateId, setTemplateId] = useState(null);
  const [version, setVersion] = useState(1);
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const versionRef = useRef(1);
  const exportMenuRef = useRef(null);
  const [zoom, setZoom] = useState(0.85); // Default zoom level
  const [loadingAI, setLoadingAI] = useState(null);

  // Handle click outside for export menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toast = useToast();
  const autosaveTimer = useRef(null);
  const dirty = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      markDirty();
    }
  };

  // Fetch resume list
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await api.get(`/studio/resumes`);
      if (Array.isArray(res.data)) {
        setResumes(res.data);
      } else {
        setResumes([]);
      }
    } catch (e) { 
      if (e.response?.status === 401) {
        toast.error("Session Expired", "Please log in again.");
        window.location.href = "/login";
      }
      console.error(e); 
      setResumes([]);
    }
    finally { setListLoading(false); }
  }, [toast]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // Prevent accidental reload if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (dirty.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Open editor
  const openResume = async (id) => {
    try {
      const res = await api.get(`/studio/resumes/${id}`);
      const r = res.data;
      setResumeId(r.id); setTitle(r.title); setData(r.resumeData || DEFAULT_DATA);
      setSectionOrder(r.sectionOrder || DEFAULT_ORDER); setStyleConfig(r.styleConfig || {});
      setTemplateId(r.templateId); setVersion(r.version); versionRef.current = r.version; setMode("editor");
    } catch (e) { toast.error("Error", "Failed to load resume"); }
  };

  // Create new
  const createNew = async (template) => {
    try {
      const res = await api.post(`/studio/resumes`, { title: "Untitled Resume", templateId: template?.id });
      const r = res.data;
      await openResume(r.id);
      toast.success("Created", "New resume created!");
    } catch (e) { toast.error("Error", "Failed to create resume"); }
  };

  // Save
  const save = useCallback(async () => {
    if (!resumeId || saving) return;
    setSaving(true);
    try {
      const res = await api.put(`/studio/resumes/${resumeId}`, { title, resumeData: data, sectionOrder, styleConfig, version: versionRef.current });
      const updated = res.data;
      setVersion(updated.version);
      versionRef.current = updated.version;
      dirty.current = false;
    } catch (e) { 
      if (e.response?.status === 409) { 
        toast.warning("Conflict Resolved", "Updated version synced with server."); 
        versionRef.current = e.response.data.serverVersion;
        // Re-save with correct version
        setTimeout(() => markDirty(), 1000);
        return; 
      }
      toast.error("Error", "Failed to save"); 
    }
    finally { setSaving(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId, title, data, sectionOrder, styleConfig, saving, toast]);

  // Autosave (3s debounce)
  const markDirty = useCallback(() => {
    dirty.current = true;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => { if (dirty.current) save(); }, 3000);
  }, [save]);

  // Revert changes
  const revertChanges = () => {
    openResume(resumeId);
    dirty.current = false;
    toast.info("Reverted", "Restored to last saved version.");
  };

  // Update data helper
  const updateSection = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    markDirty();
  };

  // AI bullet rewrite
  const handleAIRewrite = async (expIdx, bulletIdx, text, action) => {
    if (!text.trim()) return;
    setLoadingAI(`${expIdx}-${bulletIdx}`);
    try {
      const res = await api.post("/career/rewrite-bullet", { text, action });
      if (res.data?.result) {
        const next = [...data.experience];
        const bullets = [...next[expIdx].bullets]; bullets[bulletIdx] = res.data.result;
        next[expIdx] = { ...next[expIdx], bullets };
        updateSection("experience", next);
      }
    } catch (e) { toast.error("AI Error", "Rewrite failed"); }
    finally { setLoadingAI(null); }
  };

  // Export Formats
  const exportPDF = async () => {
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().from(document.getElementById("resume-preview")).set({
      margin: 0, filename: `${title}.pdf`, html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }).save();
    setExportOpen(false);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title}.json`);
    dlAnchorElem.click();
    setExportOpen(false);
  };

  const exportTXT = () => {
    let text = `${data.personal?.name || ''}\n${data.personal?.email || ''} | ${data.personal?.phone || ''}\n\n`;
    text += `SUMMARY\n${data.summary || ''}\n\n`;
    text += `EXPERIENCE\n`;
    data.experience?.forEach(exp => {
      text += `${exp.role} at ${exp.company} (${exp.duration})\n`;
      exp.bullets?.forEach(b => text += `- ${b}\n`);
      text += '\n';
    });
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(text);
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `${title}.txt`);
    dlAnchorElem.click();
    setExportOpen(false);
  };

  // Template select
  const handleTemplateSelect = (t) => {
    setTemplateId(t.id);
    if (t.templateData?.style) setStyleConfig(t.templateData.style);
    if (t.templateData?.defaultSectionOrder) setSectionOrder(t.templateData.defaultSectionOrder);
    markDirty();
    toast.success("Template Applied", t.name);
  };

  // Render section editor by key
  const renderEditor = (key) => {
    switch (key) {
      case "personal": return <PersonalEditor data={data.personal} onChange={v => updateSection("personal", v)} />;
      case "summary": return <SummaryEditor data={data.summary} onChange={v => updateSection("summary", v)} />;
      case "experience": return <ExperienceEditor data={data.experience} onChange={v => updateSection("experience", v)} onAIRewrite={handleAIRewrite} loadingAI={loadingAI} />;
      case "education": return <EducationEditor data={data.education} onChange={v => updateSection("education", v)} />;
      case "skills": return <SkillsEditor data={data.skills} onChange={v => updateSection("skills", v)} />;
      case "projects": return <ProjectsEditor data={data.projects} onChange={v => updateSection("projects", v)} />;
      case "certifications": return <CertificationsEditor data={data.certifications} onChange={v => updateSection("certifications", v)} />;
      default: return <p className="text-xs text-gray-400 italic">Editor for &quot;{key}&quot; coming soon</p>;
    }
  };

  // ==================== LIST MODE ====================
  if (mode === "list") {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 border-b-4 border-brutal-black pb-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Resume Studio</h1>
            <p className="text-lg font-bold bg-brutal-yellow inline-block px-2 border-2 border-brutal-black mt-2">Build ATS-safe, beautiful resumes</p>
          </div>
          <Button onClick={() => setTemplateOpen(true)} variant="brutal" className="gap-2 bg-brutal-mint">
            <Plus className="w-4 h-4" /> New Resume
          </Button>
        </div>

        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-gray-100 border-4 border-brutal-black skeleton-shimmer" />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 border-4 border-dashed border-brutal-black">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-black uppercase mb-2">No Resumes Yet</h2>
            <p className="font-bold text-gray-500 mb-4">Pick a template to get started</p>
            <Button onClick={() => setTemplateOpen(true)} variant="brutal" className="bg-brutal-yellow gap-2">
              <Plus className="w-4 h-4" /> Create First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(r => (
              <button key={r.id} onClick={() => openResume(r.id)}
                className="text-left p-5 bg-white border-4 border-brutal-black shadow-brutal hover:shadow-brutal-sm transition-all group">
                <h3 className="font-black text-lg truncate group-hover:text-brutal-blue">{r.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{r.template?.name || "No template"} · {r.template?.category || ""}</p>
                <p className="text-[10px] text-gray-400 mt-2">Updated {formatDate(r.updatedAt)}</p>
              </button>
            ))}
          </div>
        )}

        <TemplateSelector isOpen={templateOpen} onClose={() => setTemplateOpen(false)} onSelect={createNew} />
      </div>
    );
  }

  // ==================== EDITOR MODE ====================
  return (
    <div className="min-h-[calc(100vh-80px)] bg-brutal-bg flex flex-col xl:flex-row">
      {/* LEFT: Editor */}
      <div className="w-full xl:w-1/2 p-4 md:p-6 overflow-y-auto border-r-0 xl:border-r-4 border-brutal-black xl:h-[calc(100vh-80px)] pb-12">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-6 border-b-4 border-brutal-black pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { if (dirty.current) save(); setMode("list"); fetchList(); }} className="p-1.5 border-2 border-brutal-black hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input className="text-2xl font-black uppercase tracking-tighter bg-transparent outline-none border-b-2 border-transparent focus:border-brutal-black"
              value={title} onChange={e => { setTitle(e.target.value); markDirty(); }} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => setRevertDialogOpen(true)} className="gap-1 border-2 border-brutal-black font-bold text-xs h-8 px-2" title="Revert to last saved">
              <RotateCcw className="w-3 h-3" /> Revert
            </Button>
            <Button variant="ghost" onClick={() => setTemplateOpen(true)} className="gap-1 border-2 border-brutal-black font-bold text-xs h-8 px-2">
              <LayoutTemplate className="w-3 h-3" /> Template
            </Button>
            
            <div className="relative" ref={exportMenuRef}>
              <Button variant="ghost" onClick={() => setExportOpen(!exportOpen)} className="gap-1 border-2 border-brutal-black font-bold text-xs h-8 px-2">
                <Download className="w-3 h-3" /> Export
              </Button>
              {exportOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] z-50">
                  <button onClick={exportPDF} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-brutal-yellow border-b-2 border-brutal-black">Export PDF</button>
                  <button onClick={exportJSON} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-brutal-pink border-b-2 border-brutal-black">Export JSON</button>
                  <button onClick={exportTXT} className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-brutal-mint">Export TXT</button>
                </div>
              )}
            </div>

            <Button variant="brutal" onClick={save} disabled={saving} className="gap-1 text-xs h-8 px-3">
              <Save className="w-3 h-3" /> {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            {sectionOrder.map(key => (
              <SortableSectionWrapper key={key} id={key} sectionKey={key}>
                {renderEditor(key)}
              </SortableSectionWrapper>
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* RIGHT: Preview */}
      <div className="w-full xl:w-1/2 bg-slate-200 p-8 flex flex-col items-center overflow-y-auto xl:h-[calc(100vh-80px)] pb-12 relative">
        <ATSScoreIndicator data={data} className="w-full max-w-[210mm] mb-4" />
        
        {/* Zoom Controls */}
        <div className="sticky top-4 z-10 flex gap-2 mb-4 bg-white border-2 border-brutal-black p-1 shadow-brutal-sm rounded-none">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-8 h-8 flex items-center justify-center font-bold border-2 border-transparent hover:border-brutal-black">-</button>
          <span className="w-12 flex items-center justify-center font-bold text-sm">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="w-8 h-8 flex items-center justify-center font-bold border-2 border-transparent hover:border-brutal-black">+</button>
        </div>

        <div className="origin-top transition-transform" style={{ transform: `scale(${zoom})` }}>
          <ResumePreview data={data} sectionOrder={sectionOrder} styleConfig={styleConfig} />
        </div>
      </div>

      <TemplateSelector isOpen={templateOpen} onClose={() => setTemplateOpen(false)} onSelect={handleTemplateSelect} currentTemplateId={templateId} />
      
      <ConfirmDialog 
        isOpen={revertDialogOpen}
        onClose={() => setRevertDialogOpen(false)}
        onConfirm={revertChanges}
        title="Revert Changes"
        description="Are you sure you want to revert to the last saved version? All unsaved changes will be lost."
      />
    </div>
  );
}
