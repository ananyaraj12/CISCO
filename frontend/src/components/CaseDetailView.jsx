import React from 'react';
import { AlertCircle, Network, Shield, Cpu } from 'lucide-react';

export default function CaseDetailView({ caseData }) {
  if (!caseData) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-mono font-extrabold px-3 py-1 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
              {caseData.case_id}
            </span>
            <h2 className="text-lg font-bold text-white">{caseData.title}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {caseData.osi_layer}
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300 border border-slate-700">
            {caseData.concept}
          </span>
        </div>
      </div>

      {/* Symptom Card */}
      <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 space-y-1">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Reported Symptom</span>
        </div>
        <p className="text-sm text-slate-200">{caseData.symptom}</p>
      </div>

      {/* Topology Path */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-1">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Network className="w-4 h-4" />
          <span>Network Topology</span>
        </div>
        <p className="text-xs font-mono text-slate-300">{caseData.topology}</p>
      </div>
    </div>
  );
}
