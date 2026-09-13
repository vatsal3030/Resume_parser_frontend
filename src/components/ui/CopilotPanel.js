"use client";
import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });
import { useCopilot } from '@/context/CopilotContext';
import { X, Send, Sparkles, Terminal, ChevronRight, MessageSquare, Plus, Clock, FileText, Check, Copy } from 'lucide-react';
import { Rnd } from 'react-rnd';

export function CopilotPanel() {
  const { 
    isOpen, 
    toggleCopilot, 
    messages, 
    sendMessage,
    quickActions,
    activeDocument,
    currentRoute,
    position,
    setPosition,
    size,
    setSize,
    conversations,
    activeConversationId,
    switchConversation,
    createNewConversation,
    deleteConversation,
    renameConversation,
    clearHistory,
    showThreadList,
    setShowThreadList
  } = useCopilot();
  
  const [input, setInput] = useState('');
  const [editingConvId, setEditingConvId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showThreadList]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  const handleQuickAction = (action) => {
    sendMessage(action);
  };

  const handleRenameSubmit = (convId) => {
    if (editingTitle.trim()) {
      renameConversation(convId, editingTitle.trim());
    }
    setEditingConvId(null);
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Hide on public/unauthenticated routes
  const isPublicRoute = ['/', '/login', '/register'].includes(currentRoute);
  if (isPublicRoute) return null;

  return (
    <>
      {/* Floating Toggle Button — Liquid Glass Pill */}
      {!isOpen && (
        <button
          onClick={toggleCopilot}
          aria-label="Open AI Copilot"
          aria-expanded={isOpen}
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-full bg-(--surface-card)/90 backdrop-blur-xl border border-(--hairline) shadow-xl hover:shadow-2xl hover:border-(--primary)/60 text-(--ink) transition-all z-50 flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-(--primary)/15 text-(--primary) flex items-center justify-center group-hover:scale-110 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-(--primary)" />
          </div>
          <span className="font-medium text-xs text-(--ink) hidden sm:block">AI Copilot</span>
        </button>
      )}

      {/* Main Copilot Panel — Liquid Glass Window */}
      {isOpen && (
        <Rnd
          default={{
            x: position.x !== -1 ? position.x : (typeof window !== 'undefined' ? window.innerWidth - 460 : 0),
            y: position.y !== 0 ? position.y : (typeof window !== 'undefined' ? window.innerHeight - 660 : 0),
            width: size.width > 0 ? size.width : 440,
            height: size.height > 0 ? size.height : 620,
          }}
          minWidth={340}
          minHeight={420}
          bounds="window"
          dragHandleClassName="copilot-drag-handle"
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, pos) => {
            setSize({ width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10) });
            setPosition(pos);
          }}
          className="z-9999"
        >
          <div 
            className="w-full h-full bg-(--surface-card)/95 backdrop-blur-2xl rounded-2xl border border-(--hairline) shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            role="dialog"
            aria-label="AI Copilot Chat"
          >
            {/* Header */}
            <div className="copilot-drag-handle px-4 py-3.5 border-b border-(--hairline-soft) flex justify-between items-center bg-(--surface-soft)/50 cursor-move">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-(--primary)/15 text-(--primary) flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-(--primary)" />
                </div>
                <span className="font-semibold text-xs text-(--ink) tracking-tight">AI Assistant Copilot</span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setShowThreadList(!showThreadList)} 
                  className={`p-1.5 rounded-lg transition-colors text-xs ${showThreadList ? 'bg-(--primary) text-white' : 'text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft)'}`}
                  title="Conversations"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={createNewConversation} 
                  className="p-1.5 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors text-xs"
                  title="New Chat"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={toggleCopilot} 
                  className="p-1.5 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors text-xs"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Context Banner */}
            <div className="bg-(--surface-soft)/70 px-3.5 py-1.5 border-b border-(--hairline-soft) text-[11px] text-(--muted) flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Terminal className="w-3 h-3 text-(--primary)" /> Context
              </span>
              <span className="truncate max-w-[200px] text-(--muted-soft)">
                {activeDocument ? `Doc: ${activeDocument.title || 'Selected'}` : currentRoute}
              </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-3.5 bg-(--canvas)/40 cursor-default transition-transform ${showThreadList ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
                {messages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-[13px] sm:text-sm leading-relaxed ${
                          isUser 
                            ? 'bg-(--primary) text-white shadow-sm rounded-br-xs whitespace-pre-wrap' 
                            : 'bg-(--surface-card) text-(--ink) border border-(--hairline) shadow-sm rounded-bl-xs'
                        }`}
                      >
                        {isUser ? (
                          msg.content
                        ) : (
                          <div className="markdown-chat text-(--ink) leading-relaxed">
                            <ReactMarkdown
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                strong: ({ children }) => <strong className="font-semibold text-(--ink)">{children}</strong>,
                                h1: ({ children }) => <h1 className="text-base font-bold text-(--ink) mt-3 mb-1.5">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-sm font-bold text-(--ink) mt-2.5 mb-1">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-xs font-semibold text-(--primary) uppercase tracking-wide mt-2 mb-1">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2 text-(--ink)">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2 text-(--ink)">{children}</ol>,
                                li: ({ children }) => <li className="text-(--ink)">{children}</li>,
                                code: ({ inline, className, children, ...props }) => {
                                  const text = String(children).replace(/\n$/, '');
                                  const isResume = text.toLowerCase().endsWith('.pdf') || (text.toLowerCase().includes('resume') && !text.includes(' '));
                                  if (inline || !text.includes('\n')) {
                                    return (
                                      <span 
                                        onClick={isResume ? () => setInput(`Tell me how to improve ${text}`) : undefined}
                                        className={`font-mono text-xs px-2 py-0.5 rounded-md border inline-flex items-center gap-1 my-0.5 transition-all ${
                                          isResume 
                                            ? 'bg-(--primary)/10 text-(--primary) border-(--primary)/30 hover:bg-(--primary)/20 cursor-pointer font-medium shadow-xs' 
                                            : 'bg-(--surface-soft) text-(--ink) border-(--hairline)'
                                        }`}
                                        title={isResume ? 'Click to ask about this resume' : undefined}
                                      >
                                        {isResume && <FileText className="w-3 h-3 text-(--primary) shrink-0" />}
                                        {text}
                                      </span>
                                    );
                                  }
                                  return (
                                    <pre className="p-3 my-2.5 rounded-xl bg-(--surface-soft) border border-(--hairline) overflow-x-auto font-mono text-xs text-(--ink) leading-normal">
                                      <code>{text}</code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-2 border-(--primary) pl-3 py-1 my-2 bg-(--surface-soft)/60 rounded-r text-(--muted) italic">
                                    {children}
                                  </blockquote>
                                )
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-(--muted-soft) mt-1 px-1">
                        {isUser ? 'You' : 'Claude 3.5'}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Thread History List */}
              {showThreadList && (
                <div className="absolute inset-0 bg-(--surface-card) z-20 flex flex-col overflow-hidden animate-in fade-in">
                  <div className="p-3 border-b border-(--hairline-soft) flex justify-between items-center bg-(--surface-soft)/50">
                    <span className="text-xs font-medium text-(--ink)">Conversations</span>
                    {conversations.length > 0 && (
                      <button 
                        onClick={clearHistory}
                        className="text-[11px] text-(--muted) hover:text-(--error) transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length > 0 ? (
                      conversations.map((conv) => (
                        <div 
                          key={conv.id}
                          onClick={() => switchConversation(conv.id)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                            conv.id === activeConversationId 
                              ? 'bg-(--surface-soft) border-(--primary)/40 text-(--ink)' 
                              : 'border-transparent hover:bg-(--surface-soft) text-(--muted)'
                          }`}
                        >
                          <span className="truncate flex-1 pr-2">{conv.title || 'Conversation'}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                            className="text-(--muted-soft) hover:text-(--error) p-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-xs text-(--muted-soft) mt-8">No conversation history.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && !showThreadList && (
              <div className="p-2.5 bg-(--surface-card) border-t border-(--hairline-soft) overflow-x-auto flex gap-1.5 no-scrollbar cursor-default shrink-0">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="whitespace-nowrap text-[11px] font-medium px-2.5 py-1 rounded-lg bg-(--surface-soft) text-(--muted) hover:text-(--ink) hover:bg-(--hairline) border border-(--hairline-soft) transition-colors flex items-center gap-1"
                  >
                    {action} <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            {!showThreadList && (
              <div className="p-3 bg-(--surface-card) border-t border-(--hairline-soft) cursor-default shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI Career Copilot..."
                    aria-label="Copilot message input"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-(--hairline) bg-(--surface-soft) text-xs text-(--ink) placeholder:text-(--muted-soft) focus:outline-none focus:border-(--primary) focus:ring-1 focus:ring-(--primary)/20 transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="w-8 h-8 rounded-xl bg-(--primary) text-white disabled:opacity-30 hover:bg-(--primary-active) transition-colors flex items-center justify-center shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </Rnd>
      )}
    </>
  );
}
