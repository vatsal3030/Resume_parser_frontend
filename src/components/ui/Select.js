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
  emptyText = "No options available",
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

  if (loading) {
    return (
      <div 
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2.5 bg-(--surface-card) border border-(--hairline) rounded-xl text-left text-xs text-(--muted) shadow-xs animate-pulse cursor-wait",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-(--primary)" />
          <span className="text-xs text-(--muted)">{loadingText}</span>
        </div>
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
          "w-full flex items-center justify-between px-3.5 py-2.5 bg-(--surface-card) border border-(--hairline) hover:border-(--muted-soft) rounded-xl text-left text-xs font-medium transition-colors shadow-xs",
          "focus:outline-none focus:border-(--primary)",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <span className={selectedOption ? "text-(--ink) truncate pr-2" : "text-(--muted-soft) truncate pr-2"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-(--muted) shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-(--surface-card)/95 backdrop-blur-xl border border-(--hairline) shadow-xl rounded-2xl max-h-60 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="p-3 text-center text-xs text-(--muted)">{emptyText}</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer",
                  value === option.value 
                    ? "bg-(--surface-soft) text-(--primary) font-medium" 
                    : "hover:bg-(--surface-soft) text-(--body) hover:text-(--ink)"
                )}
              >
                <span className="truncate pr-2">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4 shrink-0 text-(--primary)" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
