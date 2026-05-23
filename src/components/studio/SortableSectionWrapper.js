"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SECTION_LABELS = {
  personal: { label: "Personal", color: "bg-brutal-yellow" },
  summary: { label: "Summary", color: "bg-brutal-pink" },
  experience: { label: "Experience", color: "bg-brutal-blue text-white" },
  education: { label: "Education", color: "bg-brutal-mint" },
  skills: { label: "Skills", color: "bg-purple-300" },
  projects: { label: "Projects", color: "bg-orange-300" },
  certifications: { label: "Certifications", color: "bg-green-300" },
};

export function SortableSectionWrapper({ id, sectionKey, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const info = SECTION_LABELS[sectionKey] || { label: sectionKey, color: "bg-gray-200" };

  return (
    <section 
      ref={setNodeRef} 
      style={style} 
      className={`mb-6 border-4 border-brutal-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] ${isDragging ? 'shadow-none' : ''}`}
    >
      <div className="flex items-center gap-2 p-3 border-b-4 border-brutal-black bg-slate-50">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-slate-200 p-1 rounded">
          <GripVertical className="w-5 h-5 text-gray-500" />
        </div>
        <h2 className={`text-sm font-black uppercase tracking-tighter inline-block px-2 py-1 border-2 border-brutal-black ${info.color}`}>
          {info.label}
        </h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}
