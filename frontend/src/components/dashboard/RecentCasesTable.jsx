import React, { useState } from 'react';
import { Cpu, UserCheck, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export default function RecentCasesTable({ cases = [], onSelectCase, onNavigate }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalCases = cases.length > 0 ? cases.length : 30;
  const totalPages = Math.ceil(totalCases / itemsPerPage);

  // Derive visible cases dynamically from backend dataset or fallback array
  const displayedCases = cases.length > 0
    ? cases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((c) => ({
        case_id: c.case_id,
        title: c.title,
        concept: c.concept,
        severity: c.severity,
        confidence: Math.round((c.confidence || 0.95) * 100),
        review: c.review_status || 'Pending',
        status: c.status || 'Needs Review',
        updated: c.updated_at || '25 Aug 2026'
      }))
    : [
        {
          case_id: 'NET-011',
          title: 'NAT Inside/Outside Misconfiguration',
          concept: 'NAT',
          severity: 'High',
          confidence: 97,
          review: 'Pending',
          status: 'Needs Review',
          updated: '25 Aug 2026',
        },
        {
          case_id: 'NET-002',
          title: 'Trunk Disabled on Interface',
          concept: 'Trunking',
          severity: 'High',
          confidence: 92,
          review: 'Edited',
          status: 'Resolved',
          updated: '24 Aug 2026',
        },
        {
          case_id: 'NET-001',
          title: 'Wrong VLAN Assignment',
          concept: 'VLAN',
          severity: 'High',
          confidence: 96,
          review: 'Accepted',
          status: 'Resolved',
          updated: '24 Aug 2026',
        },
        {
          case_id: 'NET-009',
          title: 'DHCP Pool Network Mismatch',
          concept: 'DHCP',
          severity: 'Medium',
          confidence: 88,
          review: 'Accepted',
          status: 'Resolved',
          updated: '23 Aug 2026',
        },
        {
          case_id: 'NET-012',
          title: 'NAT ACL Mismatch',
          concept: 'NAT',
          severity: 'High',
          confidence: 95,
          review: 'Pending',
          status: 'Needs Review',
          updated: '23 Aug 2026',
        },
      ];

  // Activities stream
  const activities = [
    {
      icon: Cpu,
      iconColor: 'bg-emerald-100 text-emerald-600',
      title: 'AI diagnosis generated',
      caseId: 'NET-011',
      time: '2 min ago',
    },
    {
      icon: UserCheck,
      iconColor: 'bg-amber-100 text-amber-600',
      title: 'Human review submitted',
      caseId: 'NET-002',
      time: '15 min ago',
    },
    {
      icon: FileText,
      iconColor: 'bg-blue-100 text-blue-600',
      title: 'Evidence uploaded',
      caseId: 'NET-012',
      time: '1 hour ago',
    },
    {
      icon: RefreshCw,
      iconColor: 'bg-emerald-100 text-emerald-600',
      title: 'Case updated',
      caseId: 'NET-009',
      time: '2 hours ago',
    },
    {
      icon: CheckCircle2,
      iconColor: 'bg-emerald-100 text-emerald-600',
      title: 'Review accepted',
      caseId: 'NET-001',
      time: '3 hours ago',
    },
  ];

  const handleCaseClick = (caseId) => {
    if (onSelectCase) onSelectCase(caseId);
    if (onNavigate) onNavigate('cases');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Left Table Panel (2/3 width) */}
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Recent Troubleshooting Cases
            </h3>
            <button
              onClick={() => onNavigate && onNavigate('cases')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>View all cases</span>
              <span>→</span>
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 pr-2">Case ID</th>
                  <th className="pb-3 px-2">Title</th>
                  <th className="pb-3 px-2">Concept</th>
                  <th className="pb-3 px-2">Severity</th>
                  <th className="pb-3 px-2">AI Confidence</th>
                  <th className="pb-3 px-2">Review</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 pl-2 text-right">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedCases.map((c) => (
                  <tr
                    key={c.case_id}
                    onClick={() => handleCaseClick(c.case_id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-all"
                  >
                    {/* Case ID */}
                    <td className="py-3.5 pr-2 font-mono font-bold text-blue-700">
                      {c.case_id}
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-2 font-bold text-slate-800 max-w-[200px] truncate">
                      {c.title}
                    </td>

                    {/* Concept */}
                    <td className="py-3.5 px-2 text-slate-600 font-medium">
                      {c.concept}
                    </td>

                    {/* Severity Badge */}
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          c.severity === 'High' || c.severity === 'Critical'
                            ? 'bg-rose-50 text-rose-600 border-rose-200'
                            : 'bg-amber-50 text-amber-600 border-amber-200'
                        }`}
                      >
                        {c.severity}
                      </span>
                    </td>

                    {/* Confidence Progress Bar */}
                    <td className="py-3.5 px-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-700 text-[11px]">
                          {c.confidence}%
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${c.confidence}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Review Badge */}
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          c.review === 'Pending' || c.review === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : c.review === 'Edited' || c.review === 'EDITED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {c.review}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                          c.status === 'Needs Review'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Updated Date */}
                    <td className="py-3.5 pl-2 text-right text-slate-400 font-mono text-[11px]">
                      {c.updated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs text-slate-500 gap-2">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalCases)} of {totalCases} cases
          </div>
          <div className="flex items-center space-x-1 font-mono">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 font-bold"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-7 h-7 rounded text-xs font-bold transition-all flex items-center justify-center ${
                  currentPage === pg
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 font-bold"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* 2. Right Activity Panel (1/3 width) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-5 font-sans">
            Recent Activity
          </h3>

          <div className="space-y-4">
            {activities.map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start space-x-3 text-xs">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-800 leading-tight">
                      {act.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {act.caseId}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 font-sans">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 mt-4 text-center">
          <button
            onClick={() => onNavigate && onNavigate('logs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all cursor-pointer"
          >
            View all activity →
          </button>
        </div>
      </div>
    </div>
  );
}
