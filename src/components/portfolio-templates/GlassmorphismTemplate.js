import React from 'react';
import { ExternalLink, Code2, Globe, Mail, ChevronRight, Terminal, Code } from 'lucide-react';

export default function GlassmorphismTemplate({ data }) {
  if (!data) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-black text-white font-sans overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation / Header */}
        <nav className="flex justify-between items-center mb-20 backdrop-blur-md bg-white/5 border border-white/10 px-8 py-4 rounded-2xl">
          <div className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-fuchsia-400">
            {data.header?.name || 'Portfolio'}
          </div>
          <div className="flex gap-4">
            {data.contact?.github && (
              <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all hover:scale-110">
                <Code2 className="w-5 h-5 text-white" />
              </a>
            )}
            {data.contact?.linkedin && (
              <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all hover:scale-110">
                <Globe className="w-5 h-5 text-white" />
              </a>
            )}
            {data.contact?.email && (
              <a href={`mailto:${data.contact.email}`} className="p-2 rounded-full bg-white/5 hover:bg-white/20 border border-white/10 transition-all hover:scale-110">
                <Mail className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <header className="mb-32 flex flex-col items-center text-center mt-12">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-sm font-medium text-blue-300">
            {data.header?.title || 'Software Engineer'}
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-linear-to-b from-white to-white/70">
            {data.header?.tagline || 'Building Digital Experiences'}
          </h1>
        </header>

        {/* About Section */}
        {data.about && (
          <section className="mb-32 max-w-4xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/10 rounded-bl-full -z-10 blur-3xl"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-tr-full -z-10 blur-3xl"></div>
               <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                 <span className="w-10 h-1 bg-fuchsia-400 rounded-full block"></span>
                 About Me
               </h2>
               <p className="text-lg md:text-xl text-blue-50/80 font-light leading-relaxed whitespace-pre-wrap text-justify">
                 {data.about}
               </p>
            </div>
          </section>
        )}

        {/* Skills Section */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold">Expertise</h2>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.skills?.map((skill, index) => (
              <div 
                key={index} 
                className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-all hover:-translate-y-1"
              >
                <Code className="w-8 h-8 text-fuchsia-400 mb-4 opacity-70" />
                <span className="font-medium text-lg">{skill}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <h2 className="text-3xl font-bold">Selected Works</h2>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {data.projects?.map((project, index) => (
              <div 
                key={index} 
                className="group relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden transition-all hover:bg-white/10 hover:border-white/20"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                
                <h3 className="text-2xl font-bold mb-3 flex items-center justify-between">
                  {project.name}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-white transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </h3>
                
                <p className="text-blue-100/70 mb-8 font-light line-clamp-3">
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto">
                  {project.techStack?.map((tech, techIndex) => (
                    <span 
                      key={techIndex} 
                      className="px-3 py-1 text-xs font-medium bg-white/10 text-white rounded-full backdrop-blur-md border border-white/5"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="text-center py-20 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-t from-fuchsia-500/10 to-transparent"></div>
          <h2 className="text-4xl font-black mb-6 relative z-10">Ready to collaborate?</h2>
          <p className="text-blue-100/70 mb-8 max-w-xl mx-auto relative z-10">
            I&apos;m currently open for new opportunities and exciting projects. Let&apos;s build something amazing together.
          </p>
          {data.contact?.email && (
            <a 
              href={`mailto:${data.contact.email}`} 
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
            >
              Get in Touch <ChevronRight className="w-5 h-5" />
            </a>
          )}
        </footer>
      </div>
    </div>
  );
}
