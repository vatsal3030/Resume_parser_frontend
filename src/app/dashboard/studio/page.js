"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Save, Download, FileText, LayoutTemplate, Plus, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/ui/PageShell";
import api from "@/lib/api";
import { formatDate } from "@/lib/formatDate";
import { useToast } from "@/components/ui/toast";
import { TemplateSelector } from "@/components/studio/TemplateSelector";
import { PersonalEditor, SummaryEditor, ExperienceEditor, EducationEditor, SkillsEditor, ProjectsEditor, CertificationsEditor } from "@/components/studio/SectionEditor";
import { ResumePreview } from "@/components/studio/ResumePreview";
import { ATSScoreIndicator } from "@/components/studio/ATSScoreIndicator";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSectionWrapper } from "@/components/studio/SortableSectionWrapper";

const DEFAULT_DATA = {
  personal: { name: "", email: "", phone: "", linkedin: "", location: "", website: "" },
  summary: "", experience: [], education: [], skills: [], projects: [], certifications: [],
};
const DEFAULT_ORDER = ["personal", "summary", "experience", "education", "skills", "projects", "certifications"];

export default function ResumeStudio() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const rawId = params?.id;
  const urlResumeId = Array.isArray(rawId) ? rawId[0] : (rawId || searchParams?.get("id"));

  // Resume list vs editor mode
  const [mode, setMode] = useState(urlResumeId ? "editor" : "list");
  const [resumes, setResumes] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  // Editor state
  const [resumeId, setResumeId] = useState(urlResumeId || null);
  const [title, setTitle] = useState("Untitled Resume");
  const [data, setData] = useState(DEFAULT_DATA);
  const [sectionOrder, setSectionOrder] = useState(DEFAULT_ORDER);
  const [styleConfig, setStyleConfig] = useState({});
  const [templateId, setTemplateId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [revertDialogOpen, setRevertDialogOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const exportMenuRef = useRef(null);
  const [zoom, setZoom] = useState(0.85);
  const [loadingAI, setLoadingAI] = useState(null);

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

  const markDirty = () => { dirty.current = true; };

  const openResume = async (id) => {
    try {
      const res = await api.get(`/studio/resumes/${id}`);
      const r = res.data;
      setResumeId(r.id);
      setTitle(r.title);
      setData(r.data || DEFAULT_DATA);
      setSectionOrder(r.sectionOrder || DEFAULT_ORDER);
      setStyleConfig(r.styleConfig || {});
      setTemplateId(r.templateId || null);
      setMode("editor");
      dirty.current = false;
      router.push(`/dashboard/studio/${id}`);
    } catch (e) {
      toast.error("Error", "Failed to load resume.");
    }
  };

  const createNew = async (template) => {
    try {
      const payload = {
        title: "Untitled Resume",
        templateId: template?.id || null,
        data: template?.templateData?.sampleData || DEFAULT_DATA,
        sectionOrder: template?.templateData?.defaultSectionOrder || DEFAULT_ORDER,
        styleConfig: template?.templateData?.style || {},
      };
      const res = await api.post(`/studio/resumes`, payload);
      const r = res.data;
      setResumeId(r.id);
      setTitle(r.title);
      setData(r.data);
      setSectionOrder(r.sectionOrder);
      setStyleConfig(r.styleConfig);
      setTemplateId(r.templateId);
      setMode("editor");
      dirty.current = false;
      router.push(`/dashboard/studio/${r.id}`);
      setTemplateOpen(false);
      toast.success("Created", "New resume created.");
    } catch (e) {
      toast.error("Error", "Failed to create resume.");
    }
  };

  const handleBackToList = () => {
    if (dirty.current) {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
    }
    setMode("list");
    setResumeId(null);
    dirty.current = false;
    router.push("/dashboard/studio");
    fetchList();
  };

  const save = async () => {
    if (!resumeId) return;
    setSaving(true);
    try {
      await api.put(`/studio/resumes/${resumeId}`, {
        title,
        data,
        sectionOrder,
        styleConfig,
        templateId,
      });
      dirty.current = false;
      toast.success("Saved", "Resume updated successfully.");
    } catch (e) {
      toast.error("Save Failed", e.message);
    } finally {
      setSaving(false);
    }
  };

  const revertChanges = () => {
    openResume(resumeId);
    dirty.current = false;
    toast.info("Reverted", "Restored to last saved version.");
  };

  const updateSection = (key, value) => {
    setData(prev => ({ ...prev, [key]: value }));
    markDirty();
  };

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

  const handleTemplateSelect = (t) => {
    setTemplateId(t.id);
    if (t.templateData?.style) setStyleConfig(t.templateData.style);
    if (t.templateData?.defaultSectionOrder) setSectionOrder(t.templateData.defaultSectionOrder);
    markDirty();
    toast.success("Template Applied", t.name);
  };

  const renderEditor = (key) => {
    switch (key) {
      case "personal": return <PersonalEditor data={data.personal} onChange={v => updateSection("personal", v)} />;
      case "summary": return <SummaryEditor data={data.summary} onChange={v => updateSection("summary", v)} />;
      case "experience": return <ExperienceEditor data={data.experience} onChange={v => updateSection("experience", v)} onAIRewrite={handleAIRewrite} loadingAI={loadingAI} />;
      case "education": return <EducationEditor data={data.education} onChange={v => updateSection("education", v)} />;
      case "skills": return <SkillsEditor data={data.skills} onChange={v => updateSection("skills", v)} />;
      case "projects": return <ProjectsEditor data={data.projects} onChange={v => updateSection("projects", v)} />;
      case "certifications": return <CertificationsEditor data={data.certifications} onChange={v => updateSection("certifications", v)} />;
      default: return <p className="text-xs text-(--muted) italic">Editor for &quot;{key}&quot; coming soon</p>;
    }
  };

  // ==================== LIST MODE ====================
  if (mode === "list") {
    return (
      <PageShell
        title="Resume Studio"
        subtitle="Build ATS-safe, beautifully formatted resumes with live preview."
        actions={
          <Button onClick={() => setTemplateOpen(true)} className="text-xs">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Resume
          </Button>
        }
      >
        {listLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 shadow-xs space-y-3">
                <div className="h-4 bg-(--surface-soft) rounded-md w-3/4" />
                <div className="h-3 bg-(--surface-soft) rounded w-1/2" />
                <div className="h-2.5 bg-(--surface-soft) rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border border-dashed border-(--hairline) bg-(--surface-card)">
            <FileText className="w-12 h-12 text-(--muted) mx-auto mb-3 opacity-40" />
            <h2 className="text-base font-serif font-medium text-(--ink) mb-1">No Resumes Yet</h2>
            <p className="text-xs text-(--muted) mb-4">Pick a template to build your first professional resume.</p>
            <Button onClick={() => setTemplateOpen(true)} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map(r => (
              <button key={r.id} onClick={() => openResume(r.id)}
                className="text-left p-6 rounded-2xl bg-(--surface-card) hover:bg-(--surface-soft) border border-(--hairline) hover:border-(--primary)/50 shadow-xs hover:shadow-sm transition-all group">
                <h3 className="font-serif font-medium text-base text-(--ink) truncate group-hover:text-(--primary) transition-colors">{r.title}</h3>
                <p className="text-xs text-(--muted) mt-1">{r.template?.name || "No template"} · {r.template?.category || ""}</p>
                <p className="text-[10px] text-(--muted-soft) mt-3">Updated {formatDate(r.updatedAt)}</p>
              </button>
            ))}
          </div>
        )}

        <TemplateSelector isOpen={templateOpen} onClose={() => setTemplateOpen(false)} onSelect={createNew} />
      </PageShell>
    );
  }

  // ==================== EDITOR MODE ====================
  return (
    <div className="min-h-[calc(100vh-80px)] bg-(--canvas) flex flex-col xl:flex-row">
      {/* LEFT: Editor */}
      <div className="w-full xl:w-1/2 p-4 md:p-6 overflow-y-auto border-r-0 xl:border-r border-(--hairline) xl:h-[calc(100vh-80px)] pb-12">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 mb-6 border-b border-(--hairline-soft) pb-4">
          <div className="flex items-center gap-3">
            <button onClick={handleBackToList} className="p-2 rounded-xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) text-(--ink) transition-colors" title="Back to Resumes">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <input 
              className="text-xl font-serif font-medium text-(--ink) bg-transparent outline-none border-b border-transparent focus:border-(--primary)"
              value={title} onChange={e => { setTitle(e.target.value); markDirty(); }} 
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => setRevertDialogOpen(true)} className="text-xs h-8 px-2.5" title="Revert to last saved">
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Revert
            </Button>
            <Button variant="secondary" onClick={() => setTemplateOpen(true)} className="text-xs h-8 px-2.5">
              <LayoutTemplate className="w-3.5 h-3.5 mr-1" /> Template
            </Button>
            
            <div className="relative" ref={exportMenuRef}>
              <Button variant="secondary" onClick={() => setExportOpen(!exportOpen)} className="text-xs h-8 px-2.5">
                <Download className="w-3.5 h-3.5 mr-1" /> Export
              </Button>
              {exportOpen && (
                <div className="absolute right-0 mt-1.5 w-36 rounded-xl bg-(--surface-card) border border-(--hairline) shadow-md z-50 p-1">
                  <button onClick={exportPDF} className="w-full text-left px-3 py-1.5 text-xs text-(--ink) hover:bg-(--surface-soft) rounded-lg transition-colors">Export PDF</button>
                  <button onClick={exportJSON} className="w-full text-left px-3 py-1.5 text-xs text-(--ink) hover:bg-(--surface-soft) rounded-lg transition-colors">Export JSON</button>
                  <button onClick={exportTXT} className="w-full text-left px-3 py-1.5 text-xs text-(--ink) hover:bg-(--surface-soft) rounded-lg transition-colors">Export TXT</button>
                </div>
              )}
            </div>

            <Button variant="default" onClick={save} disabled={saving} className="text-xs h-8 px-3.5">
              <Save className="w-3.5 h-3.5 mr-1" /> {saving ? "Saving..." : "Save"}
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
      <div className="w-full xl:w-1/2 bg-(--canvas) p-8 flex flex-col items-center overflow-y-auto xl:h-[calc(100vh-80px)] pb-12 relative border-l border-(--hairline-soft)">
        <ATSScoreIndicator data={data} className="w-full max-w-[210mm] mb-4" />
        
        {/* Zoom Controls */}
        <div className="sticky top-4 z-10 flex items-center gap-1 mb-4 bg-(--surface-card) border border-(--hairline) p-1 shadow-xs rounded-xl">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="w-7 h-7 rounded-lg text-xs font-medium text-(--ink) hover:bg-(--surface-soft) flex items-center justify-center transition-colors">-</button>
          <span className="w-12 text-center text-xs font-medium text-(--muted)">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, z + 0.1))} className="w-7 h-7 rounded-lg text-xs font-medium text-(--ink) hover:bg-(--surface-soft) flex items-center justify-center transition-colors">+</button>
        </div>

        <div className="origin-top transition-transform shadow-lg rounded-xl overflow-hidden" style={{ transform: `scale(${zoom})` }}>
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
