"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4 sm:px-0">
      {/* Full-screen backdrop covering everything: navbar, sidebar, and main page */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Dialog Card */}
      <div 
        className="relative z-[10000] w-full max-w-2xl bg-(--surface-card) rounded-2xl border border-(--hairline) shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onKeyDown={handlePaletteKeyDown}
      >
        {/* Search Input */}
        <div className="flex items-center px-5 py-4 border-b border-(--hairline-soft)">
          <Search className="w-5 h-5 text-(--muted) mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 text-sm md:text-base bg-transparent outline-none placeholder:text-(--muted-soft) text-(--ink)"
            placeholder="Search tools, commands, or settings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button 
            onClick={() => setIsOpen(false)} 
            className="p-1.5 rounded-lg text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-xs text-(--muted)">
              No results found for &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredActions.map((action, index) => {
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={action.name}
                    className={`w-full flex items-center px-4 py-2.5 text-left rounded-xl transition-colors ${
                      isSelected 
                        ? 'bg-(--surface-soft) text-(--ink)' 
                        : 'text-(--body) hover:bg-(--surface-soft)/60'
                    }`}
                    onClick={() => handleSelect(action)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <action.icon className={`w-4 h-4 mr-3 shrink-0 ${isSelected ? 'text-(--primary)' : 'text-(--muted)'}`} />
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                      <span className="font-medium text-xs text-(--ink)">{action.name}</span>
                      <span className="text-[10px] font-medium text-(--muted) bg-(--surface-card) border border-(--hairline-soft) px-1.5 py-0.5 rounded">
                        {action.group}
                      </span>
                    </div>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-(--primary)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-(--hairline-soft) bg-(--surface-soft)/50 flex justify-between items-center text-xs text-(--muted)">
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <kbd className="bg-(--surface-card) px-1.5 py-0.5 border border-(--hairline) rounded text-(--muted) text-[10px]">↑</kbd>
              <kbd className="bg-(--surface-card) px-1.5 py-0.5 border border-(--hairline) rounded text-(--muted) text-[10px]">↓</kbd>
              navigate
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="bg-(--surface-card) px-1.5 py-0.5 border border-(--hairline) rounded text-(--muted) text-[10px]">Enter</kbd>
              select
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <kbd className="bg-(--surface-card) px-1.5 py-0.5 border border-(--hairline) rounded text-(--muted) text-[10px]">Esc</kbd>
            close
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
