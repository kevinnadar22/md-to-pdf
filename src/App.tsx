import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import { Settings2, Download, Maximize2, Type, PaintBucket, LayoutTemplate } from 'lucide-react';
import { defaultSettings, defaultMarkdown, fontOptions, StyleSettings } from './types';

import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark-dimmed.css';

export default function App() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  const handlePrint = () => {
    window.print();
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
    <div className="w-full h-screen flex flex-col md:flex-row overflow-hidden print:h-auto print:overflow-visible print:block print:bg-white bg-gray-50 font-sans text-gray-900">
      
      {/* Editor Pane */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col border-b md:border-b-0 md:border-r border-gray-200 bg-white print:hidden z-10">
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/80 backdrop-blur">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold tracking-tight">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded flex items-center justify-center text-white text-base font-bold select-none">
              M
            </div>
            <span>md to pdf</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-md hover:bg-gray-200 transition-colors ${showSettings ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600'}`}
              title="Style Settings"
            >
              <Settings2 size={18} />
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <Download size={16} />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* Settings Panel (Collapsible) */}
        {showSettings && (
          <div className="border-b border-gray-200 bg-gray-50 p-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <label className="text-gray-500 font-medium flex items-center gap-1"><Type size={14}/> Font Family</label>
              <select 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                value={settings.fontFamily}
                onChange={e => setSettings({...settings, fontFamily: e.target.value})}
              >
                {fontOptions.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Base Size (px)</label>
              <input 
                type="number" 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                value={settings.fontSize}
                onChange={e => setSettings({...settings, fontSize: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Line Height</label>
              <input 
                type="number" step="0.1" 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                value={settings.lineHeight}
                onChange={e => setSettings({...settings, lineHeight: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Paragraph Spacing</label>
              <input 
                type="number" step="0.1" 
                className="w-full p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                value={settings.paragraphSpacing}
                onChange={e => setSettings({...settings, paragraphSpacing: Number(e.target.value)})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Text Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5"
                  value={settings.textColor}
                  onChange={e => setSettings({...settings, textColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                  value={settings.textColor}
                  onChange={e => setSettings({...settings, textColor: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Heading Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5"
                  value={settings.headingColor}
                  onChange={e => setSettings({...settings, headingColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                  value={settings.headingColor}
                  onChange={e => setSettings({...settings, headingColor: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-medium flex items-center gap-1">Page Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5"
                  value={settings.backgroundColor}
                  onChange={e => setSettings({...settings, backgroundColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                  value={settings.backgroundColor}
                  onChange={e => setSettings({...settings, backgroundColor: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 font-medium">Accent Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 p-0.5"
                  value={settings.accentColor}
                  onChange={e => setSettings({...settings, accentColor: e.target.value})}
                />
                <input 
                  type="text" 
                  className="flex-1 p-1.5 border border-gray-300 rounded bg-white shadow-sm"
                  value={settings.accentColor}
                  onChange={e => setSettings({...settings, accentColor: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Area */}
        <textarea
          className="flex-1 w-full bg-slate-900 text-slate-100 p-4 font-mono text-sm resize-none focus:outline-none"
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          spellCheck={false}
          placeholder="Type your markdown here..."
        />
      </div>

      {/* Preview Pane */}
      <div 
        className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto flex print:w-full print:block print:h-auto print:overflow-visible print:border-none print:bg-white border-l border-gray-200"
        style={cssVariables}
      >
        <div className="w-full h-fit max-w-[210mm] print:max-w-none mx-auto print:mx-0 p-8 md:p-12 lg:p-16 print:p-0 markdown-preview print:block">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
          >
            {markdown}
          </ReactMarkdown>
        </div>
      </div>
      
    </div>
  );
}
