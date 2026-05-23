import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreativeTemplate({ data }) {
  const [activeTab, setActiveTab] = useState('home');

  if (!data) return null;

  const tabs = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Work' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="bg-zinc-950 text-white min-h-[600px] flex flex-col font-sans rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
      {/* Navigation */}
      <nav className="flex justify-center gap-6 p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`text-sm font-medium tracking-widest uppercase transition-colors relative pb-2 \${
              activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div 
                layoutId="creative-active-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-fuchsia-500" 
              />
            )}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <div className="flex-1 relative overflow-hidden p-8 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center flex-1 text-center max-w-3xl w-full"
            >
              <div className="w-24 h-24 bg-linear-to-tr from-violet-500 to-fuchsia-500 rounded-full blur-3xl absolute -z-10 opacity-50"></div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-linear-to-r from-yellow-400 to-orange-500">
                {data.header?.name || 'Creative'}
              </h1>
              <h2 className="text-xl md:text-3xl text-zinc-400 mb-8 font-light">
                {data.header?.title || 'Digital Artist & Engineer'}
              </h2>
              <p className="text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed">
                {data.header?.tagline}
              </p>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl flex flex-col flex-1"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-8 h-1 bg-violet-500 block"></span> About
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-12 whitespace-pre-wrap">
                {data.about}
              </p>
              <h3 className="text-xl font-bold mb-6 text-white">Capabilities</h3>
              <div className="flex flex-wrap gap-3">
                {(Array.isArray(data.skills) ? data.skills : []).map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-full text-sm hover:border-violet-500 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-6xl flex flex-col flex-1"
            >
              <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
                <span className="w-8 h-1 bg-fuchsia-500 block"></span> Selected Work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {(Array.isArray(data.projects) ? data.projects : []).map((proj, i) => (
                  <div key={i} className="group relative bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{proj.name}</h3>
                    <p className="text-zinc-400 mb-6 relative z-10">{proj.description}</p>
                    <div className="flex flex-wrap gap-2 relative z-10 mt-auto">
                      {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech, j) => (
                        <span key={j} className="text-xs bg-zinc-950 text-zinc-300 border border-zinc-800 px-3 py-1 rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center flex-1 w-full text-center"
            >
              <h2 className="text-5xl font-black mb-8 text-white">Let&apos;s Connect</h2>
              <div className="flex flex-col md:flex-row gap-6">
                {data.contact?.email && (
                  <a href={`mailto:${data.contact.email}`} className="px-8 py-4 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3">
                    ✉️ {data.contact.email}
                  </a>
                )}
                {data.contact?.linkedin && (
                  <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3">
                    💼 LinkedIn
                  </a>
                )}
                {data.contact?.github && (
                  <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-zinc-800 text-white rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3">
                    💻 GitHub
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
