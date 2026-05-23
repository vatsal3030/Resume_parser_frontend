import React from 'react';

export default function DeveloperTemplate({ data }) {
  if (!data) return null;
  return (
    <div className="font-mono text-green-400 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-2xl">
      {/* Fake window header */}
      <div className="flex items-center px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto text-xs text-gray-400 font-sans">~/portfolio/index.js</div>
      </div>

      <div className="p-6 md:p-8 overflow-x-auto">
        <div className="text-gray-500 mb-6">
          {"// Welcome to my portfolio"}<br/>
          {"// Run `npm start` to hire me"}
        </div>

        <div className="mb-8">
          <span className="text-pink-500">const</span> <span className="text-blue-400">developer</span> <span className="text-pink-500">=</span> {'{'}
          <div className="pl-6 py-2 border-l border-gray-800 ml-2">
            <span className="text-yellow-300">name</span>: <span className="text-green-300">&quot;{data.header?.name || 'Developer'}&quot;</span>,<br/>
            <span className="text-yellow-300">role</span>: <span className="text-green-300">&quot;{data.header?.title || 'Software Engineer'}&quot;</span>,<br/>
            <span className="text-yellow-300">tagline</span>: <span className="text-green-300">&quot;{data.header?.tagline}&quot;</span>,<br/>
            <span className="text-yellow-300">about</span>: <span className="text-green-300">&quot;{data.about?.replace(/\n/g, ' ')}&quot;</span>
          </div>
          {'}'};
        </div>

        <div className="mb-8">
          <span className="text-pink-500">const</span> <span className="text-blue-400">skills</span> <span className="text-pink-500">=</span> {'['}
          <div className="pl-6 py-2 border-l border-gray-800 ml-2 text-green-300 flex flex-wrap gap-2">
            {(Array.isArray(data.skills) ? data.skills : []).map((skill, i) => (
              <span key={i}>&quot;{skill}&quot;{i < (Array.isArray(data.skills) ? data.skills.length : 0) - 1 ? ',' : ''}</span>
            ))}
          </div>
          {']'};
        </div>

        <div className="mb-8">
          <span className="text-pink-500">const</span> <span className="text-blue-400">projects</span> <span className="text-pink-500">=</span> {'['}
          <div className="pl-6 py-2 border-l border-gray-800 ml-2 space-y-4">
            {(Array.isArray(data.projects) ? data.projects : []).map((proj, i) => (
              <div key={i}>
                {'{'}<br/>
                <span className="pl-4 text-yellow-300">name</span>: <span className="text-green-300">&quot;{proj.name}&quot;</span>,<br/>
                <span className="pl-4 text-yellow-300">desc</span>: <span className="text-green-300">&quot;{proj.description}&quot;</span>,<br/>
                <span className="pl-4 text-yellow-300">tech</span>: [{(Array.isArray(proj.techStack) ? proj.techStack : []).map(t => `"${t}"`).join(', ')}]<br/>
                {'}'}{i < (Array.isArray(data.projects) ? data.projects.length : 0) - 1 ? ',' : ''}
              </div>
            ))}
          </div>
          {']'};
        </div>

        <div className="mb-4">
          <span className="text-pink-500">export default class</span> <span className="text-yellow-400">Contact</span> {'{'}
          <div className="pl-6 py-2 border-l border-gray-800 ml-2 space-y-2">
            <span className="text-blue-400">connect</span>() {'{'}
            <div className="pl-4">
              <span className="text-pink-500">return</span> {'{'}
              <div className="pl-4">
                {data.contact?.email && <><span className="text-yellow-300">email</span>: <a href={`mailto:${data.contact.email}`} className="text-green-300 hover:underline">&quot;{data.contact.email}&quot;</a>,<br/></>}
                {data.contact?.linkedin && <><span className="text-yellow-300">linkedin</span>: <a href={data.contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">&quot;{data.contact.linkedin}&quot;</a>,<br/></>}
                {data.contact?.github && <><span className="text-yellow-300">github</span>: <a href={data.contact.github} target="_blank" rel="noopener noreferrer" className="text-green-300 hover:underline">&quot;{data.contact.github}&quot;</a><br/></>}
              </div>
              {'}'}
            </div>
            {'}'}
          </div>
          {'}'}
        </div>
        
        <div className="mt-8 animate-pulse text-gray-500">
          $ <span className="w-2 h-4 bg-gray-500 inline-block align-middle ml-1"></span>
        </div>
      </div>
    </div>
  );
}
