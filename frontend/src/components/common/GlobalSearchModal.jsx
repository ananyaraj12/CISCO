import React, { useState, useEffect } from 'react';
import { Search, X, FolderGit2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';

export default function GlobalSearchModal({ isOpen, onClose, cases = [], onSelectCase, onNavigate }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open search modal
          onClose(); // toggle logic from parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCases = cases.filter((c) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      c.case_id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.concept.toLowerCase().includes(q) ||
      c.symptom.toLowerCase().includes(q) ||
      c.osi_layer.toLowerCase().includes(q)
    );
  });

  const handleResultClick = (caseId) => {
    if (onSelectCase) onSelectCase(caseId);
    if (onNavigate) onNavigate('cases');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      {/* Click Outside Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Dialog */}
      <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden z-10 space-y-0">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-slate-50/50">
          <Search className="w-5 h-5 text-blue-600 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search cases (e.g. NET-001, VLAN, NAT, Trunking)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-mono text-slate-400 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[400px] overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Troubleshooting Cases ({filteredCases.length})</span>
            {query && <span>Filtering by "{query}"</span>}
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-sans">
              No troubleshooting cases matching "{query}"
            </div>
          ) : (
            filteredCases.slice(0, 8).map((c) => (
              <div
                key={c.case_id}
                onClick={() => handleResultClick(c.case_id)}
                className="p-3 rounded-xl hover:bg-blue-50/80 border border-transparent hover:border-blue-200 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/60 border border-blue-200 text-blue-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {c.case_id.replace('NET-', '')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-extrabold text-blue-700">{c.case_id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {c.concept}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-blue-700">
                      {c.title}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-slate-400 group-hover:text-blue-600 shrink-0">
                  <span className="text-[11px] font-medium hidden sm:inline">Inspect Case</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <div className="flex items-center space-x-3">
            <span>Press <kbd className="font-mono font-bold text-slate-700 bg-white px-1 rounded border">↑</kbd> <kbd className="font-mono font-bold text-slate-700 bg-white px-1 rounded border">↓</kbd> to navigate</span>
            <span>Press <kbd className="font-mono font-bold text-slate-700 bg-white px-1 rounded border">↵</kbd> to select</span>
          </div>
          <span className="font-mono text-blue-600 font-bold">NETSAGE AI Search</span>
        </div>
      </div>
    </div>
  );
}
