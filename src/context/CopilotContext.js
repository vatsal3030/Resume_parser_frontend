"use client";
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { supabase } from '@/lib/supabase';

const CopilotContext = createContext();

const ROUTE_QUICK_ACTIONS = {
  '/dashboard': [
    "What resumes do I have?",
    "Summarize my recent activity",
    "Help me prepare for an interview"
  ],
  '/dashboard/tools/tailor': [
    "Tailor my resume for a frontend developer role",
    "What keywords am I missing for this JD?",
    "Scan for missing ATS keywords"
  ],
  '/dashboard/tools/cover-letter': [
    "Write me a cover letter for Google",
    "How do I explain an employment gap?",
    "What tone should I use for this role?"
  ],
  '/dashboard/tools/mock-interview': [
    "Generate mock interview questions for a React developer",
    "Give me tips for a technical screen",
    "How do I answer 'What is your greatest weakness?'"
  ],
  '/dashboard/tools/roadmap': [
    "Build me a roadmap to become a senior engineer",
    "What skills am I missing for a data science role?",
    "Suggest learning resources for system design"
  ],
  '/dashboard/tools/portfolio': [
    "Generate a portfolio from my resume",
    "What projects should I highlight?",
    "Help me write project descriptions"
  ],
  '/dashboard/tools/github': [
    "Analyze my GitHub profile",
    "What does my contribution graph say about me?",
    "How can I improve my GitHub presence?"
  ]
};

const WELCOME_MSG = { 
  role: 'assistant', 
  content: 'Hello! I\'m your AI Career Copilot. I can navigate the platform, analyze your resumes, generate cover letters, prepare mock interviews, and much more. What would you like me to do?' 
};

