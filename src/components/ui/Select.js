"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Select({ value, onChange, options, placeholder = "Select an option", disabled = false, className }) {
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
        <span className={selectedOption ? "text-black" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000] max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-4 text-center font-bold text-gray-500">No options available</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-left font-bold hover:bg-brutal-yellow transition-colors border-b-2 border-brutal-black last:border-0"
              >
                {option.label}
                {value === option.value && <Check className="w-5 h-5" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
