"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Sparkles, Cpu } from 'lucide-react';

const MODELS = [
  {
    id: 'default',
    name: 'Smart Router (Auto)',
    tags: [
      { text: 'Recommended', type: 'primary' },
      { text: 'Fastest', type: 'neutral' }
    ]
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    tags: [
      { text: 'Latest', type: 'primary' },
      { text: 'Ultra Fast', type: 'neutral' }
    ]
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    tags: [
      { text: 'Top Quality', type: 'primary' },
      { text: 'Reasoning', type: 'accent' }
    ]
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    tags: [
      { text: 'Balanced', type: 'neutral' },
      { text: 'Affordable', type: 'neutral' }
    ]
  },
  {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    tags: [
      { text: 'Top Coder', type: 'accent' },
      { text: 'Fast', type: 'neutral' }
    ]
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    tags: [
      { text: 'Deep Reasoning', type: 'accent' },
      { text: 'Math & Logic', type: 'neutral' }
    ]
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Gemma 4 31B (Free)',
    tags: [
      { text: 'Free Tier', type: 'success' },
      { text: 'Open Model', type: 'neutral' }
    ]
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra (Free)',
    tags: [
      { text: 'Free Tier', type: 'success' },
      { text: '550B', type: 'neutral' }
    ]
  }
];

function getTagStyle(type) {
  switch (type) {
    case 'primary':
      return 'bg-(--primary)/10 text-(--primary) border-(--primary)/20';
    case 'accent':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
    case 'success':
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    default:
      return 'bg-(--surface-soft) text-(--muted) border-(--hairline)';
  }
}

export function ModelSelector({ value, onChange, disabled, hideLabel, compact }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = MODELS.find(m => m.id === value) || MODELS[0];

  if (compact) {
    return (
      <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`} ref={dropdownRef}>
        <div 
          className="flex items-center justify-between border border-(--hairline) bg-(--surface-card) rounded-xl p-2.5 cursor-pointer hover:border-(--muted-soft) transition-colors gap-2 shadow-sm"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="font-medium text-xs text-(--ink) truncate">{selectedModel.name}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-(--muted) shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1.5 border border-(--hairline) bg-(--surface-card)/95 backdrop-blur-xl shadow-xl rounded-2xl max-h-[260px] overflow-y-auto min-w-[260px] p-1.5 animate-in fade-in zoom-in-95 duration-150">
            {MODELS.map((model) => (
              <div 
                key={model.id}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer ${
                  value === model.id ? 'bg-(--surface-soft) text-(--ink) font-medium' : 'hover:bg-(--surface-soft) text-(--muted)'
                }`}
                onClick={() => {
                  if (!disabled) {
                    onChange(model.id);
                    setIsOpen(false);
                  }
                }}
              >
                <span className="text-xs truncate mr-2">{model.name}</span>
                <div className="flex gap-1 flex-wrap shrink-0">
                  {model.tags.map((tag, idx) => (
                    <span key={idx} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${getTagStyle(tag.type)}`}>
                      {tag.text}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`mb-6 relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`} ref={dropdownRef}>
      {!hideLabel && (
        <label className="block text-xs uppercase tracking-wider font-medium text-(--muted) mb-2">
          Select AI Engine
        </label>
      )}
      
      <div 
        className="flex items-center justify-between border border-(--hairline) bg-(--surface-card) rounded-2xl p-4 shadow-sm cursor-pointer hover:border-(--muted-soft) hover:shadow-md transition-all"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-(--surface-soft) flex items-center justify-center text-(--primary) border border-(--hairline-soft)">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="font-medium text-sm sm:text-base text-(--ink)">{selectedModel.name}</span>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {selectedModel.tags.map((tag, idx) => (
              <span key={idx} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getTagStyle(tag.type)}`}>
                {tag.text}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-(--muted) shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 border border-(--hairline) bg-(--surface-card)/95 backdrop-blur-2xl shadow-2xl rounded-2xl max-h-[320px] overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-150 divide-y divide-(--hairline-soft)">
          {MODELS.map((model) => (
            <div 
              key={model.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl transition-colors cursor-pointer gap-2 ${
                value === model.id ? 'bg-(--surface-soft) text-(--ink)' : 'hover:bg-(--surface-soft) text-(--muted)'
              }`}
              onClick={() => {
                if (!disabled) {
                  onChange(model.id);
                  setIsOpen(false);
                }
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${value === model.id ? 'bg-(--primary)' : 'bg-transparent'}`} />
                <span className={`text-xs sm:text-sm ${value === model.id ? 'font-medium text-(--ink)' : 'text-(--body)'}`}>
                  {model.name}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {model.tags.map((tag, idx) => (
                  <span key={idx} className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getTagStyle(tag.type)}`}>
                    {tag.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-(--muted-soft) mt-2">
        Free models may experience high latency. Fallback routing automatically switches to Gemini if an upstream provider fails.
      </p>
    </div>
  );
}
