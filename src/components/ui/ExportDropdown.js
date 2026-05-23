import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Code, FileJson, Layout, Download, FileCode2, Terminal, FolderArchive } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { exportNextJsMultiPage } from '@/lib/export-generators';

export function ExportDropdown({ data, templateId }) {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = async (format) => {
    setIsOpen(false);
    try {
      if (format === 'NEXT_MULTIPAGE') {
        await exportNextJsMultiPage(data, templateId);
        toast.success('Exported multi-page .zip!');
        return;
      }

      let content = '';
      let filename = `portfolio-export`;
      let mimeType = 'text/plain';

      if (format === 'JSON') {
        content = JSON.stringify(data, null, 2);
        filename += '.json';
        mimeType = 'application/json';
      } else if (format === 'HTML') {
        content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <!-- Paste your chosen template here, or use prompt export for AI generation -->
  <div class="p-8 text-center">
    <h1 class="text-4xl font-bold">${data.header?.name || 'Your Name'}</h1>
    <p class="text-xl text-gray-600">${data.header?.title || 'Software Engineer'}</p>
  </div>
</body>
</html>`;
        filename += '.html';
        mimeType = 'text/html';
      } else if (format === 'REACT' || format === 'NEXT') {
        content = `import React from 'react';\n\nexport default function Portfolio() {\n  const data = ${JSON.stringify(data, null, 2)};\n\n  return (\n    <div>{/* Add template UI here */}</div>\n  );\n}`;
        filename += format === 'REACT' ? '.jsx' : '.tsx';
        mimeType = 'text/javascript';
      } else if (format === 'PROMPT') {
        content = `You are an expert Frontend Developer. Build a fully responsive, visually stunning portfolio website for me using React and Tailwind CSS.
Use the following style/theme: ${templateId}.

Here is the exact data you must use:
${JSON.stringify(data, null, 2)}

Provide the complete code in a single file if possible. Ensure it is accessible, semantic, and uses modern design principles.`;
        filename = 'ai-generation-prompt.txt';
      }

      // Trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported as ${format}`);
    } catch (e) {
      toast.error('Export failed');
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button 
        variant="outline" 
        onClick={() => setIsOpen(!isOpen)} 
        className="border-2 border-brutal-black font-bold gap-2 hover:bg-brutal-bg bg-white shadow-[2px_2px_0_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
      >
        <Download className="w-4 h-4" /> Export Options <ChevronDown className="w-4 h-4" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-brutal-black shadow-[4px_4px_0_#000] z-50 animate-in slide-in-from-top-2">
          <div className="flex flex-col">
            <button onClick={() => handleExport('JSON')} className="flex items-center gap-3 px-4 py-3 hover:bg-brutal-yellow transition-colors font-bold text-left border-b-2 border-brutal-black">
              <FileJson className="w-4 h-4" /> JSON Data
            </button>
            <button onClick={() => handleExport('PROMPT')} className="flex items-center gap-3 px-4 py-3 hover:bg-brutal-pink transition-colors font-bold text-left border-b-2 border-brutal-black">
              <Terminal className="w-4 h-4" /> AI Prompt
            </button>
            <button onClick={() => handleExport('REACT')} className="flex items-center gap-3 px-4 py-3 hover:bg-blue-100 transition-colors font-bold text-left border-b-2 border-brutal-black">
              <Code className="w-4 h-4" /> React (.jsx)
            </button>
            <button onClick={() => handleExport('NEXT')} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-200 transition-colors font-bold text-left border-b-2 border-brutal-black">
              <FileCode2 className="w-4 h-4" /> Next.js Single-Page (.tsx)
            </button>
            <button onClick={() => handleExport('NEXT_MULTIPAGE')} className="flex items-center gap-3 px-4 py-3 hover:bg-purple-100 transition-colors font-bold text-left border-b-2 border-brutal-black">
              <FolderArchive className="w-4 h-4" /> Next.js Multi-Page (.zip)
            </button>
            <button onClick={() => handleExport('HTML')} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-100 transition-colors font-bold text-left">
              <Layout className="w-4 h-4" /> HTML Bundle
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
