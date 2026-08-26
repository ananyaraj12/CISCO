import React from 'react';
import { ShieldCheck, CheckCircle2, Edit3, XCircle, BarChart3, Layers } from 'lucide-react';

export default function AnalyticsOverview({ analytics }) {
  if (!analytics) return <div className="p-8 text-center text-slate-400">Loading analytics data...</div>;

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Cases</span>
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{analytics.total_cases || 30}</span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-mono">
              NET-001 - NET-030
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Human-AI Agreement</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-600 font-sans">
              {analytics.human_ai_agreement_rate || 100}%
            </span>
            <span className="text-xs text-slate-400 font-medium">Evaluated</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Avg AI Confidence</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-blue-600 font-sans">
              {((analytics.average_ai_confidence || 0.95) * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
              Composite Score
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Human Reviews</span>
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{analytics.total_reviews || 0}</span>
            <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-medium">
              Audited
            </span>
          </div>
        </div>
      </div>

      {/* Decision Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-emerald-600 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <h3>AI Diagnoses Accepted</h3>
          </div>
          <p className="text-xs text-slate-500">
            Cases where human reviewer verified and accepted the AI root cause diagnosis without modification.
          </p>
          <div className="text-3xl font-extrabold text-emerald-600 font-sans">
            {analytics.ai_accepted || 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-amber-600 font-bold">
            <Edit3 className="w-5 h-5" />
            <h3>AI Diagnoses Edited</h3>
          </div>
          <p className="text-xs text-slate-500">
            Cases where human reviewer refined or corrected the AI root cause or CLI fix.
          </p>
          <div className="text-3xl font-extrabold text-amber-600 font-sans">
            {analytics.ai_edited || 0}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-rose-600 font-bold">
            <XCircle className="w-5 h-5" />
            <h3>AI Diagnoses Rejected</h3>
          </div>
          <p className="text-xs text-slate-500">
            Cases where AI diagnosis was rejected due to inaccuracy or inadequate evidence.
          </p>
          <div className="text-3xl font-extrabold text-rose-600 font-sans">
            {analytics.ai_rejected || 0}
          </div>
        </div>
      </div>

      {/* Cases by OSI Layer & Severity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Cases by OSI Layer</h3>
          <div className="space-y-3">
            {Object.entries(analytics.cases_by_osi_layer || {}).map(([layer, count]) => (
              <div key={layer} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{layer}</span>
                  <span className="font-mono text-slate-500">{count} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${(count / (analytics.total_cases || 30)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4">Cases by Severity</h3>
          <div className="space-y-3">
            {Object.entries(analytics.cases_by_severity || {}).map(([sev, count]) => (
              <div key={sev} className="space-y-1">
                <div className="flex justify-between text-xs font-medium text-slate-700">
                  <span>{sev}</span>
                  <span className="font-mono text-slate-500">{count} cases</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      sev.toLowerCase() === 'high' || sev.toLowerCase() === 'critical'
                        ? 'bg-rose-500'
                        : sev.toLowerCase() === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${(count / (analytics.total_cases || 30)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
