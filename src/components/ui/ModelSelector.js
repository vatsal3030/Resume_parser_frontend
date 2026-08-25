import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const MODELS = [
  {
    id: 'default',
    name: 'Smart Router (Auto)',
    tags: [
      { text: 'Recommended', color: 'bg-green-300' },
      { text: 'Fastest', color: 'bg-blue-200' }
    ]
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Gemini 3.7 Flash',
    tags: [
      { text: 'Latest', color: 'bg-purple-300' },
      { text: 'Ultra Fast', color: 'bg-green-200' }
    ]
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    tags: [
      { text: 'Google Direct', color: 'bg-blue-300' },
      { text: 'Stable', color: 'bg-yellow-200' }
    ]
  },
  {
    id: 'anthropic/claude-sonnet-5',
    name: 'Claude Sonnet 5',
    tags: [
      { text: 'Best Quality', color: 'bg-red-300' },
      { text: 'Pro', color: 'bg-purple-200' }
    ]
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    name: 'Claude Haiku 4.5',
    tags: [
      { text: 'Fast', color: 'bg-cyan-300' },
      { text: 'Affordable', color: 'bg-green-200' }
    ]
  },
  {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    tags: [
      { text: 'Top Coder', color: 'bg-cyan-300' },
      { text: 'Fast', color: 'bg-yellow-300' }
    ]
  },
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    tags: [
      { text: 'Deep Reasoning', color: 'bg-amber-300' },
      { text: 'Chain-of-Thought', color: 'bg-orange-200' }
    ]
  },
  {
    id: 'google/gemma-4-31b-it:free',
    name: 'Gemma 4 31B (Free)',
    tags: [
      { text: 'Free Tier', color: 'bg-emerald-300' },
      { text: 'Google Open', color: 'bg-blue-200' }
    ]
  },
  {
    id: 'nvidia/nemotron-3-ultra-550b-a55b:free',
    name: 'Nemotron 3 Ultra (Free)',
    tags: [
      { text: 'Free Tier', color: 'bg-emerald-300' },
      { text: '550B Params', color: 'bg-pink-200' }
    ]
  }
];

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

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const selectedModel = MODELS.find(m => m.id === value) || MODELS[0];

  if (compact) {
    return (
      <div className={`relative ${disabled ? 'opacity-60 pointer-events-none' : ''}`} ref={dropdownRef}>
        <div 
          className="flex items-center justify-between border-2 border-brutal-black bg-white p-2 cursor-pointer hover:bg-gray-50 gap-2"
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="font-bold text-sm truncate">{selectedModel.name}</span>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 border-2 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] max-h-[250px] overflow-y-auto min-w-[240px]">
            {MODELS.map((model) => (
              <div 
                key={model.id}
                className={`flex items-center justify-between p-2 border-b border-gray-200 hover:bg-brutal-yellow/20 cursor-pointer ${value === model.id ? 'bg-brutal-yellow/30' : ''} last:border-b-0`}
                onClick={() => {
                  if (!disabled) {
                    onChange(model.id);
                    setIsOpen(false);
                  }
                }}
              >
                <span className="font-bold text-sm">{model.name}</span>
                <div className="flex gap-1 flex-wrap">
                  {model.tags.map((tag, idx) => (
                    <span key={idx} className={`text-[10px] font-bold px-1.5 py-0.5 border border-brutal-black ${tag.color}`}>
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
        <label className="block text-sm font-black uppercase mb-2">Select AI Engine (Optional)</label>
      )}
      
      <div 
        className="flex items-center justify-between border-4 border-brutal-black bg-white p-3 shadow-[4px_4px_0_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50"
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <span className="font-black text-lg">{selectedModel.name}</span>
          <div className="flex gap-2">
            {selectedModel.tags.map((tag, idx) => (
              <span key={idx} className={`text-xs font-bold px-2 py-1 border-2 border-brutal-black ${tag.color}`}>
                {tag.text}
              </span>
            ))}
          </div>
        </div>
        <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] max-h-[300px] overflow-y-auto">
          {MODELS.map((model) => (
            <div 
              key={model.id}
              className={`flex flex-col md:flex-row md:items-center justify-between p-3 border-b-2 border-brutal-black hover:bg-brutal-yellow/20 cursor-pointer ${value === model.id ? 'bg-brutal-yellow/30' : ''} last:border-b-0`}
              onClick={() => {
                if (!disabled) {
                  onChange(model.id);
                  setIsOpen(false);
                }
              }}
            >
              <span className="font-black mb-2 md:mb-0">{model.name}</span>
              <div className="flex gap-2 flex-wrap">
                {model.tags.map((tag, idx) => (
                  <span key={idx} className={`text-xs font-bold px-2 py-1 border-2 border-brutal-black ${tag.color}`}>
                    {tag.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs font-bold mt-2 text-gray-600">
        Free models may have rate limits and delays. Fallback to Gemini automatically happens if OpenRouter fails.
      </p>
    </div>
  );
}
