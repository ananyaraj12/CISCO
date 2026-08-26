import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Edit3, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { submitHumanReview } from '../../api/reviews';

export default function HumanReviewModal({ isOpen, initialDecision, caseId, diagnosis, onClose, onSubmitReview }) {
  const [decision, setDecision] = useState(initialDecision || 'ACCEPTED');
  const [reviewer, setReviewer] = useState('Network Engineer');
  const [correctedRootCause, setCorrectedRootCause] = useState('');
  const [correctedFix, setCorrectedFix] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (initialDecision) setDecision(initialDecision);
  }, [initialDecision]);

  if (!isOpen) return null;

  const currentCaseId = diagnosis?.case_id || caseId || 'NET-001';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    
    // Client-side validations
    if (decision === 'EDITED') {
      if (!correctedRootCause.trim()) {
        setErrorMessage('Human corrected root cause is required for EDITED decision.');
        setIsSubmitting(false);
        return;
      }
      if (!correctedFix.trim()) {
        setErrorMessage('Human corrected CLI fix is required for EDITED decision.');
        setIsSubmitting(false);
        return;
      }
      if (!notes.trim()) {
        setErrorMessage('Reason for correction is required for EDITED decision.');
        setIsSubmitting(false);
        return;
      }
    } else if (decision === 'REJECTED') {
      if (!correctedRootCause.trim()) {
        setErrorMessage('Corrective feedback / root cause is required for REJECTED decision.');
        setIsSubmitting(false);
        return;
      }
      if (!rejectionReason.trim()) {
        setErrorMessage('Reason for rejection is required for REJECTED decision.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const payload = {
        case_id: currentCaseId,
        decision: decision,
        reviewer: reviewer,
        original_diagnosis: diagnosis,
        corrected_root_cause: (decision === 'EDITED' || decision === 'REJECTED') ? correctedRootCause : null,
        corrected_fix: decision === 'EDITED' ? correctedFix : null,
        rejection_reason: decision === 'REJECTED' ? rejectionReason : null,
        notes: notes
      };

      const result = await submitHumanReview(payload);
      setIsSuccess(true);
      
      setTimeout(() => {
        onSubmitReview({ ...payload, reviewer: reviewer });
        setIsSuccess(false);
        setErrorMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error submitting review:', err);
      let msg = 'Something went wrong while processing the request. Please try again.';
      if (!err.status) {
        msg = 'Unable to connect to the NetSage AI backend.';
      } else if (err.status === 400) {
        msg = err.message || 'Invalid request. Please check the submitted information.';
      } else if (err.status === 422) {
        msg = 'Invalid request. Please check the submitted information.';
      } else if (err.status === 500) {
        msg = 'Something went wrong while processing the request. Please try again.';
      }
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Human Review & Audit Evaluation</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="px-6 py-2 space-y-4">
          <div className="text-xs text-slate-500 font-mono">
            Target Case ID: <span className="text-blue-700 font-extrabold">{currentCaseId}</span>
          </div>

          {/* Decision Selection Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setDecision('ACCEPTED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                decision === 'ACCEPTED'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>ACCEPT</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('EDITED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                decision === 'EDITED'
                  ? 'bg-amber-500 border-amber-500 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>EDIT</span>
            </button>

            <button
              type="button"
              onClick={() => setDecision('REJECTED')}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                decision === 'REJECTED'
                  ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>REJECT</span>
            </button>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">Reviewer Role / Name</label>
            <input
              type="text"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans font-medium"
              required
            />
          </div>

          {/* Fields for EDITED */}
          {decision === 'EDITED' && (
            <div className="space-y-3 bg-amber-50/60 border border-amber-200 p-3 rounded-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-amber-900 mb-1">Human Corrected Root Cause</label>
                <input
                  type="text"
                  placeholder="Enter corrected root cause..."
                  value={correctedRootCause}
                  onChange={(e) => setCorrectedRootCause(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-amber-900 mb-1">Human Corrected CLI Fix</label>
                <input
                  type="text"
                  placeholder="Enter corrected CLI fix command..."
                  value={correctedFix}
                  onChange={(e) => setCorrectedFix(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-amber-900 mb-1">Reason for Correction</label>
                <input
                  type="text"
                  placeholder="Explain why you are modifying the AI diagnosis..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-600 font-sans"
                  required
                />
              </div>
            </div>
          )}

          {/* Fields for REJECTED */}
          {decision === 'REJECTED' && (
            <div className="space-y-3 bg-rose-50/60 border border-rose-200 p-3 rounded-xl">
              <div>
                <label className="block text-xs font-mono font-bold text-rose-900 mb-1">Corrective Feedback / Root Cause</label>
                <input
                  type="text"
                  placeholder="Enter correct diagnosis or feedback..."
                  value={correctedRootCause}
                  onChange={(e) => setCorrectedRootCause(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono font-bold text-rose-900 mb-1">Reason for Rejection</label>
                <textarea
                  rows={2}
                  placeholder="Explain why the AI diagnosis was rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-600 font-sans"
                  required
                />
              </div>
            </div>
          )}

          {/* Notes for ACCEPTED */}
          {decision === 'ACCEPTED' && (
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 mb-1">Audit Evaluation Notes</label>
              <input
                type="text"
                placeholder="Optional notes for responsible AI evaluation log"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>
          )}

          {/* Error and Success States */}
          {errorMessage && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 font-medium">
              {errorMessage}
            </div>
          )}
          {isSuccess && (
            <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3 font-medium flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>Review submitted successfully! Audit log updated.</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 pb-2 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isSuccess}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting review...</span>
                </>
              ) : (
                <span>Submit Audit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
