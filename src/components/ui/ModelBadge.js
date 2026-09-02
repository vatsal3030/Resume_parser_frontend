import React from 'react';
import { Cpu } from 'lucide-react';

export function ModelBadge({ meta }) {
  if (!meta || !meta.model) return null;

  const { provider, model } = meta;

  let displayName = model;
  if (model.includes('/')) {
    displayName = model.split('/').slice(-1)[0];
  }
  
  displayName = displayName
    .replace('gemini-3.7-flash', 'Gemini 3.7 Flash')
    .replace('gemini-3.6-flash', 'Gemini 3.6 Flash')
    .replace('gemini-flash-latest', 'Gemini Flash Latest')
    .replace('gemini-2.5-flash', 'Gemini 2.5 Flash')
    .replace('gemini-2.0-flash', 'Gemini 2.0 Flash')
    .replace('nemotron-3.5-lightning:free', 'Nemotron 3.5 Free')
    .replace('gemma-4-26b-a4b-it:free', 'Gemma 4 Free')
    .replace('claude-3.5-sonnet', 'Claude 3.5 Sonnet')
    .replace('gpt-4o-mini', 'GPT-4o Mini')
    .replace('gpt-4o', 'GPT-4o');

  const providerLabel = provider === 'openrouter' ? 'OpenRouter' : 'Direct';

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-(--muted)">
      <Cpu className="w-3.5 h-3.5 text-(--primary)" />
      <span>{displayName}</span>
      <span className="text-(--muted-soft)">•</span>
      <span className="text-[11px] text-(--muted-soft)">{providerLabel}</span>
    </div>
  );
}
