import React, { useState } from 'react';
import { Terminal, FileText, Code2 } from 'lucide-react';

export default function EvidenceViewer({ evidenceData }) {
  const [activeFile, setActiveFile] = useState('');

  if (!evidenceData) {
    return <div className="p-4 text-xs text-slate-500">Loading evidence...</div>;
  }

  const files = evidenceData.files || {};
  const filenames = Object.keys(files);
  const currentFileName = activeFile || (filenames.length > 0 ? filenames[0] : 'case_legacy.txt');
  const currentContent = files[currentFileName] || evidenceData.evidence_text || '';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">Packet Tracer Evidence Viewer</h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {filenames.length} file(s) available
        </span>
      </div>

      {/* Tabs */}
      {filenames.length > 0 && (
        <div className="flex items-center space-x-1 overflow-x-auto pb-1">
          {filenames.map((fname) => (
            <button
              key={fname}
              onClick={() => setActiveFile(fname)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                currentFileName === fname
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              {fname}
            </button>
          ))}
        </div>
      )}

      {/* Text Output Terminal View */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto h-[240px]">
        <pre className="text-xs font-mono text-cyan-300/90 leading-relaxed whitespace-pre-wrap">
          {currentContent}
        </pre>
      </div>
    </div>
  );
}
