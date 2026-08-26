import React from 'react';
import KpiCards from '../components/dashboard/KpiCards';
import ChartsSection from '../components/dashboard/ChartsSection';
import RecentCasesTable from '../components/dashboard/RecentCasesTable';

export default function DashboardPage({
  analytics,
  cases,
  reviewHistory = [],
  onSelectCase,
  onNavigate
}) {
  return (
    <div className="space-y-6">
      {/* Row 1: Top 5 KPI Stat Cards */}
      <KpiCards analytics={analytics} reviewHistory={reviewHistory} cases={cases} />

      {/* Row 2: Donut & Bar Charts */}
      <ChartsSection analytics={analytics} reviewHistory={reviewHistory} cases={cases} onNavigate={onNavigate} />

      {/* Row 3: Recent Cases Table & Activity */}
      <RecentCasesTable cases={cases} reviewHistory={reviewHistory} onSelectCase={onSelectCase} onNavigate={onNavigate} />
    </div>
  );
}
