"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Select an option", 
  disabled = false, 
  loading = false,
  loadingText = "Fetching resumes...",
  emptyText = "No resumes uploaded yet",
  className 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div 
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-gray-100 border-4 border-brutal-black text-left font-bold text-gray-500",
          "shadow-[4px_4px_0_#000] animate-pulse cursor-wait",
          className
        )}
      >
        <div className="flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 animate-spin text-black" />
          <span className="text-sm font-black uppercase tracking-tight text-gray-700">{loadingText}</span>
        </div>
        <div className="w-2.5 h-2.5 bg-brutal-yellow border-2 border-black rounded-full animate-ping" />
      </div>
    );
  }

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 bg-white border-4 border-brutal-black text-left font-bold text-black",
          "shadow-[4px_4px_0_#000] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all",
          "focus:outline-none focus:ring-2 focus:ring-brutal-pink",
          disabled && "opacity-50 cursor-not-allowed shadow-none translate-x-1 translate-y-1"
        )}
      >
        <span className={selectedOption ? "text-black truncate pr-2" : "text-gray-500 truncate pr-2"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000] max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-4 text-center font-bold text-sm text-gray-500">{emptyText}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left font-bold hover:bg-brutal-yellow transition-colors border-b-2 border-brutal-black last:border-0 text-sm"
              >
                <span className="truncate pr-2">{option.label}</span>
                {value === option.value && <Check className="w-5 h-5 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
