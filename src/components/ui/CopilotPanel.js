"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useCopilot } from '@/context/CopilotContext';
import { Button } from './button';
import { MessageSquare, X, Send, Sparkles, Terminal, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
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
  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/rules-of-hooks, react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Hide on public/unauthenticated routes
  const isPublicRoute = ['/', '/login', '/register'].includes(currentRoute);
  if (isPublicRoute) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={toggleCopilot}
          aria-label="Open AI Copilot"
          aria-expanded={isOpen}
          className="fixed bottom-6 right-6 p-4 bg-brutal-yellow border-4 border-brutal-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 flex items-center gap-2 group"
        >
          <Terminal className="w-6 h-6 text-black group-hover:animate-pulse" />
          <span className="font-bold text-black hidden md:block">AI Copilot</span>
        </button>
      )}

      {/* Main Copilot Panel */}
      {isOpen && (
        <Rnd
          default={{
            x: position.x !== -1 ? position.x : (typeof window !== 'undefined' ? window.innerWidth - 424 : 0),
            y: position.y !== 0 ? position.y : (typeof window !== 'undefined' ? window.innerHeight - 624 : 0),
            width: size.width > 0 ? size.width : 400,
            height: size.height > 0 ? size.height : 600,
          }}
          minWidth={300}
          minHeight={400}
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
            className="w-full h-full bg-white border-4 border-brutal-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex flex-col animate-in fade-in relative"
            role="dialog"
            aria-label="AI Copilot Chat"
          >
            {/* Header */}
            <div className="copilot-drag-handle bg-brutal-black text-white p-4 flex justify-between items-center border-b-4 border-brutal-black cursor-move">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brutal-yellow pointer-events-none" />
                <h3 className="font-black tracking-widest uppercase text-lg pointer-events-none">Copilot</h3>
              </div>
              <div className="flex items-center gap-2 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); createNewConversation(); }}
                  aria-label="New Chat"
                  title="New Chat"
                  className="text-xs font-bold px-2 py-1 border-2 border-brutal-yellow bg-brutal-yellow text-black hover:bg-yellow-300 transition-all"
                >
                  + New
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowThreadList(!showThreadList); }}
                  aria-label="Toggle History"
                  className={`text-xs font-bold px-2 py-1 border-2 border-transparent hover:border-white transition-all ${showThreadList ? 'bg-white text-black' : 'text-white'}`}
                >
                  History
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleCopilot(); }} 
                  aria-label="Close Copilot" 
                  className="hover:bg-gray-800 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Banner */}
            <div className="bg-brutal-mint px-4 py-2 border-b-2 border-brutal-black text-xs font-bold flex items-center justify-between">
              <span className="flex items-center gap-1 uppercase">
                <Terminal className="w-3 h-3" /> Context
              </span>
              <span className="truncate max-w-[200px]">
                {activeDocument ? `Doc: ${activeDocument.title || 'Selected'}` : currentRoute}
              </span>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative flex flex-col">
              
              {/* Messages Area */}
              <div className={`flex-1 overflow-y-auto p-4 space-y-4 bg-brutal-bg cursor-default transition-transform ${showThreadList ? 'opacity-0 pointer-events-none absolute inset-0' : 'opacity-100'}`}>
                {messages.map((msg, idx) => (
                  <div 
                    key={msg.id || idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] p-3 border-2 border-brutal-black ${
                        msg.role === 'user' 
                          ? 'bg-brutal-blue text-black shadow-[2px_2px_0_rgba(0,0,0,1)]' 
                          : msg.isError
                            ? 'bg-red-100 text-red-800 shadow-[2px_2px_0_rgba(0,0,0,1)]'
                            : 'bg-white text-black shadow-[2px_2px_0_rgba(0,0,0,1)]'
                      }`}
                    >
                      {msg.isLoading ? (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-100"></span>
                          <span className="w-2 h-2 bg-black rounded-full animate-bounce delay-200"></span>
                        </div>
                      ) : (
                        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Thread List Area */}
              {showThreadList && (
                <div className="absolute inset-0 bg-white z-10 flex flex-col overflow-hidden animate-in slide-in-from-left">
                  <div className="p-4 border-b-2 border-brutal-black bg-brutal-bg flex justify-between items-center gap-2">
                    <span className="font-black uppercase">Chat History</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if(confirm("Are you sure you want to delete all chat history?")) {
                            clearHistory();
                          }
                        }} 
                        className="text-xs font-bold px-3 py-1.5 bg-red-500 text-white border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:translate-y-px hover:shadow-[1px_1px_0_#000]"
                      >
                        Delete All
                      </button>
                      <button 
                        onClick={createNewConversation} 
                        className="text-xs font-bold px-3 py-1.5 bg-brutal-yellow border-2 border-brutal-black shadow-[2px_2px_0_#000] hover:translate-y-px hover:shadow-[1px_1px_0_#000]"
                      >
                        + New Chat
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-brutal-bg">
                    {conversations && conversations.length > 0 ? (
                      conversations.map(conv => (
                        <div 
                          key={conv.id} 
                          onClick={() => switchConversation(conv.id)}
                          className={`p-3 border-2 border-brutal-black cursor-pointer shadow-[2px_2px_0_#000] hover:bg-brutal-blue hover:text-black transition-colors flex justify-between items-center group ${activeConversationId === conv.id ? 'bg-brutal-pink' : 'bg-white'}`}
                        >
                          {editingConvId === conv.id ? (
                            <input 
                              type="text" 
                              value={editingTitle} 
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRenameSubmit(conv.id);
                                if (e.key === 'Escape') setEditingConvId(null);
                              }}
                              onBlur={() => handleRenameSubmit(conv.id)}
                              className="text-sm font-bold p-1 border-2 border-brutal-black text-black w-full mr-2"
                              autoFocus
                            />
                          ) : (
                            <div className="truncate pr-4 font-bold text-sm">
                              {conv.title || "Conversation"}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                            {editingConvId !== conv.id && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setEditingConvId(conv.id); 
                                  setEditingTitle(conv.title || "Conversation"); 
                                }}
                                className="text-xs font-black p-1 hover:text-yellow-400"
                                title="Rename"
                              >
                                ✎
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                              className="text-xs hover:text-red-500 font-black p-1"
                              title="Delete"
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-sm font-bold text-gray-500 mt-10">No history found.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {quickActions && quickActions.length > 0 && !showThreadList && (
              <div className="p-3 bg-white border-t-2 border-brutal-black overflow-x-auto flex gap-2 no-scrollbar cursor-default shrink-0">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action)}
                    className="whitespace-nowrap text-xs font-bold px-3 py-1.5 bg-brutal-pink text-black border-2 border-brutal-black hover:bg-pink-400 transition-colors flex items-center gap-1"
                  >
                    {action} <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            {!showThreadList && (
              <div className="p-4 bg-white border-t-4 border-brutal-black cursor-default shrink-0">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask your AI Career Copilot..."
                    aria-label="Copilot message input"
                    className="flex-1 p-3 border-2 border-brutal-black font-medium text-sm focus:outline-none focus:bg-brutal-yellow/10"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Send message"
                    className="p-3 bg-brutal-black text-white border-2 border-brutal-black hover:bg-gray-800 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    <Send className="w-5 h-5" />
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
