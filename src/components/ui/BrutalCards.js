import React from 'react';
import Link from 'next/link';

// Used for linking to individual tools on the dashboard — Claude Glass Style
export function ToolCard({ 
  title, 
  description, 
  href, 
  icon: Icon
}) {
  return (
    <Link href={href} className="block h-full group">
      <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) hover:bg-(--surface-soft) hover:border-(--primary)/50 transition-all duration-200 p-6 h-full flex flex-col justify-between shadow-sm hover:shadow-md cursor-pointer group">
        <div>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary) mb-4 group-hover:scale-105 group-hover:bg-(--primary)/10 transition-all">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h3 className="text-base font-serif font-normal mb-1.5 text-(--ink) group-hover:text-(--primary) transition-colors">
            {title}
          </h3>
          <p className="text-xs text-(--muted) leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Used for static data visualization (metrics, stats, etc) — Claude Glass Style
export function DashboardCard({
  title,
  value,
  subtext,
  icon: Icon
}) {
  return (
    <div className="rounded-2xl border border-(--hairline) bg-(--surface-card) p-6 flex flex-col justify-between h-full shadow-sm transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs uppercase tracking-wider font-medium text-(--muted)">{title}</p>
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-(--surface-soft) border border-(--hairline-soft) flex items-center justify-center text-(--primary)">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div>
        <span className="text-3xl md:text-4xl font-serif text-(--ink) tracking-tight">{value}</span>
        {subtext && <p className="text-xs mt-2 text-(--muted)">{subtext}</p>}
      </div>
    </div>
  );
}
