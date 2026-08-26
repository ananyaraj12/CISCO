import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { fetchReviewHistory } from '../api/reviews';
import { ReviewStatusBadge } from '../components/common/StatusBadge';

export default function ReviewPage({ cases = [], reviewHistory = [], onSelectCase, onOpenReviewModal }) {
  const [reviews, setReviews] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const history = await fetchReviewHistory();
      if (history && Array.isArray(history)) {
        setReviews(history);
      }
    } catch (e) {
      console.error('Failed loading review history:', e);
    }
  };

  // Combine parent reviewHistory with fetched reviews
  const activeReviews = reviewHistory.length > 0 ? reviewHistory : reviews;

  const filteredCases = cases.filter((c) => {
    const rev = activeReviews.find((r) => r && r.case_id === c.case_id);
    const rawDecision = rev ? (rev.decision || rev.human_decision || 'PENDING') : 'PENDING';
    const decision = String(rawDecision).toUpperCase();
    if (statusFilter === 'ALL') return true;
    return decision === statusFilter.toUpperCase();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Human Review & Evaluation Hub</h2>
          <p className="text-xs text-slate-500">
            Mandatory human sign-off workflow for AI-generated root cause diagnoses
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {['ALL', 'ACCEPTED', 'EDITED', 'REJECTED', 'PENDING'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Queue Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Diagnostic Review Queue ({filteredCases.length} Cases)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] bg-slate-50">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Concept</th>
                <th className="py-3 px-4">Review Decision</th>
                <th className="py-3 px-4">Reviewer</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                const rev = activeReviews.find((r) => r && r.case_id === c.case_id);
                const rawDecision = rev ? (rev.decision || rev.human_decision || 'PENDING') : 'PENDING';
                const decision = String(rawDecision).toUpperCase();
                const reviewer = rev ? (rev.reviewer || rev.human_reviewer || 'Human Engineer') : 'Pending Review';

                return (
                  <tr key={c.case_id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{c.case_id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 font-sans">{c.title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{c.concept}</td>
                    <td className="py-3.5 px-4">
                      <ReviewStatusBadge decision={decision} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-medium">{reviewer}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          onSelectCase(c.case_id);
                          onOpenReviewModal('ACCEPTED');
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-all"
                      >
                        {rev ? 'Update Review' : 'Review Case'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
