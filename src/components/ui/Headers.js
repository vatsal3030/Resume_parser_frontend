import React from 'react';

export function PageHeader({ title, subtitle, className = "" }) {
  return (
    <div className={`mb-8 border-b-4 border-brutal-black pb-6 ${className}`}>
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter rounded-none text-brutal-black drop-shadow-[2px_2px_0_#fff,4px_4px_0_#000]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg md:text-xl font-bold mt-3 bg-brutal-yellow inline-block px-3 py-1 border-2 border-brutal-black shadow-[2px_2px_0_#000]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function SectionHeader({ title, subtitle, icon: Icon, className = "", rightContent }) {
  return (
    <div className={`flex justify-between items-end mb-6 border-b-4 border-brutal-black pb-2 ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-8 h-8 text-brutal-black" />}
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight">{title}</h2>
          {subtitle && <p className="font-bold opacity-80 mt-1">{subtitle}</p>}
        </div>
      </div>
      {rightContent && (
        <div>{rightContent}</div>
      )}
    </div>
  );
}
