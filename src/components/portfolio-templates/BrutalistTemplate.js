import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function BrutalistTemplate({ data }) {
  if (!data) return null;
  return (
    <div className="border border-(--hairline) overflow-hidden shadow-md font-sans text-black bg-white">
      {/* Header */}
      <div className="bg-(--primary) p-12 text-center border-b border-(--hairline)">
        <h1 className="text-5xl md:text-6xl font-mediumer mb-4 wrap-break-word">
          {data.header?.name || 'Your Name'}
        </h1>
        <p className="text-xl md:text-2xl font-bold bg-white inline-block px-4 py-1 border border-(--hairline) shadow-[2px_2px_0_rgba(0,0,0,1)]">
          {data.header?.title || 'Software Engineer'}
        </p>
        <p className="mt-6 font-medium max-w-2xl mx-auto text-lg">{data.header?.tagline}</p>
      </div>

      {/* About & Skills */}
      <div className="grid grid-cols-1 md:grid-cols-3 bg-white">
        <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-(--hairline)">
          <h3 className="text-2xl font-black mb-4 uppercase">About Me</h3>
          <p className="font-medium text-lg leading-relaxed whitespace-pre-wrap">{data.about}</p>
        </div>
        <div className="p-8 bg-(--canvas)">
          <h3 className="text-2xl font-black mb-4 uppercase">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(data.skills) ? data.skills : []).map((skill, i) => (
              <span key={i} className="bg-white border border-(--hairline) px-3 py-1 font-bold text-sm shadow-[2px_2px_0_rgba(0,0,0,1)]">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="p-8 bg-(--primary-active) border-t border-(--hairline)">
        <h3 className="text-3xl font-black mb-8 uppercase text-center">Featured Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(Array.isArray(data.projects) ? data.projects : []).map((proj, i) => (
            <div key={i} className="bg-white border border-(--hairline) shadow-sm hover:-translate-y-1 hover:shadow-[6px_6px_0_rgba(0,0,0,1)] transition-all p-6 flex flex-col">
              <h4 className="text-xl font-black mb-2">{proj.name}</h4>
              <p className="font-medium mb-4 text-sm flex-1">{proj.description}</p>
              <div className="flex flex-wrap gap-1 mt-auto">
                {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech, j) => (
                  <span key={j} className="text-xs font-bold bg-slate-200 px-2 py-1 uppercase">{tech}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="p-12 text-center bg-(--accent-amber) text-black border-t border-(--hairline)">
        <h3 className="text-3xl font-black mb-6 uppercase">Let&apos;s Build Something</h3>
        <div className="flex justify-center gap-4 flex-wrap">
          {data.contact?.email && <a href={`mailto:${data.contact.email}`} className="bg-white text-black font-bold border border-(--hairline) px-6 py-3 shadow-sm hover:-translate-y-1 transition-transform">Email Me</a>}
          {data.contact?.linkedin && <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="bg-white text-black font-bold border border-(--hairline) px-6 py-3 shadow-sm hover:-translate-y-1 transition-transform">LinkedIn</a>}
          {data.contact?.github && <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="bg-white text-black font-bold border border-(--hairline) px-6 py-3 shadow-sm hover:-translate-y-1 transition-transform">GitHub</a>}
        </div>
      </div>
    </div>
  );
}
