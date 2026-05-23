import React from 'react';

export default function MinimalTemplate({ data }) {
  if (!data) return null;
  return (
    <div className="font-sans text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-8 py-20 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-4">
          {data.header?.name || 'Your Name'}
        </h1>
        <p className="text-xl text-slate-500 font-light tracking-wide mb-8">
          {data.header?.title || 'Software Engineer'}
        </p>
        <p className="text-lg text-slate-600 leading-relaxed font-light">
          {data.header?.tagline}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Main Column */}
          <div className="md:col-span-2 space-y-16">
            <section>
              <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-6">About</h2>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-light">{data.about}</p>
            </section>

            <section>
              <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-6">Projects</h2>
              <div className="space-y-8">
                {(Array.isArray(data.projects) ? data.projects : []).map((proj, i) => (
                  <div key={i} className="group">
                    <h3 className="text-lg font-medium text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{proj.name}</h3>
                    <p className="text-slate-600 mb-3 font-light">{proj.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech, j) => (
                        <span key={j} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{tech}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
            <section>
              <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(data.skills) ? data.skills : []).map((skill, i) => (
                  <span key={i} className="text-sm text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold tracking-widest text-slate-400 uppercase mb-6">Contact</h2>
              <div className="flex flex-col gap-4">
                {data.contact?.email && (
                  <a href={`mailto:${data.contact.email}`} className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600">@</span>
                    Email
                  </a>
                )}
                {data.contact?.linkedin && (
                  <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600">in</span>
                    LinkedIn
                  </a>
                )}
                {data.contact?.github && (
                  <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-blue-600 transition-colors inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600">gh</span>
                    GitHub
                  </a>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
