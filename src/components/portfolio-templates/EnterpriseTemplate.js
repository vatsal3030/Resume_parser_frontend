import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EnterpriseTemplate({ data }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!data) return null;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-[600px] flex flex-col font-sans rounded-xl overflow-hidden shadow-xl border border-slate-200">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-black text-xl">
            {data.header?.name?.[0] || 'E'}
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">{data.header?.name}</span>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Documentation</button>
          {data.contact?.email && (
            <a href={`mailto:${data.contact.email}`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm">
              Contact Sales
            </a>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-3">Dashboard</span>
          <button 
            onClick={() => setActiveTab('overview')}
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('features')}
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'features' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Core Features
          </button>
          <button 
            onClick={() => setActiveTab('integrations')}
            className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'integrations' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Integrations
          </button>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-10 overflow-y-auto bg-slate-50 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <div className="mb-12">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full mb-4 inline-block uppercase tracking-wider">Enterprise Grade</span>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                    {data.header?.title || 'Senior Software Engineer'}
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed mb-8">
                    {data.header?.tagline}
                  </p>
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed max-w-3xl">
                    {data.about}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Scalable Solutions</h3>
                    <p className="text-sm text-slate-500">Built to handle millions of requests with 99.99% uptime.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Secure by Default</h3>
                    <p className="text-sm text-slate-500">Industry-standard security practices and compliance.</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-2">Developer Experience</h3>
                    <p className="text-sm text-slate-500">Clean architecture and comprehensive documentation.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-5xl"
              >
                <h2 className="text-3xl font-bold mb-8 text-slate-900">Core Features (Projects)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {(Array.isArray(data.projects) ? data.projects : []).map((proj, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                      <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-200 relative overflow-hidden">
                         <div className="absolute inset-0 z-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] bg-size-[16px_16px]"></div>
                         <h3 className="text-2xl font-black text-slate-300 relative z-10">{proj.name}</h3>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-xl font-bold mb-3 text-slate-800">{proj.name}</h3>
                        <p className="text-slate-600 mb-6 flex-1 text-sm leading-relaxed">{proj.description}</p>
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mt-auto">
                          {(Array.isArray(proj.techStack) ? proj.techStack : []).map((tech, j) => (
                            <span key={j} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'integrations' && (
              <motion.div
                key="integrations"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <h2 className="text-3xl font-bold mb-4 text-slate-900">Tech Stack & Integrations</h2>
                <p className="text-slate-600 mb-8">Seamlessly integrating with the modern development ecosystem.</p>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(Array.isArray(data.skills) ? data.skills : []).map((skill, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-slate-700 text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-12 bg-blue-600 rounded-xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-lg">
                   <div>
                     <h3 className="text-2xl font-bold mb-2">Ready to deploy?</h3>
                     <p className="text-blue-100 text-sm">Review my GitHub or connect on LinkedIn.</p>
                   </div>
                   <div className="flex gap-4 mt-6 md:mt-0">
                     {data.contact?.github && (
                       <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-md shadow-sm hover:bg-blue-50 transition-colors text-sm">
                         View GitHub
                       </a>
                     )}
                     {data.contact?.linkedin && (
                       <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-blue-700 text-white font-bold rounded-md shadow-inner hover:bg-blue-800 transition-colors text-sm border border-blue-500">
                         LinkedIn Profile
                       </a>
                     )}
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
