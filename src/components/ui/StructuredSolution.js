"use client";
import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Award, Check, Copy, CheckCircle2, Calculator, Layers, Terminal, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

/**
 * Checks if a block of text is actual programming code
 */
function isCodeBlock(text) {
  if (!text) return false;
  const codeIndicators = [
    /\b(def|class|function|const|let|var|return|import|export|if|else|for|while)\b/,
    /[{};=><]/,
    /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)\b/i,
    /\b(public|private|static|void|int|float|double|bool)\b/
  ];
  return codeIndicators.some(pattern => pattern.test(text));
}

/**
 * Formats mathematical formulas and probability symbols cleanly
 */
function formatMathFormulas(text) {
  if (!text) return text;
  return text
    .replace(/\bP\(F1\b/g, 'P(F₁')
    .replace(/\bP\(F2\b/g, 'P(F₂')
    .replace(/\bP\(F3\b/g, 'P(F₃')
    .replace(/\bF1\b/g, 'F₁')
    .replace(/\bF2\b/g, 'F₂')
    .replace(/\bF3\b/g, 'F₃')
    .replace(/\s+\*\s+/g, ' × ')
    .replace(/\s+n\s+/g, ' ∩ ');
}

/**
 * Parses ideal solutions into clean, structured sections (Formulations, Stated Rates, Calculations, Outcomes)
 */
function parseSolutionText(rawText) {
  if (!rawText) return { isMarkdown: false, sections: [] };

  const text = rawText.trim();

  // If already rich markdown with multiple headers or bold items, pass to ReactMarkdown
  if (text.includes('###') || (text.includes('**') && text.includes('\n- '))) {
    return { isMarkdown: true, content: text };
  }

  // Split into paragraphs by double newlines
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const sections = [];

  paragraphs.forEach((p, idx) => {
    const lower = p.toLowerCase();

    if (lower.startsWith('let ') || lower.includes('be the event') || lower.includes('we are looking for') || lower.includes('joint probability')) {
      sections.push({
        type: 'formulation',
        title: 'Problem Formulation & Events',
        icon: 'Layers',
        content: formatMathFormulas(p)
      });
    } else if (lower.includes('from the problem statement') || (p.includes('1.') && p.includes('2.') && lower.includes('rate'))) {
      sections.push({
        type: 'parameters',
        title: 'Conditional Rates & Probabilities',
        icon: 'Layers',
        content: formatMathFormulas(p)
      });
    } else if (lower.startsWith('calculation') || lower.startsWith('shortcut') || lower.includes('= 0.') || lower.includes('% =')) {
      sections.push({
        type: 'calculation',
        title: lower.includes('shortcut') ? 'Shortcut Verification' : 'Exact Calculation & Derivation',
        icon: 'Calculator',
        content: formatMathFormulas(p)
      });
    } else if (lower.startsWith('conclusion') || lower.includes('failure rate of') || lower.includes('translates to a success')) {
      sections.push({
        type: 'conclusion',
        title: 'Engineering SLA Impact & Conclusion',
        icon: 'CheckCircle2',
        content: p.replace(/^conclusion:\s*/i, '')
      });
    } else if (isCodeBlock(p) && p.length > 50) {
      sections.push({
        type: 'code',
        title: 'Algorithm Implementation',
        icon: 'Terminal',
        content: p
      });
    } else {
      sections.push({
        type: 'step',
        title: `Step ${sections.length + 1}: Technical Breakdown`,
        icon: 'BookOpen',
        content: p
      });
    }
  });

  return { isMarkdown: false, sections };
}

/**
 * StructuredSolution — Renders interview model solutions with Claude-style
 * typography, clean formula callouts, step badges, and scannable visual hierarchy.
 */
export function StructuredSolution({ solution, guidance, className = "" }) {
  const [copied, setCopied] = useState(false);
  const rawText = solution || guidance || 'Refer to model interview guidelines above.';

  const parsed = useMemo(() => parseSolutionText(rawText), [rawText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-4 text-left ${className}`}>
      {/* Top Header Strip */}
      <div className="flex items-center justify-between border-b border-(--hairline) pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <Award className="w-4 h-4" />
          <span>Model Solution & Technical Derivation</span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-(--muted) hover:text-(--ink) hover:bg-(--surface-soft) border border-(--hairline) transition-all cursor-pointer shadow-2xs"
          title="Copy solution text"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Solution'}</span>
        </button>
      </div>

      {parsed.isMarkdown ? (
        <div className="prose prose-sm dark:prose-invert max-w-none space-y-3 text-(--ink) leading-relaxed">
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <div className="mt-4 mb-2 p-2.5 rounded-xl bg-(--surface-soft) border border-(--hairline) flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h4 className="text-sm font-semibold text-(--ink) m-0">{children}</h4>
                </div>
              ),
              p: ({ children }) => (
                <p className="text-sm text-(--body) leading-relaxed mb-2.5 font-normal">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="space-y-1.5 my-2 pl-4 list-disc text-sm text-(--body)">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed pl-1">{children}</li>
              ),
              code: ({ inline, children }) => {
                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded-md bg-(--surface-soft) border border-(--hairline) font-mono text-xs text-(--ink)">
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="my-3 rounded-xl bg-(--surface-dark) text-(--on-dark) border border-(--hairline) overflow-hidden shadow-xs">
                    <div className="px-3.5 py-2 bg-(--surface-dark-elevated) border-b border-white/10 text-[11px] font-mono text-white/60">
                      Code Snippet
                    </div>
                    <pre className="p-4 font-mono text-xs overflow-x-auto text-emerald-300 leading-relaxed">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              }
            }}
          >
            {parsed.content}
          </ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-3.5">
          {parsed.sections.map((section, sIdx) => {
            // Conclusion / SLA Card (Highlighted emerald banner)
            if (section.type === 'conclusion') {
              return (
                <div key={sIdx} className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-950 dark:text-emerald-100 space-y-2 shadow-xs">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{section.title}</span>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed font-medium">
                    {section.content}
                  </p>
                </div>
              );
            }

            // Calculation Card
            if (section.type === 'calculation') {
              return (
                <div key={sIdx} className="p-4 rounded-xl border border-(--hairline) bg-(--surface-card) space-y-2.5 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-(--ink)">
                    <Calculator className="w-3.5 h-3.5 text-(--primary)" />
                    <span>{section.title}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-(--surface-soft) font-mono text-xs sm:text-[13px] text-(--ink) leading-relaxed whitespace-pre-wrap border border-(--hairline)">
                    {section.content}
                  </div>
                </div>
              );
            }

            // Code Block
            if (section.type === 'code') {
              return (
                <div key={sIdx} className="rounded-xl border border-(--hairline) bg-(--surface-dark) text-(--on-dark) overflow-hidden shadow-xs">
                  <div className="flex items-center justify-between px-3.5 py-2 bg-(--surface-dark-elevated) border-b border-white/10 text-xs">
                    <span className="font-mono text-[11px] text-white/70 flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-(--primary)" /> {section.title}
                    </span>
                  </div>
                  <div className="p-4 font-mono text-xs whitespace-pre-wrap overflow-x-auto text-emerald-300 leading-relaxed">
                    {section.content}
                  </div>
                </div>
              );
            }

            // Formulation / Conditional Rates / General Breakdown
            return (
              <div key={sIdx} className="p-4 rounded-xl border border-(--hairline) bg-(--surface-card) space-y-2 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-(--primary)/10 text-(--primary) border border-(--primary)/20 flex items-center justify-center font-bold text-[11px]">
                    {sIdx + 1}
                  </span>
                  <span className="text-xs font-semibold text-(--ink)">{section.title}</span>
                </div>
                <div className="pl-7 text-xs sm:text-sm text-(--body) leading-relaxed whitespace-pre-wrap font-normal">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
