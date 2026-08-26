import React, { useState, useEffect } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { fetchAiResponsesLog, fetchReviewHistory, fetchCorrectionsLog } from '../api/reviews';
import CopyButton from '../components/common/CopyButton';

export default function LogsPage() {
  const [activeLog, setActiveLog] = useState('ai-responses');
  const [logContent, setLogContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogData();
  }, [activeLog]);

  const loadLogData = async () => {
    setLoading(true);
    try {
      if (activeLog === 'ai-responses') {
        const data = await fetchAiResponsesLog();
        setLogContent(JSON.stringify(data, null, 2));
      } else if (activeLog === 'human-reviews') {
        const data = await fetchReviewHistory();
        setLogContent(JSON.stringify(data, null, 2));
      } else {
        const data = await fetchCorrectionsLog();
        setLogContent(JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setLogContent('Log file is empty or unreachable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">System Audit & Raw File Log Reader</h2>
          <p className="text-xs text-slate-500">
            Inspect raw JSON/CSV log records in `data/logs/`
          </p>
        </div>

        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveLog('ai-responses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLog === 'ai-responses'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ai_responses.json
          </button>
          <button
            onClick={() => setActiveLog('human-reviews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLog === 'human-reviews'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            human_reviews.csv
          </button>
          <button
            onClick={() => setActiveLog('corrections')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeLog === 'corrections'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            corrections.csv
          </button>
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-700 font-bold">
            <Database className="w-4 h-4" />
            <span>data/logs/{activeLog === 'ai-responses' ? 'ai_responses.json' : activeLog === 'human-reviews' ? 'human_reviews.csv' : 'corrections.csv'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <CopyButton text={logContent} />
            <button
              onClick={loadLogData}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-[500px] overflow-y-auto font-mono text-xs text-cyan-300 whitespace-pre-wrap shadow-inner">
          {loading ? 'Loading raw log contents...' : logContent}
        </div>
      </div>
    </div>
  );
}
