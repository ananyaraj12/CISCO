import React, { useState } from 'react';
import { Search, Layers } from 'lucide-react';
import { SeverityBadge } from '../common/StatusBadge';

export default function CaseListPanel({ cases, selectedCaseId, onSelectCase, searchQuery, setSearchQuery }) {
  const [conceptFilter, setConceptFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const concepts = ['ALL', 'VLAN', 'Trunking', 'Routing', 'DHCP', 'DNS', 'ACL', 'NAT', 'Wireless'];

  const filteredCases = cases.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.case_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.concept.toLowerCase().includes(q) ||
      c.symptom.toLowerCase().includes(q);

    const matchesConcept =
      conceptFilter === 'ALL' || c.concept.toUpperCase() === conceptFilter.toUpperCase();

    const matchesSeverity =
      severityFilter === 'ALL' || c.severity.toUpperCase() === severityFilter.toUpperCase();

    return matchesSearch && matchesConcept && matchesSeverity;
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col h-[760px] min-w-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 shrink-0">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">Troubleshooting Cases</h2>
        </div>
        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono font-medium border border-slate-200">
          {filteredCases.length} / {cases.length}
        </span>
      </div>

      {/* Search Input */}
      <div className="mt-3 relative shrink-0">
        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search NET-XXX, VLAN, NAT..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 font-sans"
        />
      </div>

      {/* Filters Bar */}
      <div className="my-3 space-y-2 shrink-0">
        {/* Concept Filter Dropdown */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium">Concept:</span>
          <select
            value={conceptFilter}
            onChange={(e) => setConceptFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-semibold focus:outline-none max-w-[140px]"
          >
            {concepts.map((conc) => (
              <option key={conc} value={conc}>{conc}</option>
            ))}
          </select>
        </div>

        {/* Severity Filter Buttons - Clean Grid */}
        <div className="space-y-1 text-xs text-slate-500">
          <span className="font-medium text-[11px]">Severity:</span>
          <div className="grid grid-cols-4 gap-1">
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                  severityFilter === sev
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Case Scroll List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 pt-1 min-h-0">
        {filteredCases.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-sans">
            No matching cases found
          </div>
        ) : (
          filteredCases.map((c) => {
            const isSelected = c.case_id === selectedCaseId;
            return (
              <div
                key={c.case_id}
                onClick={() => onSelectCase(c.case_id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 shadow-xs'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded border border-blue-200">
                    {c.case_id}
                  </span>
                  <SeverityBadge severity={c.severity} />
                </div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</h3>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-sans">
                  <span className="truncate max-w-[110px] font-medium text-slate-700">{c.concept}</span>
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 font-mono text-[10px]">{c.osi_layer}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
