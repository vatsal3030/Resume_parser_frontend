"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileEdit, Briefcase, FileText, Code, Users, Settings, LogOut, ArrowRight, X, CreditCard, HelpCircle, Map, LayoutTemplate, MessageSquare, User, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Fuse from "fuse.js";

const ACTIONS = [
  { group: "Tools", name: "Resume Studio", path: "/dashboard/studio", icon: FileEdit },
  { group: "Tools", name: "Job Tracker", path: "/dashboard/tracker", icon: Briefcase },
  { group: "Tools", name: "Cover Letter", path: "/dashboard/tools/cover-letter", icon: FileText },
  { group: "Tools", name: "GitHub Analyst", path: "/dashboard/tools/github", icon: Code },
  { group: "Tools", name: "AI Tailor", path: "/dashboard/tools/tailor", icon: FileEdit },
  { group: "Tools", name: "Mock Interviews", path: "/dashboard/tools/mock-interview", icon: MessageSquare },
  { group: "Tools", name: "Career Roadmap", path: "/dashboard/tools/roadmap", icon: Map },
  { group: "Tools", name: "Portfolio Gen", path: "/dashboard/tools/portfolio", icon: LayoutTemplate },
  { group: "Community", name: "Peer Review", path: "/dashboard/community", icon: Users },
  { group: "Utility", name: "Profile Settings", path: "/dashboard/profile", icon: User },
  { group: "Utility", name: "Credits & Plans", path: "/dashboard/credits", icon: CreditCard },
  { group: "Utility", name: "Help & Docs", path: "/dashboard/help", icon: HelpCircle },
  { group: "Utility", name: "Trash", path: "/dashboard/trash", icon: Trash2 },
];

export function CommandPalette({ isOpen, setIsOpen }) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const router = useRouter();

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(ACTIONS, {
    keys: ["name", "group"],
    threshold: 0.4,
  });

  // Filter actions based on search
  const filteredActions = search
    ? fuse.search(search).map(result => result.item)
    : ACTIONS;
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      // Close with Escape
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Navigation Keyboard Handling within Palette
  const handlePaletteKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredActions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        handleSelect(filteredActions[selectedIndex]);
      }
    }
  };

  const handleSelect = (action) => {
    setIsOpen(false);
    setSearch("");
    if (action.path) {
      router.push(action.path);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 sm:px-0">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div 
        className="relative w-full max-w-2xl bg-brutal-bg border-4 border-brutal-black shadow-[8px_8px_0_#000] overflow-hidden animate-in fade-in slide-in-from-top-10 duration-200"
        onKeyDown={handlePaletteKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b-4 border-brutal-black bg-white">
          <Search className="w-6 h-6 text-brutal-black mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-xl font-bold bg-transparent outline-none placeholder:text-gray-400 text-brutal-black"
            placeholder="Search tools, commands, or settings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 border-2 border-transparent hover:border-brutal-black transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-bold">
              No results found for &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((action, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={action.name}
                    className={`w-full flex items-center px-4 py-3 text-left border-2 transition-colors ${
                      isSelected 
                        ? 'bg-brutal-yellow border-brutal-black shadow-[2px_2px_0_#000]' 
                        : 'border-transparent hover:bg-white hover:border-brutal-black hover:shadow-[2px_2px_0_#000]'
                    }`}
                    onClick={() => handleSelect(action)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <action.icon className="w-5 h-5 mr-3" />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-black text-lg">{action.name}</span>
                      <span className="text-xs font-bold uppercase tracking-wider bg-gray-200 px-2 py-0.5 border border-gray-400">
                        {action.group}
                      </span>
                    </div>
                    {isSelected && <ArrowRight className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t-4 border-brutal-black bg-brutal-blue text-black flex justify-between items-center text-sm font-bold">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="bg-white text-black px-1.5 py-0.5 border-2 border-brutal-black">↑</kbd>
              <kbd className="bg-white text-black px-1.5 py-0.5 border-2 border-brutal-black">↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1 hidden sm:flex">
              <kbd className="bg-white text-black px-1.5 py-0.5 border-2 border-brutal-black">Enter</kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="bg-white text-black px-1.5 py-0.5 border-2 border-brutal-black">Esc</kbd>
            to close
          </div>
        </div>
      </div>
    </div>
  );
}
