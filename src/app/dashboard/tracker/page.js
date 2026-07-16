"use client";
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  CheckSquare, 
  Clock, 
  Edit3, 
  X, 
  ChevronRight, 
  Save, 
  ClipboardList, 
  Info, 
  AlertTriangle 
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/formatDate';

const COLUMNS = ['SAVED', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

const COL_COLORS = {
  'SAVED': 'bg-brutal-bg',
  'APPLIED': 'bg-brutal-yellow',
  'INTERVIEWING': 'bg-brutal-blue',
  'OFFER': 'bg-brutal-green',
  'REJECTED': 'bg-brutal-pink'
};

const parseNotes = (notesStr) => {
  try {
    if (notesStr && notesStr.trim().startsWith('{')) {
      const parsed = JSON.parse(notesStr);
      return {
        customNotes: parsed.customNotes || '',
        timeline: parsed.timeline || [],
        checklist: parsed.checklist || [],
        reminders: parsed.reminders || []
      };
    }
  } catch (e) {
    // Fail-soft, treat as normal text
  }
  return {
    customNotes: notesStr || '',
    timeline: [],
    checklist: [
      { id: 1, text: 'Tailor resume for role', done: false },
      { id: 2, text: 'Review company tech stack & projects', done: false },
      { id: 3, text: 'Prepare 3 STAR-method stories', done: false },
      { id: 4, text: 'Prepare interview questions for team', done: false }
    ],
    reminders: []
  };
};

const serializeNotes = (customNotes, timeline, checklist, reminders) => {
  return JSON.stringify({ customNotes, timeline, checklist, reminders });
};

export default function ApplicationTracker() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({ company: '', role: '', url: '', salary: '', notes: '' });
  
  // Details Modal State
  const [activeApp, setActiveApp] = useState(null);
  const [activeAppParsed, setActiveAppParsed] = useState(null);
  const [modalTab, setModalTab] = useState('details'); // details, checklist, reminders, timeline
  
  // Sub-items forms
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  
  const toast = useToast();

  const fetchApps = useCallback(async () => {
    try {
      const { data } = await api.get('/tracker');
      setApps(data);
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to load job applications.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Create with default checklist and a timeline entry
      const initialTimeline = [{ status: 'SAVED', date: new Date().toISOString() }];
      const parsedNotes = parseNotes('');
      const serialized = serializeNotes('', initialTimeline, parsedNotes.checklist, []);

      const payload = {
        company: createFormData.company,
        role: createFormData.role,
        url: createFormData.url,
        salary: createFormData.salary,
        status: 'SAVED',
        notes: serialized
      };

      const { data } = await api.post('/tracker', payload);
      setApps([data, ...apps]);
      setShowCreateModal(false);
      setCreateFormData({ company: '', role: '', url: '', salary: '', notes: '' });
      toast.success('Added', 'Application added to tracker.');
    } catch (err) {
      console.error('Failed to add application:', err);
      toast.error('Error', err.response?.data?.error || 'Failed to add application.');
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      await api.delete(`/tracker/${id}`);
      setApps(apps.filter(a => a.id !== id));
      if (activeApp && activeApp.id === id) {
        setActiveApp(null);
        setActiveAppParsed(null);
      }
      toast.success('Deleted', 'Application deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to delete application.');
    }
  };

  // Drag and Drop
  const onDragStart = (e, id) => {
    e.dataTransfer.setData('appId', id);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (e, targetStatus) => {
    const id = e.dataTransfer.getData('appId');
    if (!id) return;

    const app = apps.find(a => a.id === id);
    if (!app) return;

    const parsed = parseNotes(app.notes);
    const nowStr = new Date().toISOString();
    
    // Add to timeline
    const latestTimeline = parsed.timeline[parsed.timeline.length - 1];
    let newTimeline = [...parsed.timeline];
    if (!latestTimeline || latestTimeline.status !== targetStatus) {
      newTimeline.push({ status: targetStatus, date: nowStr });
    }

    const newNotes = serializeNotes(parsed.customNotes, newTimeline, parsed.checklist, parsed.reminders);

    // Optimistic UI update
    setApps(apps.map(a => a.id === id ? { ...a, status: targetStatus, notes: newNotes } : a));

    try {
      await api.put(`/tracker/${id}`, { status: targetStatus, notes: newNotes });
      toast.success('Status Updated', `${app.company} application moved to ${targetStatus}.`);
    } catch (err) {
      console.error("Failed to update status", err);
      toast.error('Error', 'Failed to update application status.');
      fetchApps(); // revert
    }
  };

  // Select App & Open Details Modal
  const openAppDetails = (app) => {
    setActiveApp(app);
    setActiveAppParsed(parseNotes(app.notes));
    setModalTab('details');
  };

  // Sync state changes in Details Modal to DB
  const saveActiveAppChanges = async (updatedParsed) => {
    if (!activeApp) return;

    const newNotes = serializeNotes(
      updatedParsed.customNotes,
      updatedParsed.timeline,
      updatedParsed.checklist,
      updatedParsed.reminders
    );

    const payload = {
      company: activeApp.company,
      role: activeApp.role,
      url: activeApp.url,
      salary: activeApp.salary,
      status: activeApp.status,
      notes: newNotes
    };

    try {
      const { data } = await api.put(`/tracker/${activeApp.id}`, payload);
      
      // Update local state
      setApps(apps.map(a => a.id === activeApp.id ? { ...a, ...payload } : a));
      setActiveApp({ ...activeApp, ...payload });
      setActiveAppParsed(updatedParsed);
    } catch (err) {
      console.error('Failed to auto-save application changes:', err);
      toast.error('Error', 'Failed to save changes.');
    }
  };

  // Update specific fields on the root active app object
  const updateRootAppFields = async (fields) => {
    if (!activeApp) return;

    const updatedApp = { ...activeApp, ...fields };
    const payload = {
      company: updatedApp.company,
      role: updatedApp.role,
      url: updatedApp.url,
      salary: updatedApp.salary,
      status: updatedApp.status,
      notes: activeApp.notes
    };

    try {
      await api.put(`/tracker/${activeApp.id}`, payload);
      setApps(apps.map(a => a.id === activeApp.id ? { ...a, ...payload } : a));
      setActiveApp(updatedApp);
      toast.success('Updated', 'Details saved successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to save details.');
    }
  };

  // Update timeline if status changes in dropdown
  const handleStatusDropdownChange = async (newStatus) => {
    if (!activeApp || !activeAppParsed) return;

    const nowStr = new Date().toISOString();
    const latestTimeline = activeAppParsed.timeline[activeAppParsed.timeline.length - 1];
    let newTimeline = [...activeAppParsed.timeline];
    if (!latestTimeline || latestTimeline.status !== newStatus) {
      newTimeline.push({ status: newStatus, date: nowStr });
    }

    const updatedParsed = { ...activeAppParsed, timeline: newTimeline };
    const newNotes = serializeNotes(
      updatedParsed.customNotes,
      updatedParsed.timeline,
      updatedParsed.checklist,
      updatedParsed.reminders
    );

    const updatedApp = { ...activeApp, status: newStatus, notes: newNotes };

    try {
      await api.put(`/tracker/${activeApp.id}`, { status: newStatus, notes: newNotes });
      setApps(apps.map(a => a.id === activeApp.id ? updatedApp : a));
      setActiveApp(updatedApp);
      setActiveAppParsed(updatedParsed);
      toast.success('Status Changed', `Status updated to ${newStatus}.`);
    } catch (err) {
      console.error(err);
      toast.error('Error', 'Failed to update status.');
    }
  };

  // Checklist Handlers
  const handleToggleChecklistItem = (itemId) => {
    if (!activeAppParsed) return;
    const updatedChecklist = activeAppParsed.checklist.map(item =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    saveActiveAppChanges({ ...activeAppParsed, checklist: updatedChecklist });
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newChecklistItem.trim() || !activeAppParsed) return;
    const newItem = {
      id: Date.now(),
      text: newChecklistItem.trim(),
      done: false
    };
    const updatedChecklist = [...activeAppParsed.checklist, newItem];
    saveActiveAppChanges({ ...activeAppParsed, checklist: updatedChecklist });
    setNewChecklistItem('');
  };

  const handleDeleteChecklistItem = (itemId) => {
    if (!activeAppParsed) return;
    const updatedChecklist = activeAppParsed.checklist.filter(item => item.id !== itemId);
    saveActiveAppChanges({ ...activeAppParsed, checklist: updatedChecklist });
  };

  // Reminders Handlers
  const handleToggleReminder = (reminderId) => {
    if (!activeAppParsed) return;
    const updatedReminders = activeAppParsed.reminders.map(rem =>
      rem.id === reminderId ? { ...rem, done: !rem.done } : rem
    );
    saveActiveAppChanges({ ...activeAppParsed, reminders: updatedReminders });
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminderText.trim() || !newReminderDate || !activeAppParsed) return;
    const newRem = {
      id: Date.now(),
      text: newReminderText.trim(),
      date: newReminderDate,
      done: false
    };
    const updatedReminders = [...activeAppParsed.reminders, newRem];
    saveActiveAppChanges({ ...activeAppParsed, reminders: updatedReminders });
    setNewReminderText('');
    setNewReminderDate('');
  };

  const handleDeleteReminder = (reminderId) => {
    if (!activeAppParsed) return;
    const updatedReminders = activeAppParsed.reminders.filter(rem => rem.id !== reminderId);
    saveActiveAppChanges({ ...activeAppParsed, reminders: updatedReminders });
  };

  // Render Visual Indicators on Card
  const renderCardIndicators = (app) => {
    const parsed = parseNotes(app.notes);
    const completedCheck = parsed.checklist.filter(item => item.done).length;
    const totalCheck = parsed.checklist.length;
    const pendingRem = parsed.reminders.filter(item => !item.done).length;

    return (
      <div className="mt-3 space-y-2 border-t-2 border-dashed border-brutal-black pt-3">
        {totalCheck > 0 && (
          <div className="flex items-center justify-between text-xs font-black text-gray-700">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-black" />
              {completedCheck}/{totalCheck} tasks
            </span>
            <div className="w-16 bg-gray-200 h-2 border border-brutal-black rounded-none overflow-hidden">
              <div 
                className="bg-brutal-blue h-full border-r border-brutal-black" 
                style={{ width: `${Math.round((completedCheck / totalCheck) * 100)}%` }}
              ></div>
            </div>
          </div>
        )}
        {pendingRem > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-black text-red-600 bg-red-50 border border-red-500 p-1 px-1.5 rounded-none shadow-[2px_2px_0_#000]">
            <Clock className="w-3.5 h-3.5 text-red-600 animate-pulse shrink-0" />
            <span>{pendingRem} pending follow-up{pendingRem > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b-4 border-brutal-black pb-6 gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Job Application Tracker</h1>
          <p className="text-xl font-bold mt-2 bg-brutal-yellow inline-block px-3 py-1 border-2 border-brutal-black shadow-[2px_2px_0_#000]">
            Interactive Drag-and-Drop Board & Application Timeline Logs.
          </p>
        </div>
        <Button variant="brutal" onClick={() => setShowCreateModal(true)} className="bg-brutal-blue text-black text-lg shadow-[4px_4px_0_#000] hover:shadow-[2px_2px_0_#000] border-2">
          <Plus className="w-5 h-5 mr-2" /> Add Application
        </Button>
      </div>

      {loading ? (
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
          {COLUMNS.map(col => (
            <div key={col} className={`min-w-[320px] max-w-[320px] border-4 border-brutal-black flex-1 flex flex-col snap-center ${COL_COLORS[col]} shadow-[4px_4px_0_rgba(0,0,0,1)]`}>
              <div className="p-4 border-b-4 border-brutal-black bg-white flex justify-between items-center">
                <h2 className="text-xl font-black uppercase tracking-tight">{col}</h2>
                <span className="text-sm font-black bg-black text-white px-2 py-0.5 border border-black shadow-[2px_2px_0_rgba(255,255,255,1)]">—</span>
              </div>
              <div className="p-4 flex-1 space-y-4 bg-white/40 min-h-[550px] animate-pulse">
                {[1, 2, col === 'SAVED' ? 3 : null].filter(Boolean).map(i => (
                  <div key={i} className="bg-white border-2 border-gray-200 p-4 space-y-3">
                    <div className="h-5 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x">
          {COLUMNS.map(col => {
            const columnApps = apps.filter(a => a.status === col);
            return (
              <div 
                key={col}
                className={`min-w-[320px] max-w-[320px] border-4 border-brutal-black flex-1 flex flex-col snap-center ${COL_COLORS[col]} shadow-[4px_4px_0_rgba(0,0,0,1)]`}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col)}
              >
                <div className="p-4 border-b-4 border-brutal-black bg-white flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase tracking-tight">{col}</h2>
                  <span className="text-sm font-black bg-black text-white px-2 py-0.5 border border-black shadow-[2px_2px_0_rgba(255,255,255,1)]">
                    {columnApps.length}
                  </span>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-4 bg-white/40 min-h-[550px] max-h-[700px]">
                  {columnApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-8 border-2 border-dashed border-gray-400 text-gray-500 font-bold text-sm">
                      Drag jobs here or add one
                    </div>
                  ) : (
                    columnApps.map(app => (
                      <div 
                        key={app.id} 
                        draggable 
                        onDragStart={(e) => onDragStart(e, app.id)}
                        onClick={() => openAppDetails(app)}
                        className="bg-white border-4 border-brutal-black p-4 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all relative group shadow-[2px_2px_0_rgba(0,0,0,1)]"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleDelete(app.id, e)} 
                            className="text-red-500 hover:text-red-700 bg-white border-2 border-brutal-black p-1 shadow-[2px_2px_0_#000] hover:shadow-none transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <h3 className="font-black text-lg leading-tight mb-1 pr-6 hover:text-blue-600 transition-colors">
                          {app.role}
                        </h3>
                        <p className="font-extrabold text-gray-700 text-sm mb-2">{app.company}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          {app.salary && (
                            <span className="inline-block bg-brutal-green text-black text-xs font-black px-2 py-0.5 border border-brutal-black">
                              {app.salary}
                            </span>
                          )}
                        </div>
                        
                        {app.url && (
                          <a 
                            href={app.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            onClick={(e) => e.stopPropagation()} 
                            className="inline-flex items-center text-xs font-black text-blue-600 hover:underline gap-0.5 mt-1"
                          >
                            Listing <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {renderCardIndicators(app)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-black hover:bg-gray-100 border-2 border-brutal-black p-1 shadow-[2px_2px_0_#000] active:shadow-none"
            >
              <X className="w-4 h-4" />
            </button>
            
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4 border-b-2 border-brutal-black pb-2">New Job Tracking</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block font-black text-sm mb-1 uppercase">Company *</label>
                <input 
                  required 
                  className="w-full border-2 border-brutal-black p-2 font-bold focus:bg-yellow-50 outline-none" 
                  value={createFormData.company} 
                  onChange={e => setCreateFormData({...createFormData, company: e.target.value})} 
                  placeholder="e.g. Google"
                />
              </div>
              <div>
                <label className="block font-black text-sm mb-1 uppercase">Role / Title *</label>
                <input 
                  required 
                  className="w-full border-2 border-brutal-black p-2 font-bold focus:bg-yellow-50 outline-none" 
                  value={createFormData.role} 
                  onChange={e => setCreateFormData({...createFormData, role: e.target.value})} 
                  placeholder="e.g. Software Engineer"
                />
              </div>
              <div>
                <label className="block font-black text-sm mb-1 uppercase">Job Description URL</label>
                <input 
                  type="url" 
                  className="w-full border-2 border-brutal-black p-2 font-bold focus:bg-yellow-50 outline-none" 
                  value={createFormData.url} 
                  onChange={e => setCreateFormData({...createFormData, url: e.target.value})} 
                  placeholder="https://careers.google.com/jobs/..."
                />
              </div>
              <div>
                <label className="block font-black text-sm mb-1 uppercase">Salary Range</label>
                <input 
                  className="w-full border-2 border-brutal-black p-2 font-bold focus:bg-yellow-50 outline-none" 
                  value={createFormData.salary} 
                  onChange={e => setCreateFormData({...createFormData, salary: e.target.value})} 
                  placeholder="e.g. $120k - $150k"
                />
              </div>
              
              <div className="flex gap-4 pt-4 border-t-2 border-brutal-black">
                <Button type="button" variant="white" onClick={() => setShowCreateModal(false)} className="flex-1 font-bold border-2 border-brutal-black">
                  Cancel
                </Button>
                <Button type="submit" variant="brutal" className="flex-1 bg-brutal-yellow font-black uppercase text-black border-2 border-brutal-black shadow-[4px_4px_0_#000]">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE APP DETAILS MODAL */}
      {activeApp && activeAppParsed && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b-4 border-brutal-black bg-white flex justify-between items-start">
              <div>
                <span className="inline-block bg-black text-white text-xs font-black uppercase px-2 py-0.5 border border-black mb-1">
                  Active Application Details
                </span>
                <h2 className="text-3xl font-black uppercase tracking-tight leading-none">
                  {activeApp.role} <span className="text-gray-500 font-bold">@</span> {activeApp.company}
                </h2>
              </div>
              <button 
                onClick={() => { setActiveApp(null); setActiveAppParsed(null); }}
                className="text-black hover:bg-gray-100 border-2 border-brutal-black p-1.5 shadow-[2px_2px_0_#000] active:shadow-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content layout */}
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              
              {/* Tab Navigation (Left Sidebar) */}
              <div className="w-full md:w-60 bg-gray-50 border-r-0 md:border-r-4 border-b-4 md:border-b-0 border-brutal-black flex md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 p-4 gap-2">
                <button 
                  onClick={() => setModalTab('details')}
                  className={`w-full text-left p-3 font-black text-sm uppercase border-2 border-brutal-black shadow-[2px_2px_0_#000] active:shadow-none flex items-center gap-2 transition-all shrink-0 md:shrink ${
                    modalTab === 'details' ? 'bg-brutal-yellow translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-yellow-50'
                  }`}
                >
                  <Info className="w-4 h-4 shrink-0" />
                  General Details
                </button>
                <button 
                  onClick={() => setModalTab('checklist')}
                  className={`w-full text-left p-3 font-black text-sm uppercase border-2 border-brutal-black shadow-[2px_2px_0_#000] active:shadow-none flex items-center justify-between transition-all shrink-0 md:shrink ${
                    modalTab === 'checklist' ? 'bg-brutal-blue translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-blue-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    Interview Tasks
                  </span>
                  <span className="text-xs bg-black text-white px-1.5 font-bold">
                    {activeAppParsed.checklist.filter(i => i.done).length}/{activeAppParsed.checklist.length}
                  </span>
                </button>
                <button 
                  onClick={() => setModalTab('reminders')}
                  className={`w-full text-left p-3 font-black text-sm uppercase border-2 border-brutal-black shadow-[2px_2px_0_#000] active:shadow-none flex items-center justify-between transition-all shrink-0 md:shrink ${
                    modalTab === 'reminders' ? 'bg-brutal-pink translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-pink-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    Follow-ups
                  </span>
                  {activeAppParsed.reminders.filter(i => !i.done).length > 0 && (
                    <span className="text-xs bg-red-600 text-white px-1.5 font-black animate-pulse">
                      {activeAppParsed.reminders.filter(i => !i.done).length}
                    </span>
                  )}
                </button>
                <button 
                  onClick={() => setModalTab('timeline')}
                  className={`w-full text-left p-3 font-black text-sm uppercase border-2 border-brutal-black shadow-[2px_2px_0_#000] active:shadow-none flex items-center gap-2 transition-all shrink-0 md:shrink ${
                    modalTab === 'timeline' ? 'bg-brutal-green translate-x-0.5 translate-y-0.5 shadow-none' : 'bg-white hover:bg-green-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  Status Logs
                </button>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-6 overflow-y-auto bg-white">
                
                {/* Tab: Details */}
                {modalTab === 'details' && (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border-2 border-brutal-black p-4 shadow-[2px_2px_0_#000] flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-black shrink-0" />
                        <span className="font-extrabold uppercase text-sm">Update Current Stage:</span>
                      </div>
                      <select 
                        value={activeApp.status}
                        onChange={(e) => handleStatusDropdownChange(e.target.value)}
                        className="border-2 border-brutal-black font-black uppercase text-sm p-1.5 bg-white cursor-pointer"
                      >
                        {COLUMNS.map(col => (
                          <option key={col} value={col}>{col}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-black text-xs uppercase text-gray-500 mb-1">Company Name</label>
                        <input 
                          className="w-full border-2 border-brutal-black p-2 font-bold outline-none focus:bg-yellow-50"
                          value={activeApp.company}
                          onChange={(e) => updateRootAppFields({ company: e.target.value })}
                          onBlur={() => toast.success('Saved', 'Company name updated.')}
                        />
                      </div>
                      <div>
                        <label className="block font-black text-xs uppercase text-gray-500 mb-1">Role / Title</label>
                        <input 
                          className="w-full border-2 border-brutal-black p-2 font-bold outline-none focus:bg-yellow-50"
                          value={activeApp.role}
                          onChange={(e) => updateRootAppFields({ role: e.target.value })}
                          onBlur={() => toast.success('Saved', 'Role/title updated.')}
                        />
                      </div>
                      <div>
                        <label className="block font-black text-xs uppercase text-gray-500 mb-1">Salary Range</label>
                        <input 
                          className="w-full border-2 border-brutal-black p-2 font-bold outline-none focus:bg-yellow-50"
                          value={activeApp.salary || ''}
                          placeholder="e.g. $100,000 - $130,000"
                          onChange={(e) => updateRootAppFields({ salary: e.target.value })}
                          onBlur={() => toast.success('Saved', 'Salary details updated.')}
                        />
                      </div>
                      <div>
                        <label className="block font-black text-xs uppercase text-gray-500 mb-1">Job URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="url"
                            className="w-full border-2 border-brutal-black p-2 font-bold outline-none focus:bg-yellow-50 text-sm"
                            value={activeApp.url || ''}
                            placeholder="https://..."
                            onChange={(e) => updateRootAppFields({ url: e.target.value })}
                            onBlur={() => toast.success('Saved', 'Job link updated.')}
                          />
                          {activeApp.url && (
                            <a 
                              href={activeApp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="border-2 border-brutal-black bg-white p-2.5 hover:bg-gray-100 shadow-[2px_2px_0_#000] active:shadow-none shrink-0"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block font-black text-xs uppercase text-gray-500 mb-1">Application Custom Notes</label>
                      <textarea 
                        rows={6}
                        className="w-full border-2 border-brutal-black p-3 font-bold outline-none focus:bg-yellow-50 text-sm"
                        placeholder="Add notes about your follow-ups, recruiter contacts, or interview questions..."
                        value={activeAppParsed.customNotes}
                        onChange={(e) => saveActiveAppChanges({ ...activeAppParsed, customNotes: e.target.value })}
                      />
                      <span className="text-xs text-gray-400 font-bold block mt-1">Changes to notes are automatically saved.</span>
                    </div>
                  </div>
                )}

                {/* Tab: Checklist */}
                {modalTab === 'checklist' && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-brutal-black pb-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">Interview Checklist</h3>
                      <p className="text-sm font-semibold text-gray-500">Track tasks needed to prepare for this application.</p>
                    </div>

                    <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                      <input 
                        required
                        className="flex-1 border-2 border-brutal-black p-2 font-bold focus:bg-yellow-50 outline-none"
                        placeholder="Add new preparation task..."
                        value={newChecklistItem}
                        onChange={(e) => setNewChecklistItem(e.target.value)}
                      />
                      <Button type="submit" variant="brutal" className="bg-brutal-blue border-2 border-brutal-black text-black px-4 shadow-[2px_2px_0_#000]">
                        Add
                      </Button>
                    </form>

                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                      {activeAppParsed.checklist.length === 0 ? (
                        <div className="text-center font-bold text-gray-500 py-8 border-2 border-dashed border-gray-300">
                          No tasks. Add one above!
                        </div>
                      ) : (
                        activeAppParsed.checklist.map(item => (
                          <div 
                            key={item.id}
                            className={`flex items-center justify-between p-3 border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all ${
                              item.done ? 'bg-gray-50 text-gray-400 line-through' : 'bg-white text-black'
                            }`}
                          >
                            <label className="flex items-center gap-3 font-extrabold cursor-pointer flex-1 select-none text-sm">
                              <input 
                                type="checkbox"
                                checked={item.done}
                                onChange={() => handleToggleChecklistItem(item.id)}
                                className="w-5 h-5 border-2 border-brutal-black text-black rounded-none cursor-pointer focus:ring-0"
                              />
                              <span>{item.text}</span>
                            </label>
                            <button 
                              onClick={() => handleDeleteChecklistItem(item.id)}
                              className="text-red-500 hover:text-red-700 bg-white border border-brutal-black p-1 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Reminders */}
                {modalTab === 'reminders' && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-brutal-black pb-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">Follow-up Reminders</h3>
                      <p className="text-sm font-semibold text-gray-500">Log calendar events, recruiter replies, and application milestones.</p>
                    </div>

                    <form onSubmit={handleAddReminder} className="bg-gray-50 border-2 border-brutal-black p-4 space-y-3 shadow-[2px_2px_0_#000]">
                      <div className="font-black text-sm uppercase">Schedule Follow-up:</div>
                      <div className="flex flex-col md:flex-row gap-3">
                        <input 
                          required
                          className="flex-1 border-2 border-brutal-black p-2 font-bold focus:bg-white outline-none text-sm bg-white"
                          placeholder="e.g. Email recruiter for update"
                          value={newReminderText}
                          onChange={(e) => setNewReminderText(e.target.value)}
                        />
                        <input 
                          required
                          type="date"
                          className="border-2 border-brutal-black p-2 font-bold focus:bg-white outline-none text-sm bg-white"
                          value={newReminderDate}
                          onChange={(e) => setNewReminderDate(e.target.value)}
                        />
                        <Button type="submit" variant="brutal" className="bg-brutal-pink border-2 border-brutal-black text-black px-4 shadow-[2px_2px_0_#000] shrink-0">
                          Set Reminder
                        </Button>
                      </div>
                    </form>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                      {activeAppParsed.reminders.length === 0 ? (
                        <div className="text-center font-bold text-gray-500 py-8 border-2 border-dashed border-gray-300">
                          No reminders set. Schedule one above!
                        </div>
                      ) : (
                        activeAppParsed.reminders.map(rem => {
                          const isOverdue = new Date(rem.date) < new Date() && !rem.done;
                          return (
                            <div 
                              key={rem.id}
                              className={`flex items-start md:items-center justify-between p-3 border-2 border-brutal-black shadow-[2px_2px_0_#000] transition-all ${
                                rem.done ? 'bg-gray-50 text-gray-400 line-through' : 
                                isOverdue ? 'bg-red-50 border-red-500' : 'bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <input 
                                  type="checkbox"
                                  checked={rem.done}
                                  onChange={() => handleToggleReminder(rem.id)}
                                  className="w-5 h-5 border-2 border-brutal-black text-black rounded-none cursor-pointer mt-0.5 shrink-0"
                                />
                                <div>
                                  <span className="font-extrabold text-sm block">{rem.text}</span>
                                  <span className={`inline-flex items-center gap-1 text-xs font-bold mt-1 px-1.5 py-0.5 border border-brutal-black ${
                                    rem.done ? 'bg-gray-100 text-gray-400 border-gray-300' :
                                    isOverdue ? 'bg-red-500 text-white font-black animate-pulse' : 'bg-brutal-yellow text-black'
                                  }`}>
                                    {isOverdue && <AlertTriangle className="w-3 h-3 text-white inline shrink-0" />}
                                    {formatDate(rem.date)} {isOverdue && "(OVERDUE)"}
                                  </span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteReminder(rem.id)}
                                className="text-red-500 hover:text-red-700 bg-white border border-brutal-black p-1 shrink-0 ml-4"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Tab: Timeline */}
                {modalTab === 'timeline' && (
                  <div className="space-y-6">
                    <div className="border-b-2 border-brutal-black pb-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">Application Timeline Logs</h3>
                      <p className="text-sm font-semibold text-gray-500">Detailed historical record of your application status progression.</p>
                    </div>

                    <div className="relative pl-8 border-l-4 border-brutal-black ml-4 space-y-8 py-2">
                      {activeAppParsed.timeline.length === 0 ? (
                        <div className="text-sm font-bold text-gray-500 italic">
                          No history found. Try changing the application stage status.
                        </div>
                      ) : (
                        activeAppParsed.timeline.map((entry, idx) => (
                          <div key={idx} className="relative">
                            {/* Visual bullet circle */}
                            <div className="absolute -left-[42px] top-1.5 w-6 h-6 border-4 border-brutal-black bg-white shadow-[2px_2px_0_#000] flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 bg-black rounded-none"></div>
                            </div>
                            
                            <div>
                              <span className="inline-block bg-black text-white text-xs font-black uppercase px-2 py-0.5 border border-black mb-1">
                                {entry.status}
                              </span>
                              <div className="text-xs font-black text-gray-500 mt-0.5">
                                Reached on: {formatDate(entry.date, { showTime: true })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t-4 border-brutal-black bg-gray-50 flex flex-wrap justify-between items-center gap-4">
              <Button 
                variant="white" 
                onClick={(e) => handleDelete(activeApp.id, e)} 
                className="bg-red-50 text-red-600 border-2 border-red-500 font-extrabold shadow-[2px_2px_0_#000] hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete Tracked Job
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="white"
                  onClick={() => { setActiveApp(null); setActiveAppParsed(null); }}
                  className="font-bold border-2 border-brutal-black"
                >
                  Close
                </Button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
