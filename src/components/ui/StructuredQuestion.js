"use client";
import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Target, Lightbulb, Layers, Compass, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * Strips outer quotes from text (straight and curly quotes)
 */
function cleanQuotes(text) {
  if (!text) return '';
  return text.trim().replace(/^["'“‘\s]+|["'”’\s]+$/g, '').trim();
}

/**
 * Highlights key metrics, percentages, constraints, and technologies in text
 */
function renderHighlightedText(text) {
  if (!text) return null;

  // Pattern matches percentages, attempts/numbers, HTTP codes, technical protocols
  const tokenRegex = /(\b\d+(?:\.\d+)?%|\b\d+\s+(?:attempts?|retries?|tasks?|workers?|threads?|mins?|minutes?|seconds?|times?)\b|\b\d+x\b|\bHTTP\s+\d{3}\b|\b(?:Gemini(?:\s+LLM)?|PostgreSQL|Redis|BullMQ|DAGs?|ZSET|STAR(?:\s+Method)?|Read Committed)\b)/gi;

  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (tokenRegex.test(part)) {
      return (
        <span 
          key={idx} 
          className="font-semibold text-(--ink) bg-(--primary)/10 dark:bg-(--primary)/20 px-1.5 py-0.5 rounded-md border border-(--primary)/20 text-[13px] sm:text-sm mx-0.5 inline-block"
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

/**
 * Splits plain-text question paragraphs into Scenario, Key Conditions, and Objective
 */
function parseUnstructuredQuestion(text) {
  const cleaned = cleanQuotes(text);

  // If text already has markdown headers or bullet points, return as-is for ReactMarkdown
  if (cleaned.includes('###') || cleaned.includes('\n- ') || cleaned.includes('\n* ') || cleaned.includes('\n1. ')) {
    return { isMarkdown: true, raw: cleaned };
  }

  // Split into sentences
  const sentences = cleaned.split(/(?<=[.?!])\s+(?=[A-Z0-9"`“'])/).map(s => s.trim()).filter(Boolean);

  const isDirective = (s) => {
    return s.endsWith('?') || 
           /\b(what|how|why|which|where|when|who|calculate|determine|derive|write|provide|design|explain|describe|implement)\b/i.test(s);
  };

  // If only 1 sentence:
  if (sentences.length === 1) {
    const s = sentences[0];
    const match = s.match(/^(In\s+[^,]+,\s*(?:when\s+[^,]+,\s*)?|When\s+[^,]+,\s*)(which|what|how|describe|explain|why)\b(.*)$/i);
    if (match) {
      return {
        isMarkdown: false,
        scenario: match[1].replace(/,\s*$/, '').trim(),
        conditions: [],
        objective: (match[2] + match[3]).trim()
      };
    }
    return {
      isMarkdown: false,
      scenario: '',
      conditions: [],
      objective: s
    };
  }

  // Work backwards to find objectives
  let objectiveSentences = [];
  let remaining = [...sentences];

  let i = remaining.length - 1;
  while (i >= 0) {
    const s = remaining[i];
    if (isDirective(s) || s.toLowerCase().includes('return -1') || s.toLowerCase().includes('derivation')) {
      objectiveSentences.unshift(remaining[i]);
      i--;
    } else {
      break;
    }
  }

  if (objectiveSentences.length === 0 && remaining.length > 0) {
    objectiveSentences = [remaining[remaining.length - 1]];
    i = remaining.length - 2;
  }

  const unassigned = remaining.slice(0, i + 1);
  let scenario = '';
  let conditions = [];

  if (unassigned.length > 0) {
    scenario = unassigned[0];
    conditions = unassigned.slice(1);
  }

  return {
    isMarkdown: false,
    scenario,
    conditions,
    objective: objectiveSentences.join(' ')
  };
}

/**
 * StructuredQuestion — Renders questions with Claude & ChatGPT style scannable hierarchy
 * (Scenario -> Key Parameters -> Core Objective).
 */
export function StructuredQuestion({ question, context, compact = false, className = "" }) {
  const [expanded, setExpanded] = useState(false);
  const parsed = useMemo(() => parseUnstructuredQuestion(question), [question]);

  if (parsed.isMarkdown) {
    return (
      <div className={`space-y-3 text-left ${className}`}>
        <div className="prose prose-sm dark:prose-invert max-w-none text-(--ink) leading-relaxed">
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h4 className="text-base font-semibold text-(--ink) mt-4 mb-2 flex items-center gap-2">
                  {children}
                </h4>
              ),
              p: ({ children }) => (
                <p className="text-sm sm:text-base text-(--body) leading-relaxed mb-2.5 font-normal">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-1.5 my-2 pl-4 list-disc text-sm sm:text-base text-(--body)">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed pl-1">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-(--ink)">{children}</strong>
              )
            }}
          >
            {parsed.raw}
          </ReactMarkdown>
        </div>

        {context && (
          <div className="bg-(--surface-soft)/60 border-l-3 border-(--accent-amber) p-3 rounded-r-xl text-left">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--accent-amber) flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" /> Interviewer Focus
            </p>
            <p className="text-xs sm:text-sm text-(--body) mt-0.5 leading-relaxed">{context}</p>
          </div>
        )}
      </div>
    );
  }

  // Compact Mode (used in cheat sheet and question list cards)
  if (compact) {
    return (
      <div className={`space-y-2.5 text-left ${className}`}>
        {/* Core Objective as primary anchor */}
        {parsed.objective ? (
          <div className="text-sm sm:text-[15px] font-medium text-(--ink) leading-snug">
            {renderHighlightedText(parsed.objective)}
          </div>
        ) : (
          <div className="text-sm text-(--ink) leading-snug">
            {renderHighlightedText(parsed.scenario)}
          </div>
        )}

        {/* Key parameter badges */}
        {parsed.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {parsed.conditions.map((cond, idx) => (
              <span 
                key={idx}
                className="text-[11px] bg-(--surface-soft) text-(--muted) border border-(--hairline) px-2.5 py-1 rounded-lg leading-tight flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-(--primary)/60"></span>
                <span>{renderHighlightedText(cond)}</span>
              </span>
            ))}
          </div>
        )}

        {/* Expandable full scenario toggle if scenario exists */}
        {parsed.scenario && parsed.objective && (
          <div className="pt-1">
            <button
              onClick={() => setExpanded(!expanded)}
              type="button"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-(--primary) hover:underline cursor-pointer"
            >
              <span>{expanded ? 'Hide Scenario Background' : 'View Scenario Context'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {expanded && (
              <div className="mt-2 p-3 rounded-xl bg-(--surface-card) border border-(--hairline) text-xs text-(--body) leading-relaxed animate-in fade-in">
                <p className="font-semibold text-(--ink) text-[11px] mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Compass className="w-3 h-3 text-(--primary)" /> Background Context
                </p>
                {renderHighlightedText(parsed.scenario)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full / Expanded Mode (Used in active interview question and solution review)
  return (
    <div className={`space-y-4 text-left ${className}`}>
      {/* 1. Context / Scenario Banner */}
      {parsed.scenario && (
        <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-(--muted)">
            <Compass className="w-3.5 h-3.5 text-(--primary)" />
            <span>Scenario & Architectural Context</span>
          </div>
          <p className="text-sm sm:text-[15.5px] text-(--body) leading-relaxed font-normal">
            {renderHighlightedText(parsed.scenario)}
          </p>
        </div>
      )}

      {/* 2. Key Parameters & Constraints Grid */}
      {parsed.conditions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-(--muted) flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-(--primary)" /> Key Parameters & Governing Rules
            </span>
            <span className="text-[11px] text-(--muted-soft) font-medium">
              {parsed.conditions.length} conditions
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {parsed.conditions.map((cond, idx) => (
              <div 
                key={idx} 
                className="p-3.5 rounded-xl border border-(--hairline) bg-(--surface-card) text-xs sm:text-[13.5px] text-(--body) flex items-start gap-3 shadow-2xs hover:border-(--primary)/40 transition-colors"
              >
                <span className="w-5 h-5 rounded-md bg-(--primary)/10 text-(--primary) flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5 border border-(--primary)/20">
                  {idx + 1}
                </span>
                <div className="leading-relaxed">
                  {renderHighlightedText(cond)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Objective / Core Question Callout */}
      {parsed.objective && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-(--primary)/30 bg-gradient-to-br from-(--primary)/10 via-(--primary)/5 to-transparent text-(--ink) space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--primary)">
            <Target className="w-4 h-4" />
            <span>Core Objective</span>
          </div>
          <p className="text-base sm:text-lg font-serif font-medium leading-relaxed text-(--ink)">
            {renderHighlightedText(parsed.objective)}
          </p>
        </div>
      )}

      {/* 4. Optional Interviewer Context */}
      {context && (
        <div className="bg-(--surface-soft)/60 border-l-3 border-(--accent-amber) p-3.5 rounded-r-xl text-left shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-(--accent-amber) flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5" /> What Interviewers Evaluate Here
          </p>
          <p className="text-xs sm:text-sm text-(--body) mt-1 leading-relaxed">{context}</p>
        </div>
      )}
    </div>
  );
}