export const CopilotProvider = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThreadList, setShowThreadList] = useState(false);
  
  // Chat state
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Multi-conversation state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  
  // Model selection
  const [selectedModel, setSelectedModel] = useState('default');
  
  // Position/size state (persisted in localStorage)
  const [position, setPosition] = useState({ x: -1, y: 0 }); // -1 means default right-side
  const [size, setSize] = useState({ width: 420, height: -1 }); // -1 means full height
  
  const abortControllerRef = useRef(null);

  // Load position/size from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('copilot_layout');
      if (saved) {
        const { pos, sz } = JSON.parse(saved);
        if (pos) setPosition(pos);
        if (sz) setSize(sz);
      }
    } catch (e) { /* ignore */ }
  }, []);

  // Save position/size to localStorage
  const saveLayout = useCallback((pos, sz) => {
    try {
      localStorage.setItem('copilot_layout', JSON.stringify({ pos: pos || position, sz: sz || size }));
    } catch (e) { /* ignore */ }
  }, [position, size]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/chat/conversations');
      setConversations(data);
    } catch (e) {
      console.error("Failed to load conversations", e);
    }
  }, []);

  // Load messages for a specific conversation
  const loadConversation = useCallback(async (convId) => {
    try {
      const url = convId ? `/chat?conversationId=${convId}` : '/chat';
      const res = await api.get(url);
      if (res.data?.messages && res.data.messages.length > 0) {
        setMessages(res.data.messages.map(m => ({
          role: m.role,
          content: m.content,
          createdAt: m.createdAt
        })));
      } else {
        setMessages([WELCOME_MSG]);
      }
      setActiveConversationId(res.data?.conversationId || null);
    } catch (e) {
      console.error("Failed to load conversation", e);
      setMessages([WELCOME_MSG]);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await Promise.all([loadConversations(), loadConversation()]);
      } else {
        setMessages([WELCOME_MSG]);
      }
      setIsInitialized(true);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          Promise.all([loadConversations(), loadConversation()]);
        } else if (event === 'SIGNED_OUT') {
          setConversations([]);
          setMessages([WELCOME_MSG]);
          setActiveConversationId(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadConversations, loadConversation]);

  const quickActions = useMemo(() => {
    if (ROUTE_QUICK_ACTIONS[pathname]) return ROUTE_QUICK_ACTIONS[pathname];
    for (const route of Object.keys(ROUTE_QUICK_ACTIONS)) {
      if (pathname?.startsWith(route) && route !== '/dashboard') {
        return ROUTE_QUICK_ACTIONS[route];
      }
    }
    return ROUTE_QUICK_ACTIONS['/dashboard'];
  }, [pathname]);

  const toggleCopilot = () => setIsOpen(prev => !prev);
  const openCopilot = () => setIsOpen(true);
  const closeCopilot = () => setIsOpen(false);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const resetLayout = useCallback(() => {
    setPosition({ x: -1, y: 0 });
    setSize({ width: 420, height: -1 });
    setIsFullscreen(false);
    localStorage.removeItem('copilot_layout');
  }, []);

  // Switch to a different conversation
  const switchConversation = useCallback(async (convId) => {
    setIsLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    await loadConversation(convId);
    setShowThreadList(false);
  }, [loadConversation]);

  // Create a new conversation
  const createNewConversation = useCallback(async () => {
    try {
      const { data } = await api.post('/chat/conversations', { title: 'New Chat' });
      setActiveConversationId(data.id);
      setMessages([WELCOME_MSG]);
      await loadConversations();
      setShowThreadList(false);
    } catch (e) {
      console.error("Failed to create conversation", e);
    }
  }, [loadConversations]);

  // Delete a conversation
  const deleteConversation = useCallback(async (convId) => {
    try {
      await api.delete(`/chat/conversations/${convId}`);
      if (convId === activeConversationId) {
        // Switch to most recent remaining conversation
        const remaining = conversations.filter(c => c.id !== convId);
        if (remaining.length > 0) {
          await switchConversation(remaining[0].id);
        } else {
          await createNewConversation();
        }
      }
      await loadConversations();
    } catch (e) {
      console.error("Failed to delete conversation", e);
    }
  }, [activeConversationId, conversations, loadConversations, switchConversation, createNewConversation]);

  // Rename conversation
  const renameConversation = useCallback(async (convId, title) => {
    try {
      await api.patch(`/chat/conversations/${convId}`, { title });
      await loadConversations();
    } catch (e) {
      console.error("Failed to rename conversation", e);
    }
  }, [loadConversations]);

  const sendMessage = useCallback(async (content) => {
    const userMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantPlaceholderId = `assistant_${Date.now()}`;
    setMessages(prev => [...prev, { id: assistantPlaceholderId, role: 'assistant', content: '', isStreaming: true }]);

    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const response = await fetch(`${baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: content,
          context: { pathname },
          conversationId: activeConversationId,
          modelId: selectedModel !== 'default' ? selectedModel : undefined
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let actionInfo = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line === 'data: [DONE]') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.error) {
                fullText = `Sorry, I encountered an error: ${data.error}`;
                break;
              }

              if (data.action) {
                actionInfo = data.action;
                continue;
              }

              if (data.conversationId && !activeConversationId) {
                setActiveConversationId(data.conversationId);
              }

              if (data.text) {
                fullText += data.text;
                setMessages(prev => prev.map(msg =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: fullText }
                    : msg
                ));
              }
            } catch (e) {
              // Ignore malformed SSE lines
            }
          }
        }
      }

      // Finalize the message
      setMessages(prev => prev.map(msg =>
        msg.id === assistantPlaceholderId
          ? { role: 'assistant', content: fullText || 'I completed the task.', isStreaming: false }
          : msg
      ));

      // Auto-title the conversation based on first user message
      if (messages.length <= 2 && activeConversationId) {
        const title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        renameConversation(activeConversationId, title);
      }

      // Refresh conversations list
      loadConversations();

      // Execute any actions the agent returned
      if (actionInfo) {
        setTimeout(() => {
          if (actionInfo.type === 'navigate' && actionInfo.path) {
            router.push(actionInfo.path);
          }
          if (actionInfo.type === 'job' && actionInfo.jobId) {
            const toolRouteMap = {
              'tailorResume': '/dashboard/tools/tailor',
              'generateCoverLetter': '/dashboard/tools/cover-letter',
              'generateMockInterview': '/dashboard/tools/mock-interview',
              'generateRoadmap': '/dashboard/tools/roadmap',
              'generatePortfolio': '/dashboard/tools/portfolio',
              'analyzeGitHub': '/dashboard/tools/github',
            };
            const route = toolRouteMap[actionInfo.tool] || '/dashboard';
            router.push(`${route}?jobId=${actionInfo.jobId}`);
          }
        }, 800);
      }

    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Copilot SSE error:", error);
      // Only set error message if the streaming didn't already deliver error text
      setMessages(prev => {
        const existing = prev.find(msg => msg.id === assistantPlaceholderId);
        // If streaming already provided content (like an AI error message), don't overwrite
        if (existing?.content && existing.content.length > 0) {
          return prev.map(msg =>
            msg.id === assistantPlaceholderId
              ? { role: 'assistant', content: existing.content, isError: true }
              : msg
          );
        }
        return prev.map(msg =>
          msg.id === assistantPlaceholderId
            ? { role: 'assistant', content: "I'm sorry, I encountered an error processing your request. Please try again.", isError: true }
            : msg
        );
      });
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router, activeConversationId, selectedModel, messages.length, renameConversation, loadConversations]);

  const clearHistory = useCallback(async () => {
    try {
      const url = activeConversationId ? `/chat?conversationId=${activeConversationId}` : '/chat';
      await api.delete(url);
    } catch (e) {
      console.error("Failed to clear chat history on backend", e);
    }
    setMessages([WELCOME_MSG]);
  }, [activeConversationId]);

  return (
    <CopilotContext.Provider value={{
      // UI state
      isOpen,
      isFullscreen,
      showThreadList,
      toggleCopilot,
      openCopilot,
      closeCopilot,
      toggleFullscreen,
      setShowThreadList,
      
      // Layout
      position,
      size,
      setPosition: (pos) => { setPosition(pos); saveLayout(pos, size); },
      setSize: (sz) => { setSize(sz); saveLayout(position, sz); },
      resetLayout,
      
      // Chat
      messages,
      sendMessage,
      clearHistory,
      isLoading,
      isInitialized,
      quickActions,
      currentRoute: pathname,
      
      // Multi-conversation
      conversations,
      activeConversationId,
      switchConversation,
      createNewConversation,
      deleteConversation,
      renameConversation,
      
      // Model
      selectedModel,
      setSelectedModel
    }}>
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};
