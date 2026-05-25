import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Settings2, Download, Type, Edit, FileText, Trash2 } from 'lucide-react';
import { defaultSettings, defaultMarkdown, fontOptions, StyleSettings, Document } from './types';

import 'github-markdown-css/github-markdown-light.css';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github.css';

export default function App() {
  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem('docuforge_docs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [{
      id: 'default',
      name: 'Markdown to PDF',
      content: (() => {
        const legacy = localStorage.getItem('docuforge_markdown');
        return legacy !== null ? legacy : defaultMarkdown;
      })(),
      updatedAt: Date.now()
    }];
  });

  const [currentDocId, setCurrentDocId] = useState<string>(() => {
    return localStorage.getItem('docuforge_current_doc') || 'default';
  });

  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  const activeDoc = documents.find(d => d.id === currentDocId) || documents[0];

  const [settings, setSettings] = useState<StyleSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const isSyncingLeftScroll = useRef(false);
  const isSyncingRightScroll = useRef(false);

  useEffect(() => {
    localStorage.setItem('docuforge_docs', JSON.stringify(documents));
    localStorage.setItem('docuforge_current_doc', activeDoc.id);
  }, [documents, activeDoc.id]);

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

  const handlePrint = () => {
    window.print();
  };

  const handleNewDoc = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name: 'Untitled Document',
      content: '',
      updatedAt: Date.now()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentDocId(newDoc.id);
  };

  const startEditingDoc = (doc: Document, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDocId(doc.id);
    setEditingName(doc.name);
  };

  const submitDocRename = (id: string) => {
    if (editingName.trim()) {
      setDocuments(docs => docs.map(d => d.id === id ? { ...d, name: editingName.trim(), updatedAt: Date.now() } : d));
    }
    setEditingDocId(null);
  };

  const handleDeleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (documents.length === 1) {
       const resetDoc = { ...documents[0], content: '', name: 'Untitled Document' };
       setDocuments([resetDoc]);
       return;
    }
    const newDocs = documents.filter(d => d.id !== id);
    setDocuments(newDocs);
    if (currentDocId === id) {
       setCurrentDocId(newDocs[0].id);
    }
  };

  const updateActiveDocName = (newName: string) => {
    setDocuments(docs => docs.map(d => d.id === activeDoc.id ? { ...d, name: newName, updatedAt: Date.now() } : d));
  };
  
  const handleMarkdownChange = (newContent: string) => {
    setDocuments(docs => docs.map(d => d.id === activeDoc.id ? { ...d, content: newContent, updatedAt: Date.now() } : d));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handlePrint();
        } else if (e.shiftKey && (e.key === 'n' || e.key === 'N')) {
          e.preventDefault();
          handleNewDoc();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <div 
          className="h-16 flex items-center px-4 border-b border-[#30363d] cursor-pointer hover:bg-[#2d333b] transition-colors group"
          onClick={handleNewDoc}
          title="New document (Ctrl+Shift+N)"
        >
          <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
            M
          </div>
          <span className="ml-3 font-semibold text-white hidden md:block tracking-wide">New document</span>
          <div 
            className="ml-auto hidden md:flex text-slate-400 group-hover:text-white"
          >
            <Edit size={16} />
          </div>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 hidden md:block">Documents</p>
          <div className="space-y-1 hidden md:block">
            {documents.map(doc => (
              <div 
                key={doc.id}
                onClick={() => setCurrentDocId(doc.id)}
                className={`p-2 rounded cursor-pointer text-sm flex items-center justify-between group ${activeDoc.id === doc.id ? 'bg-[#2d333b] text-white border border-[#444c56]' : 'text-slate-400 hover:bg-[#2d333b] hover:text-white border border-transparent'}`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  <FileText size={14} className="shrink-0" />
                  {editingDocId === doc.id ? (
                    <input
                      autoFocus
                      className="bg-slate-700 text-white px-1 border border-emerald-500 rounded outline-none w-full text-xs"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      onBlur={() => submitDocRename(doc.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') submitDocRename(doc.id);
                      }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="truncate"
                      onDoubleClick={(e) => startEditingDoc(doc, e)}
                    >
                      {doc.name}
                    </span>
                  )}
                </div>
                {editingDocId !== doc.id && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0">
                    <button 
                      onClick={(e) => startEditingDoc(doc, e)}
                      className="hover:text-emerald-400 text-slate-500 p-1 outline-none transition-colors"
                      title="Rename document"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteDoc(doc.id, e)}
                      className="hover:text-red-400 text-slate-500 p-1 outline-none transition-colors"
                      title="Delete document"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden flex flex-col items-center gap-4 text-slate-500 mt-4">
            {documents.map(doc => (
              <div key={doc.id} onClick={() => setCurrentDocId(doc.id)} className={`cursor-pointer ${activeDoc.id === doc.id ? 'text-white' : 'hover:text-white'}`}>
                <FileText size={20} title={doc.name} />
              </div>
            ))}
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
               <input 
                 className="text-gray-900 font-medium leading-none text-sm md:text-base border-none p-0 focus:ring-0 bg-transparent outline-none m-0"
                 value={activeDoc.name}
                 onChange={(e) => updateActiveDocName(e.target.value)}
                 placeholder="Untitled Document"
                 title="Rename document"
               />
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
              className="flex items-center gap-2 bg-[#24292f] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-md hover:bg-black transition-colors text-xs md:text-sm font-medium shadow-sm"
            >
              <Download size={14} />
              <span className="hidden md:inline">Download</span>
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
              value={activeDoc.content}
              onChange={(e) => handleMarkdownChange(e.target.value)}
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
                {activeDoc.content}
              </ReactMarkdown>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
