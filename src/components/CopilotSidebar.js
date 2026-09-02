"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, X, MessageSquare, Send, Trash2, Loader2, Zap, Maximize2, Minimize2, RotateCcw, Plus, ChevronLeft, ChevronRight, GripVertical, List, Pencil, Trash, Check } from 'lucide-react';
import { useCopilot } from '@/context/CopilotContext';
import { formatDate } from '@/lib/formatDate';

const MODEL_OPTIONS = [
 { value: 'default', label: 'Auto (Gemini 3.6 Flash)' },
 { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' },
 { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash' },
 { value: 'nvidia/nemotron-3.5-lightning:free', label: 'Nemotron 3.5 (Free)' },
];

export default function CopilotSidebar() {
 const {
 isOpen, isFullscreen, showThreadList,
 toggleCopilot, openCopilot, closeCopilot, toggleFullscreen, setShowThreadList,
 position, size, setPosition, setSize, resetLayout,
 messages, sendMessage, clearHistory,
 isLoading, isInitialized,
 quickActions, currentRoute,
 conversations, activeConversationId,
 switchConversation, createNewConversation, deleteConversation, renameConversation,
 selectedModel, setSelectedModel
 } = useCopilot();

 const [input, setInput] = useState('');
 const [isDragging, setIsDragging] = useState(false);
 const [isResizing, setIsResizing] = useState(false);
 const [editingTitle, setEditingTitle] = useState(null);
 const [editTitleValue, setEditTitleValue] = useState('');
 const messagesEndRef = useRef(null);
 const dragRef = useRef({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
 const resizeRef = useRef({ startX: 0, startWidth: 0 });
 const panelRef = useRef(null);

 const scrollToBottom = () => {
 messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
 };

 useEffect(() => {
 scrollToBottom();
 }, [messages, isLoading]);

 const handleSend = async (e) => {
 e?.preventDefault();
 if (!input.trim() || isLoading) return;
 const msg = input;
 setInput('');
 await sendMessage(msg);
 };

 const handleQuickAction = async (action) => {
 if (isLoading) return;
 await sendMessage(action);
 };

 // --- Drag Logic (header only) ---
 const onDragStart = useCallback((e) => {
 if (isFullscreen) return;
 e.preventDefault();
 setIsDragging(true);
 const rect = panelRef.current?.getBoundingClientRect();
 dragRef.current = {
 startX: e.clientX,
 startY: e.clientY,
 startPosX: rect?.left || 0,
 startPosY: rect?.top || 0
 };
 }, [isFullscreen]);

 useEffect(() => {
 if (!isDragging) return;
 const onMove = (e) => {
 const dx = e.clientX - dragRef.current.startX;
 const dy = e.clientY - dragRef.current.startY;
 const newX = Math.max(0, Math.min(window.innerWidth - 200, dragRef.current.startPosX + dx));
 const newY = Math.max(0, Math.min(window.innerHeight - 100, dragRef.current.startPosY + dy));
 setPosition({ x: newX, y: newY });
 };
 const onUp = () => setIsDragging(false);
 window.addEventListener('mousemove', onMove);
 window.addEventListener('mouseup', onUp);
 return () => {
 window.removeEventListener('mousemove', onMove);
 window.removeEventListener('mouseup', onUp);
 };
 }, [isDragging, setPosition]);

 // --- Resize Logic (left edge) ---
 const onResizeStart = useCallback((e) => {
 if (isFullscreen) return;
 e.preventDefault();
 e.stopPropagation();
 setIsResizing(true);
 resizeRef.current = { startX: e.clientX, startWidth: size.width };
 }, [isFullscreen, size.width]);

 useEffect(() => {
 if (!isResizing) return;
 const onMove = (e) => {
 const dx = resizeRef.current.startX - e.clientX;
 const newWidth = Math.max(320, Math.min(800, resizeRef.current.startWidth + dx));
 setSize({ ...size, width: newWidth });
 };
 const onUp = () => setIsResizing(false);
 window.addEventListener('mousemove', onMove);
 window.addEventListener('mouseup', onUp);
 return () => {
 window.removeEventListener('mousemove', onMove);
 window.removeEventListener('mouseup', onUp);
 };
 }, [isResizing, size, setSize]);

 // Compute panel style
 const getPanelStyle = () => {
 if (isFullscreen) {
 return { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' };
 }
 if (position.x === -1) {
 // Default: right-side sidebar
 return { top: 0, right: 0, width: `${size.width}px`, height: '100%' };
 }
 // Custom dragged position
 return {
 top: `${position.y}px`,
 left: `${position.x}px`,
 width: `${size.width}px`,
 height: size.height === -1 ? '85vh' : `${size.height}px`,
 borderRadius: '0px'
 };
 };

 const isFloating = position.x !== -1 && !isFullscreen;

 // Rename conversation
 const handleStartRename = (conv) => {
 setEditingTitle(conv.id);
 setEditTitleValue(conv.title || '');
 };
 const handleFinishRename = (convId) => {
 if (editTitleValue.trim()) {
 renameConversation(convId, editTitleValue.trim());
 }
 setEditingTitle(null);
 };

 return (
 <>
 {/* Floating Toggle Button */}
 {!isOpen && (
 <button 
 onClick={openCopilot}
 className="fixed bottom-6 right-6 p-4 bg-(--accent-amber) text-black border border-(--hairline) shadow-sm hover:-translate-y-1 hover:shadow-md transition-all z-50 rounded-full group"
 >
 <MessageSquare className="w-8 h-8" />
 <span className="absolute -top-2 -left-2 bg-(--primary) text-[10px] font-semibold px-1 border border-(--hairline) opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
 AI COPILOT
 </span>
 </button>
 )}

 {/* Panel */}
 <div
 ref={panelRef}
 className={`fixed bg-white border border-(--hairline) shadow-[-8px_0_0_rgba(0,0,0,0.3)] z-50 flex flex-col transition-all duration-200 ${
 isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
 } ${isFloating ? 'shadow-md' : ''} ${isDragging ? 'transition-none' : ''}`}
 style={getPanelStyle()}
 >
 {/* Resize handle (left edge) */}
 {!isFullscreen && (
 <div
 onMouseDown={onResizeStart}
 className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-(--accent-amber)/30 transition-colors z-10"
 />
 )}

 {/* Header — Draggable */}
 <div 
 className={`bg-(--primary) p-3 border-b border-(--hairline) flex justify-between items-center select-none ${!isFullscreen ? 'cursor-grab' : ''} ${isDragging ? 'cursor-grabbing' : ''}`}
 onMouseDown={onDragStart}
 >
 <div className="flex items-center gap-2">
 {!isFullscreen && (
 <GripVertical className="w-4 h-4 opacity-40" />
 )}
 <div className="p-1.5 bg-white border border-(--hairline) rounded-full">
 <Bot className="w-5 h-5 text-(--ink)" />
 </div>
 <div>
 <h2 className="text-base font-mediumer leading-none">Career Copilot</h2>
 <span className="text-[9px] font-bold opacity-70 flex items-center gap-0.5">
 <Zap className="w-2.5 h-2.5" /> Autonomous Agent
 </span>
 </div>
 </div>
 <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
 {/* Thread list toggle */}
 <button 
 onClick={() => setShowThreadList(!showThreadList)}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 title="Chat threads"
 >
 <List className="w-4 h-4" />
 </button>
 {/* New chat */}
 <button 
 onClick={createNewConversation}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 title="New chat"
 >
 <Plus className="w-4 h-4" />
 </button>
 {/* Clear */}
 <button 
 onClick={clearHistory}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 title="Clear chat"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 {/* Fullscreen */}
 <button 
 onClick={toggleFullscreen}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 title={isFullscreen ?"Exit fullscreen" :"Fullscreen"}
 >
 {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
 </button>
 {/* Reset layout */}
 {isFloating && (
 <button 
 onClick={resetLayout}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 title="Reset position"
 >
 <RotateCcw className="w-4 h-4" />
 </button>
 )}
 {/* Close */}
 <button 
 onClick={closeCopilot}
 className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Model Selector Bar */}
 <div className="px-3 py-1.5 bg-slate-50 border-b border-(--hairline) flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
 <span className="text-[9px] font-medium tracking-wide text-gray-400">Model:</span>
 <select
 value={selectedModel}
 onChange={(e) => setSelectedModel(e.target.value)}
 className="text-xs font-bold bg-white border border-(--hairline) px-1.5 py-0.5 outline-none cursor-pointer hover:bg-(--primary)/20"
 >
 {MODEL_OPTIONS.map(m => (
 <option key={m.value} value={m.value}>{m.label}</option>
 ))}
 </select>
 </div>

 {/* Thread List Panel (slides in from left) */}
 {showThreadList && (
 <div className="absolute top-0 left-0 w-64 h-full bg-white border-r border-(--hairline) z-20 flex flex-col animate-in slide-in-from-left-4 duration-200">
 <div className="p-3 bg-(--accent-teal) border-b border-(--hairline) flex justify-between items-center">
 <h3 className="font-semibold text-sm">Chat Threads</h3>
 <button onClick={() => setShowThreadList(false)} className="p-1 hover:bg-(--surface-dark) hover:text-white transition-colors">
 <ChevronLeft className="w-4 h-4" />
 </button>
 </div>
 <div className="p-2">
 <button 
 onClick={createNewConversation}
 className="w-full text-left p-2 text-xs font-bold bg-(--primary) border border-(--hairline) shadow-sm hover:shadow-sm transition-all flex items-center gap-1.5 mb-2"
 >
 <Plus className="w-3 h-3" /> New Chat
 </button>
 </div>
 <div className="flex-1 overflow-y-auto">
 {conversations.map(conv => (
 <div
 key={conv.id}
 className={`group px-3 py-2 border-b border-gray-200 cursor-pointer hover:bg-slate-50 transition-colors flex items-start gap-2 ${
 conv.id === activeConversationId ? 'bg-(--accent-amber)/10 border-l border-l-(--accent-amber)' : ''
 }`}
 >
 <div className="flex-1 min-w-0" onClick={() => switchConversation(conv.id)}>
 {editingTitle === conv.id ? (
 <div className="flex items-center gap-1">
 <input
 value={editTitleValue}
 onChange={(e) => setEditTitleValue(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleFinishRename(conv.id)}
 className="text-xs font-bold border border-(--hairline) px-1 py-0.5 w-full outline-none"
 autoFocus
 onClick={(e) => e.stopPropagation()}
 />
 <button onClick={(e) => { e.stopPropagation(); handleFinishRename(conv.id); }} className="p-0.5">
 <Check className="w-3 h-3 text-green-600" />
 </button>
 </div>
 ) : (
 <>
 <p className="text-xs font-bold truncate">{conv.title || 'Untitled'}</p>
 <p className="text-[9px] text-gray-400 font-medium">
 {formatDate(conv.updatedAt, { showRelative: true })} · {conv._count?.messages || 0} msgs
 </p>
 </>
 )}
 </div>
 <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
 <button onClick={(e) => { e.stopPropagation(); handleStartRename(conv); }} className="p-0.5 hover:text-(--accent-amber)">
 <Pencil className="w-3 h-3" />
 </button>
 <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="p-0.5 hover:text-red-500">
 <Trash className="w-3 h-3" />
 </button>
 </div>
 </div>
 ))}
 {conversations.length === 0 && (
 <p className="text-center text-xs text-gray-400 p-4 font-medium">No conversations yet</p>
 )}
 </div>
 </div>
 )}

 {/* Quick Actions Bar */}
 {messages.length <= 2 && quickActions.length > 0 && (
 <div className="p-2.5 bg-slate-50 border-b border-(--hairline) space-y-1.5">
 <span className="text-[9px] font-medium tracking-wide text-slate-500">Quick Actions</span>
 <div className="flex flex-wrap gap-1">
 {quickActions.map((action, idx) => (
 <button
 key={idx}
 onClick={() => handleQuickAction(action)}
 disabled={isLoading}
 className="text-[10px] font-bold px-2 py-1 bg-white border border-(--hairline) shadow-sm hover:bg-(--primary) hover:-translate-y-0.5 hover:shadow-sm transition-all disabled:opacity-50"
 >
 {action}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Chat History */}
 <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-(--canvas) relative">
 {!isInitialized ? (
 <div className="flex items-center justify-center h-full">
 <Loader2 className="w-8 h-8 animate-spin text-(--accent-amber)" />
 </div>
 ) : (
 messages.map((msg, idx) => (
 <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[85%] p-3 border border-(--hairline) font-medium text-sm shadow-sm whitespace-pre-wrap ${
 msg.role === 'user' 
 ? 'bg-(--primary-active) text-black' 
 : msg.isError 
 ? 'bg-red-100 border-red-500' 
 : 'bg-white'
 }`}>
 {msg.content || (msg.isStreaming ? (
 <span className="flex items-center gap-2 text-slate-400">
 <Loader2 className="w-4 h-4 animate-spin" />
 Thinking...
 </span>
 ) : '')}
 {msg.isStreaming && msg.content && (
 <span className="inline-block w-1.5 h-4 bg-(--accent-amber) ml-0.5 animate-pulse" />
 )}
 </div>
 </div>
 ))
 )}

 {/* Loading indicator for agent loop phase */}
 {isLoading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming && (
 <div className="flex justify-start">
 <div className="max-w-[85%] p-3 border border-(--hairline) bg-(--primary)/30 shadow-sm">
 <span className="flex items-center gap-2 text-sm font-bold">
 <Loader2 className="w-4 h-4 animate-spin" />
 Agent is working...
 </span>
 </div>
 </div>
 )}

 <div ref={messagesEndRef} />
 </div>

 {/* Input Area */}
 <div className="p-3 bg-white border-t border-(--hairline)">
 <form onSubmit={handleSend} className="flex gap-2">
 <input 
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder={isLoading ?"Agent is working..." :"Ask me anything..."}
 className="flex-1 p-2 border border-(--hairline) outline-none font-medium text-sm focus:bg-(--primary)/20"
 disabled={isLoading}
 />
 <button 
 type="submit" 
 disabled={!input.trim() || isLoading}
 className="p-2 bg-(--accent-amber) text-white border border-(--hairline) hover:bg-blue-600 disabled:opacity-50 transition-colors"
 >
 {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
 </button>
 </form>
 </div>
 </div>
 </>
 );
}
