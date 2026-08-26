import React from 'react';
import { Cpu, RefreshCw, ShieldCheck } from 'lucide-react';
import AIDiagnosisPanel from '../components/workspace/AIDiagnosisPanel';

export default function DiagnosisPage({
  cases,
  selectedCaseId,
  onSelectCase,
  diagnosis,
  onOpenReviewModal,
  reviewState,
  isDiagnosing,
  onRunDiagnosis
}) {
  const selectedCase = cases.find((c) => c.case_id?.toUpperCase() === selectedCaseId?.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">AI Diagnostic Engine Studio</h2>
          <p className="text-xs text-slate-500">
            Generate, re-evaluate, and audit AI diagnostic hypotheses against deterministic Cisco IOS rules
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCaseId}
            onChange={(e) => onSelectCase(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-blue-700 font-bold focus:outline-none shadow-xs"
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id}>
                {c.case_id} — {c.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => onRunDiagnosis(selectedCaseId)}
            disabled={isDiagnosing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
            <span>{isDiagnosing ? 'Diagnosing...' : 'Re-Run AI Diagnosis'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Prompt & Rule Specs, Right Diagnosis Output Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Studio Panel */}
        <div className="lg:col-span-5 space-y-4">
          {/* Prompt Architecture Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Diagnostic System Prompt Architecture</span>
            </h3>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 space-y-2">
              <div className="text-blue-700 font-bold">prompts/diagnose_prompt.md</div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                Role: Senior Cisco Certified Internetwork Expert (CCIE). Analyze Packet Tracer command outputs, symptom statement, and rule triggers. Produce structured JSON response.
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Domain Prompt: prompts/templates/{diagnosis?.concept?.toLowerCase() || 'vlan'}.txt</span>
                <span className="text-emerald-600 font-bold">JSON Schema Enforced</span>
              </div>
            </div>
          </div>

          {/* Safety Verification Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>RESPONSIBLE AI SAFETY VERIFICATION</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diagnostic outputs require explicit human sign-off before configuration changes can be stored or reviewed.
            </p>
          </div>
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-7">
          <AIDiagnosisPanel
            diagnosis={diagnosis}
            selectedCase={selectedCase}
            onOpenReviewModal={onOpenReviewModal}
            reviewState={reviewState}
            isDiagnosing={isDiagnosing}
            onRunDiagnosis={onRunDiagnosis}
          />
        </div>
      </div>
    </div>
  );
}
