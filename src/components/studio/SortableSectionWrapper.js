"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const SECTION_LABELS = {
 personal: { label:"Personal", color:"bg-(--primary)" },
 summary: { label:"Summary", color:"bg-(--primary-active)" },
 experience: { label:"Experience", color:"bg-(--accent-amber) text-white" },
 education: { label:"Education", color:"bg-(--accent-teal)" },
 skills: { label:"Skills", color:"bg-purple-300" },
 projects: { label:"Projects", color:"bg-orange-300" },
 certifications: { label:"Certifications", color:"bg-green-300" },
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

 const info = SECTION_LABELS[sectionKey] || { label: sectionKey, color:"bg-gray-200" };

 return (
    <section 
      ref={setNodeRef} 
      style={style} 
      className={`mb-4 rounded-2xl border border-(--hairline) bg-(--surface-card) shadow-sm overflow-hidden ${isDragging ? 'shadow-none opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-(--hairline-soft) bg-(--surface-soft)/50">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-(--surface-soft) p-1 rounded-lg transition-colors">
          <GripVertical className="w-4 h-4 text-(--muted)" />
        </div>
        <h2 className="text-xs font-serif font-medium text-(--ink) px-2.5 py-0.5 rounded-full border border-(--hairline-soft) bg-(--surface-soft)">
          {info.label}
        </h2>
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
 );
}
