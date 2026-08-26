import React, { useState } from 'react';
import { X, CheckCircle, Edit3, XCircle, ShieldCheck } from 'lucide-react';

export default function HumanReviewModal({ isOpen, initialDecision, diagnosis, onClose, onSubmitReview }) {
  const [decision, setDecision] = useState(initialDecision || 'ACCEPTED');
  const [reviewer, setReviewer] = useState('Network Engineer');
  const [correctedRootCause, setCorrectedRootCause] = useState('');
  const [correctedFix, setCorrectedFix] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen || !diagnosis) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitReview({
      case_id: diagnosis.case_id,
      decision: decision,
      reviewer: reviewer,
      original_diagnosis: diagnosis,
      corrected_root_cause: decision === 'EDITED' ? correctedRootCause : null,
      corrected_fix: decision === 'EDITED' ? correctedFix : null,
      rejection_reason: decision === 'REJECTED' ? rejectionReason : null,
      notes: notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Human Review & Audit Evaluation</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-2 space-y-4">
          <div className="text-xs text-slate-400">
            Reviewing AI Diagnosis for Case: <span className="font-mono text-cyan-400 font-bold">{diagnosis.case_id}</span>
          </div>

          {/* Decision Selection Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDecision('ACCEPTED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                decision === 'ACCEPTED'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>ACCEPT</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('EDITED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                decision === 'EDITED'
                  ? 'bg-amber-950 border-amber-500 text-amber-300 ring-1 ring-amber-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                decision === 'REJECTED'
                  ? 'bg-rose-950 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>REJECT</span>
            </button>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Reviewer Name/Role</label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Fields for EDITED */}
          {decision === 'EDITED' && (
            <div className="space-y-3 bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl">
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Human Corrected Root Cause</label>
                <input
                  type="text"
                  placeholder={diagnosis.root_cause}
                  value={correctedRootCause}
                  onChange={(e) => setCorrectedRootCause(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">Human Corrected CLI Fix</label>
                <input
                  type="text"
                  placeholder={diagnosis.expected_fix}
                  value={correctedFix}
                  onChange={(e) => setCorrectedFix(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Fields for REJECTED */}
          {decision === 'REJECTED' && (
            <div className="bg-rose-950/20 border border-rose-900/40 p-3 rounded-xl">
              <label className="block text-xs font-semibold text-rose-300 mb-1">Rejection Reason</label>
              <textarea
                rows={2}
                placeholder="Explain why the AI diagnosis was rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Audit Notes / Comments</label>
            <input
              type="text"
              placeholder="Optional notes for responsible AI evaluation record"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 pb-2 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-900/30"
            >
              Submit Audit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
