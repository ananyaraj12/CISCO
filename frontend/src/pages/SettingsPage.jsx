import React, { useState } from 'react';
import { Cpu, Server, Save } from 'lucide-react';

export default function SettingsPage({ isBackendOnline, onRetryConnection }) {
  const [threshold, setThreshold] = useState(85);
  const [enforceReview, setEnforceReview] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">System Settings & Diagnostic Configuration</h2>
        <p className="text-xs text-slate-500">
          Manage AI diagnostic confidence thresholds, compliance mandates, and backend connections
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* System Health Status Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Core Infrastructure Status</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">BACKEND FASTAPI</span>
              <div className="flex items-center space-x-2 font-bold">
                <span className={`w-2.5 h-2.5 rounded-full ${isBackendOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className={isBackendOnline ? 'text-emerald-700' : 'text-rose-700'}>
                  {isBackendOnline ? 'Operational' : 'Offline'}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">http://127.0.0.1:8000</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">AI DIAGNOSTIC ENGINE</span>
              <div className="flex items-center space-x-2 font-bold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Active</span>
              </div>
              <div className="text-[10px] text-slate-500">Rule + Prompt Pipeline</div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">EVIDENCE DATASET</span>
              <div className="flex items-center space-x-2 font-bold text-blue-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>30 Cases Loaded</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">NET-001 to NET-030</div>
            </div>
          </div>
        </div>

        {/* Diagnostic Thresholds */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-600" />
            <span>AI Diagnostic Engine Controls</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <label className="font-bold text-slate-800">Minimum AI Confidence Score Trigger</label>
                <span className="font-mono font-bold text-blue-700">{threshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Diagnoses below this score will be flagged for mandatory extended human review.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Enforce Mandatory Human Review</div>
                <div className="text-[11px] text-slate-500">
                  Block automatic execution of network configuration commands at all times.
                </div>
              </div>
              <input
                type="checkbox"
                checked={enforceReview}
                onChange={(e) => setEnforceReview(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end space-x-3">
          {saved && <span className="text-xs font-mono text-emerald-600 font-bold">Settings Saved Successfully!</span>}
          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
