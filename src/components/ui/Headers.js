import React from 'react';

export function PageHeader({ title, subtitle, className = "" }) {
  return (
    <div className={`mb-8 border-b border-(--hairline) pb-6 ${className}`}>
      <h1 className="text-3xl md:text-4xl font-serif text-(--ink) tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-sm md:text-base text-(--muted) mt-1.5 font-normal leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon, className = "", rightContent }) {
  return (
    <div className={`flex justify-between items-end mb-6 border-b border-(--hairline) pb-3 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary)">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-serif text-(--ink)">{title}</h2>
          {subtitle && <p className="text-xs text-(--muted) mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {rightContent && (
        <div>{rightContent}</div>
      )}
    </div>
  );
}
