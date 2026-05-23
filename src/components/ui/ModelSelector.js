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
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    tags: [
      { text: 'Fast', color: 'bg-blue-300' }
    ]
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    tags: [
      { text: 'Powerful', color: 'bg-purple-300' },
      { text: 'Slower', color: 'bg-orange-200' }
    ]
  },
  {
    id: 'deepseek/deepseek-v4-flash:free',
    name: 'DeepSeek Flash (V4)',
    tags: [
      { text: 'Free', color: 'bg-yellow-300' },
      { text: 'Strong Reasoning', color: 'bg-pink-200' }
    ]
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 (70B)',
    tags: [
      { text: 'Free', color: 'bg-yellow-300' }
    ]
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    tags: [
      { text: 'Premium', color: 'bg-purple-300' },
      { text: 'Versatile', color: 'bg-blue-200' }
    ]
  },
  {
    id: 'anthropic/claude-sonnet-latest',
    name: 'Claude Sonnet (Latest)',
    tags: [
      { text: 'Premium', color: 'bg-purple-300' },
      { text: 'Best for Coding/Text', color: 'bg-green-200' }
    ]
  },
  {
    id: 'x-ai/grok-2-1212',
    name: 'Grok 2',
    tags: [
      { text: 'Premium', color: 'bg-purple-300' },
      { text: 'Fast', color: 'bg-orange-200' }
    ]
  },
  {
    id: 'openai/gpt-3.5-turbo',
    name: 'GPT 3.5 Turbo',
    tags: [
      { text: 'Reliable', color: 'bg-blue-300' }
    ]
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash (Free)',
    tags: [
      { text: 'Free', color: 'bg-yellow-300' }
    ]
  }
];

export function ModelSelector({ value, onChange, disabled, hideLabel }) {
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
