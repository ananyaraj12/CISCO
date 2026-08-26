import React, { useState } from 'react';
import { Search, Filter, Layers, Server, Activity } from 'lucide-react';

export default function CaseBrowser({ cases, selectedCaseId, onSelectCase }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.concept.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || c.severity.toUpperCase() === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col h-[750px]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-semibold text-slate-200">Troubleshooting Cases</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
          {filteredCases.length} / {cases.length}
        </span>
      </div>

      {/* Search & Filter bar */}
      <div className="my-4 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search NET-XXX, VLAN, NAT, DHCP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Filter Severity:</span>
          <div className="flex space-x-1">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                  severityFilter === sev
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case List Scrollable Area */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredCases.map((c) => {
          const isSelected = c.case_id === selectedCaseId;
          const sevColor =
            c.severity.toLowerCase() === 'high'
              ? 'bg-rose-950/60 text-rose-400 border-rose-800'
              : c.severity.toLowerCase() === 'medium'
              ? 'bg-amber-950/60 text-amber-400 border-amber-800'
              : 'bg-emerald-950/60 text-emerald-400 border-emerald-800';

          return (
            <div
              key={c.case_id}
              onClick={() => onSelectCase(c.case_id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 border-cyan-500 ring-1 ring-cyan-500/50 shadow-md'
                  : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {c.case_id}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${sevColor}`}>
                  {c.severity}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{c.title}</h3>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[140px]">{c.concept}</span>
                <span className="font-mono text-[10px] text-slate-500">{c.osi_layer}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
