import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RuleResultsView({ diagnosis }) {
  if (!diagnosis) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-slate-200">Deterministic Rule Engine Verdict</h3>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
          PASS (DETERMINISTIC)
        </span>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span className="font-semibold text-slate-400">Analysis Rule Engine:</span>
          <span className="font-mono text-cyan-400">Active Cisco IOS Rule Checker</span>
        </div>
        <div className="text-slate-300">
          <span className="font-semibold text-slate-400">Observed Protocol Evidence:</span>
          <ul className="mt-1 list-disc list-inside text-slate-300 space-y-1 font-mono text-[11px]">
            {(diagnosis.evidence || []).map((ev, idx) => (
              <li key={idx} className="text-slate-300">{ev}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
