import React from 'react';
import { Cpu, CheckCircle, Edit3, XCircle, Terminal, Wrench, ShieldAlert } from 'lucide-react';

export default function AIDiagnosisCard({ diagnosis, onOpenReviewModal }) {
  if (!diagnosis) return <div className="p-6 text-center text-slate-400">Select a case to generate AI Diagnosis</div>;

  const confPercent = Math.round((diagnosis.confidence || 0.90) * 100);

  return (
    <div className="bg-slate-900/90 border border-cyan-900/60 rounded-2xl p-6 shadow-xl space-y-5 ring-1 ring-cyan-500/20">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">AI Diagnostic Result</h3>
            <p className="text-xs text-slate-400">Case ID: {diagnosis.case_id}</p>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="text-right">
          <div className="text-xs text-slate-400 mb-1">AI Confidence Score</div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                style={{ width: `${confPercent}%` }}
              ></div>
            </div>
            <span className="font-mono text-sm font-extrabold text-cyan-400">
              {confPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Root Cause */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Identified Root Cause</span>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm font-semibold text-cyan-300">
          {diagnosis.root_cause}
        </div>
      </div>

      {/* Evidence */}
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Supporting Evidence</span>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-mono">
            {(diagnosis.evidence || []).map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Command & Expected Fix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Terminal className="w-4 h-4" />
            <span>Recommended Next Command</span>
          </div>
          <p className="text-xs font-mono text-white bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            {diagnosis.next_command}
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Wrench className="w-4 h-4" />
            <span>Expected CLI Fix</span>
          </div>
          <p className="text-xs font-mono text-white bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
            {diagnosis.expected_fix}
          </p>
        </div>
      </div>

      {/* Responsible AI Safety Warning */}
      <div className="flex items-center space-x-2 p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
        <span>
          <strong>SAFETY MANDATE:</strong> Configuration changes are NEVER automatically executed. Human review is required to accept, edit, or reject this diagnosis.
        </span>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-800">
        <button
          onClick={() => onOpenReviewModal('REJECTED')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-all shadow-md"
        >
          <XCircle className="w-4 h-4" />
          <span>REJECT</span>
        </button>

        <button
          onClick={() => onOpenReviewModal('EDITED')}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-800 text-amber-300 text-xs font-bold transition-all shadow-md"
        >
          <Edit3 className="w-4 h-4" />
          <span>EDIT</span>
        </button>

        <button
          onClick={() => onOpenReviewModal('ACCEPTED')}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/30"
        >
          <CheckCircle className="w-4 h-4" />
          <span>ACCEPT DIAGNOSIS</span>
        </button>
      </div>
    </div>
  );
}
