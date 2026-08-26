import React, { useState } from 'react';
import { AlertCircle, Network, Terminal, Server, Laptop, Cpu } from 'lucide-react';
import { SeverityBadge } from '../common/StatusBadge';

export default function CaseDetailPanel({ caseData, evidenceData }) {
  const [activeFile, setActiveFile] = useState('');

  if (!caseData) {
    return <div className="p-8 text-center text-slate-400 font-sans text-xs">Select a troubleshooting case...</div>;
  }

  const files = evidenceData?.files || {};
  const filenames = Object.keys(files);
  const currentFileName = activeFile && files[activeFile] ? activeFile : (filenames.length > 0 ? filenames[0] : 'case_legacy.txt');
  const rawContent = files[currentFileName] || evidenceData?.evidence_text || 'Evidence unavailable for this case.';
  const currentContent = typeof rawContent === 'object' ? JSON.stringify(rawContent, null, 2) : String(rawContent);

  const topoNodes = (caseData.topology || 'PC1 -> SW1 -> R1').split(/->|-/).map((n) => n.trim()).filter(Boolean);

  return (
    <div className="space-y-4">
      {/* Case Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {caseData.case_id}
            </span>
            <h2 className="text-base font-bold text-slate-900">{caseData.title}</h2>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
              {caseData.osi_layer}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200">
              {caseData.concept}
            </span>
            <SeverityBadge severity={caseData.severity} />
          </div>
        </div>

        {/* Reported Symptom */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-1">
          <div className="flex items-center space-x-2 text-rose-700 text-[11px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>REPORTED SYMPTOM</span>
          </div>
          <p className="text-xs text-rose-950 font-medium">{caseData.symptom}</p>
        </div>

        {/* Network Topology Visualizer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            <div className="flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-blue-600" />
              <span>NETWORK TOPOLOGY</span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal">{caseData.topology}</span>
          </div>

          {/* Graphical Node Flow */}
          <div className="flex items-center justify-center space-x-2 py-2 overflow-x-auto">
            {topoNodes.slice(0, 5).map((node, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center p-2 rounded-lg bg-white border border-slate-200 shrink-0 min-w-[70px] shadow-2xs">
                  {node.toLowerCase().includes('pc') || node.toLowerCase().includes('laptop') ? (
                    <Laptop className="w-4 h-4 text-blue-600 mb-1" />
                  ) : node.toLowerCase().includes('sw') || node.toLowerCase().includes('switch') ? (
                    <Server className="w-4 h-4 text-emerald-600 mb-1" />
                  ) : (
                    <Cpu className="w-4 h-4 text-purple-600 mb-1" />
                  )}
                  <span className="text-[10px] font-mono text-slate-800 font-bold truncate max-w-[80px]">{node}</span>
                </div>
                {idx < topoNodes.slice(0, 5).length - 1 && (
                  <span className="text-slate-400 font-mono text-xs font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence Viewer */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans">
              Packet Tracer Evidence Viewer
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {filenames.length} file(s) available
          </span>
        </div>

        {/* Tab Buttons */}
        {filenames.length > 0 && (
          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {filenames.map((fname) => (
              <button
                key={fname}
                onClick={() => setActiveFile(fname)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap ${
                  currentFileName === fname
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                {fname}
              </button>
            ))}
          </div>
        )}

        {/* Terminal Text Viewer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 h-[240px] overflow-y-auto font-mono text-xs text-cyan-300 leading-relaxed shadow-inner">
          {currentContent ? (
            <pre className="whitespace-pre-wrap font-mono text-[11px]">{currentContent}</pre>
          ) : (
            <div className="p-8 text-center text-slate-500">
              Evidence unavailable
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
