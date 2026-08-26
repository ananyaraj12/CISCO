import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

export default function ResponsibleAILogs() {
  const [subTab, setSubTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [aiResponses, setAiResponses] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const [resRev, resAi, resCorr] = await Promise.all([
        fetch('/api/review/history'),
        fetch('/api/logs/ai-responses'),
        fetch('/api/logs/corrections')
      ]);

      if (resRev.ok) setReviews(await resRev.json());
      if (resAi.ok) setAiResponses(await resAi.json());
      if (resCorr.ok) setCorrections(await resCorr.json());
    } catch (e) {
      console.error('Failed to fetch logs', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Responsible AI Evaluation & Audit Logs</h2>
            <p className="text-xs text-slate-500">Maintains complete audit trail for compliance and model evaluation</p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-700 border border-slate-200 font-semibold"
        >
          Refresh Logs
        </button>
      </div>

      {/* Log Selection Sub-tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setSubTab('reviews')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'reviews'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          human_reviews.csv ({reviews.length})
        </button>

        <button
          onClick={() => setSubTab('responses')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'responses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          ai_responses.json ({aiResponses.length})
        </button>

        <button
          onClick={() => setSubTab('corrections')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            subTab === 'corrections'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          corrections.csv ({corrections.length})
        </button>
      </div>

      {/* Log Table View */}
      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading audit records...</div>
      ) : subTab === 'reviews' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Review ID</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Reviewer</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 font-sans">No human review records logged yet.</td>
                </tr>
              ) : (
                reviews.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-blue-700">{r.review_id}</td>
                    <td className="p-3 text-slate-800 font-mono font-bold">{r.case_id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.decision === 'ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : r.decision === 'EDITED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {r.decision}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{r.reviewer}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{r.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : subTab === 'responses' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 max-h-[400px] overflow-y-auto">
          <pre className="text-xs font-mono text-cyan-300 whitespace-pre-wrap">
            {JSON.stringify(aiResponses, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Correction ID</th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Decision</th>
                <th className="p-3">Human Correction / Reason</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {corrections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-400 font-sans">No human corrections logged yet.</td>
                </tr>
              ) : (
                corrections.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-amber-700">{c.correction_id}</td>
                    <td className="p-3 text-slate-800 font-mono font-bold">{c.case_id}</td>
                    <td className="p-3">{c.decision}</td>
                    <td className="p-3 text-slate-700">{c.human_correction || c.rejection_reason}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{c.timestamp}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
