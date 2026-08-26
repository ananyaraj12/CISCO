import React from 'react';
import AnalyticsOverview from '../components/AnalyticsOverview';

export default function AnalyticsPage({ analytics }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">System Analytics & Performance Insights</h2>
        <p className="text-xs text-slate-500">
          Statistical distribution, confidence metrics, and responsible AI human-agreement evaluations
        </p>
      </div>

      <AnalyticsOverview analytics={analytics} />
    </div>
  );
}
