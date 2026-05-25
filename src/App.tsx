import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Settings2, Download, Type, Edit, FileText } from 'lucide-react';
import { defaultSettings, defaultMarkdown, fontOptions, StyleSettings } from './types';

import 'github-markdown-css/github-markdown-light.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

export default function App() {
  const [markdown, setMarkdown] = useState(() => {
    const saved = localStorage.getItem('docuforge_markdown');
    return saved !== null ? saved : defaultMarkdown;
  });
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);

  useEffect(() => {
    localStorage.setItem('docuforge_markdown', markdown);
  }, [markdown]);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!previewRef.current) return;
    if (isSyncingLeftScroll.current) {
        isSyncingLeftScroll.current = false;
        return;
    }
    isSyncingRightScroll.current = true;
    const target = e.currentTarget;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    if (!isNaN(percentage) && target.scrollHeight > target.clientHeight) {
        previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
    }
  };

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!editorRef.current) return;
    if (isSyncingRightScroll.current) {
        isSyncingRightScroll.current = false;
        return;
    }
    isSyncingLeftScroll.current = true;
    const target = e.currentTarget;
    const percentage = target.scrollTop / (target.scrollHeight - target.clientHeight);
    if (!isNaN(percentage) && target.scrollHeight > target.clientHeight) {
        editorRef.current.scrollTop = percentage * (editorRef.current.scrollHeight - editorRef.current.clientHeight);
    }
  };

  const [isExporting, setIsExporting] = useState(false);

  const handlePrint = async () => {
    if (!previewRef.current) return;
    try {
      setIsExporting(true);
      
      const cssVariablesString = `
        --font-family: ${settings.fontFamily};
        --font-size: ${settings.fontSize}px;
        --line-height: ${settings.lineHeight};
        --p-spacing: ${settings.paragraphSpacing};
        --text-color: ${settings.textColor};
        --heading-color: ${settings.headingColor};
        --bg-color: ${settings.backgroundColor};
        --accent-color: ${settings.accentColor};
      `;

      // We get the innerHTML of the preview to send to backend
      const markdownContainer = previewRef.current.querySelector('.markdown-body');
      if (!markdownContainer) return;

      const html = markdownContainer.innerHTML;

      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html, cssVariablesString })
      });
      
      if (!res.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const cssVariables = {
    '--font-family': settings.fontFamily,
    '--font-size': `${settings.fontSize}px`,
    '--line-height': settings.lineHeight,
    '--p-spacing': settings.paragraphSpacing,
    '--text-color': settings.textColor,
    '--heading-color': settings.headingColor,
    '--bg-color': settings.backgroundColor,
    '--accent-color': settings.accentColor,
  } as React.CSSProperties;

  return (
    <div className="w-full h-screen flex overflow-hidden bg-white font-sans text-gray-900 print:block print:h-auto print:overflow-visible print:bg-white">
      
      {/* Dark Sidebar (hidden on print) */}
      <div className="w-16 md:w-[240px] bg-[#22272e] text-slate-300 flex-col hidden sm:flex shrink-0 print:hidden border-r border-[#30363d]">
        <div className="h-16 flex items-center px-4 border-b border-[#30363d]">
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            M
          </div>
          <span className="ml-3 font-semibold text-white hidden md:block tracking-wide">New document</span>
          <div className="ml-auto hidden md:flex text-slate-400 hover:text-white cursor-pointer">
            <Edit size={16} />
          </div>
        </div>
        <div className="flex-1 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 hidden md:block">Documents</p>
          <div className="md:hidden flex justify-center text-slate-500">
            <FileText size={20} />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white shrink-0 print:hidden z-10">
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
               <span className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Document Name</span>
               <span className="text-gray-900 font-medium leading-none text-sm md:text-base">Markdown to PDF</span>
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md transition-colors ${showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
              title="Style Settings"
            >
              <Settings2 size={18} />
            </button>
            <button 
              onClick={handlePrint}
              disabled={isExporting}
              className={`flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors text-xs md:text-sm font-medium shadow-sm ${
                isExporting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'bg-[#24292f] hover:bg-black text-white'
              }`}
            >
              <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
              <span className="hidden md:inline">{isExporting ? 'Generating...' : 'Download'}</span>
            </button>
          </div>
        </div>

        {/* Settings Panel (Collapsible) */}
        {showSettings && (
          <div className="border-b border-gray-200 bg-gray-50 p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm animate-in slide-in-from-top-2 print:hidden z-0">
            <div className="space-y-1">
              <label className="text-gray-600 font-medium flex items-center gap-1"><Type size={14}/> Font Family</label>
              <select 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={settings.fontFamily}
                onChange={e => setSettings({...settings, fontFamily: e.target.value})}
              >
                {fontOptions.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-gray-600 font-medium">Base Size (px)</label>
              <input 
                type="number" 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={settings.fontSize}
                onChange={e => setSettings({...settings, fontSize: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-gray-600 font-medium">Line Height</label>
              <input 
                type="number" step="0.1" 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                value={settings.lineHeight}
                onChange={e => setSettings({...settings, lineHeight: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-600 font-medium">Text Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5 aspect-square"
                  value={settings.textColor}
                  onChange={e => setSettings({...settings, textColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 p-1.5 border border-gray-300 rounded bg-white shadow-sm font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  value={settings.textColor}
                  onChange={e => setSettings({...settings, textColor: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Editor and Preview Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden print:block print:h-auto print:overflow-visible">
          
          {/* Editor Pane */}
          <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col print:hidden border-b md:border-b-0 md:border-r border-gray-200">
            <textarea
              ref={editorRef}
              onScroll={handleEditorScroll}
              className="flex-1 w-full bg-white text-gray-800 p-6 font-mono text-[13px] leading-relaxed resize-none focus:outline-none overflow-y-auto"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              spellCheck={false}
              placeholder="Type your markdown here..."
            />
          </div>

          {/* Preview Pane */}
          <div 
            ref={previewRef}
            onScroll={handlePreviewScroll}
            className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto flex print:w-full print:block print:h-auto print:overflow-visible bg-white print:bg-white"
            style={cssVariables}
          >
            <div className="w-full h-fit max-w-[900px] p-6 md:p-10 lg:p-12 print:p-0 markdown-body print:block mx-auto">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
