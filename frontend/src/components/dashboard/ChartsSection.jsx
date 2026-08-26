import React from 'react';

export default function ChartsSection({ analytics, reviewHistory = [], cases = [] }) {
  const totalCasesCount = cases.length > 0 ? cases.length : 30;

  // Group top 4 concepts + Other to ensure clean layout without scrollbars
  const conceptCounts = {};
  cases.forEach((c) => {
    const key = c.concept || 'Other';
    conceptCounts[key] = (conceptCounts[key] || 0) + 1;
  });

  const rawConceptList = Object.keys(conceptCounts).length > 0
    ? Object.entries(conceptCounts).map(([name, count]) => ({ name, count }))
    : [
        { name: 'VLAN', count: 12 },
        { name: 'Trunking / 802.1Q', count: 8 },
        { name: 'Routing', count: 5 },
        { name: 'ACL / Security', count: 3 },
        { name: 'DHCP / DNS', count: 2 }
      ];

  // Sort descending and keep top 4 + combine remaining into 'Other'
  rawConceptList.sort((a, b) => b.count - a.count);
  let topConcepts = rawConceptList.slice(0, 4);
  const remaining = rawConceptList.slice(4);
  if (remaining.length > 0) {
    const otherSum = remaining.reduce((sum, item) => sum + item.count, 0);
    topConcepts.push({ name: 'Other Concepts', count: otherSum });
  }

  const conceptColors = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];
  const conceptData = topConcepts.map((item, idx) => ({
    ...item,
    pct: `${Math.round((item.count / totalCasesCount) * 100)}%`,
    color: conceptColors[idx % conceptColors.length]
  }));

  // Dynamic Review status data
  const getDecision = (r) => {
    if (!r) return '';
    return String(r.decision || r.human_decision || '').toUpperCase();
  };

  const acceptedCount = reviewHistory.filter((r) => getDecision(r) === 'ACCEPTED').length;
  const editedCount = reviewHistory.filter((r) => getDecision(r) === 'EDITED').length;
  const rejectedCount = reviewHistory.filter((r) => getDecision(r) === 'REJECTED').length;
  const reviewedTotal = acceptedCount + editedCount + rejectedCount;
  const pendingCount = Math.max(0, totalCasesCount - reviewedTotal);

  const reviewData = [
    { name: 'Accepted', count: acceptedCount, color: '#22C55E' },
    { name: 'Edited', count: editedCount, color: '#3B82F6' },
    { name: 'Rejected', count: rejectedCount, color: '#EF4444' },
    { name: 'Pending', count: pendingCount, color: '#F59E0B' }
  ].map((item) => ({
    ...item,
    pct: `${Math.round((item.count / totalCasesCount) * 100)}%`
  }));

  // Severity Data
  const severityData = [
    { name: 'Critical', count: cases.filter(c => c.severity === 'Critical').length || 5, color: '#EF4444' },
    { name: 'High', count: cases.filter(c => c.severity === 'High').length || 16, color: '#F97316' },
    { name: 'Medium', count: cases.filter(c => c.severity === 'Medium').length || 6, color: '#EAB308' },
    { name: 'Low', count: cases.filter(c => c.severity === 'Low').length || 3, color: '#22C55E' }
  ];

  // Helper to render SVG Donut path with center text
  const renderDonut = (data, centerLabel, centerSub) => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0) || 1;
    let cumulativeAngle = 0;
    const size = 150;
    const center = size / 2;
    const radius = 56;
    const holeRadius = 38;

    const slices = data.map((item, idx) => {
      if (item.count === 0) return null;
      const sliceAngle = (item.count / total) * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + sliceAngle;
      cumulativeAngle += sliceAngle;

      const x1 = center + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const y1 = center + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const x2 = center + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const y2 = center + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const ix1 = center + holeRadius * Math.cos((Math.PI * (startAngle - 90)) / 180);
      const iy1 = center + holeRadius * Math.sin((Math.PI * (startAngle - 90)) / 180);
      const ix2 = center + holeRadius * Math.cos((Math.PI * (endAngle - 90)) / 180);
      const iy2 = center + holeRadius * Math.sin((Math.PI * (endAngle - 90)) / 180);

      const largeArc = sliceAngle > 180 ? 1 : 0;

      if (sliceAngle >= 359.9) {
        return (
          <circle
            key={idx}
            cx={center}
            cy={center}
            r={(radius + holeRadius) / 2}
            fill="none"
            stroke={item.color}
            strokeWidth={radius - holeRadius}
          />
        );
      }

      const pathData = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${ix2} ${iy2}`,
        `A ${holeRadius} ${holeRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`,
        'Z'
      ].join(' ');

      return <path key={idx} d={pathData} fill={item.color} stroke="#FFFFFF" strokeWidth="2" />;
    });

    return (
      <div className="w-36 h-36 shrink-0 relative flex items-center justify-center">
        <svg viewBox="0 0 150 150" className="w-full h-full transform -rotate-90">
          {slices}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-lg font-black text-slate-900 leading-none">{centerLabel}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{centerSub}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* 1. Cases by Concept Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900">Cases by Concept</h3>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {totalCasesCount} Cases
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          {renderDonut(conceptData, totalCasesCount, 'Concepts')}

          {/* Legend */}
          <div className="space-y-2 flex-1 text-xs min-w-0">
            {conceptData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700 font-medium">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="truncate max-w-[95px] text-[11px] font-semibold">{item.name}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-slate-900 text-xs">{item.count}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({item.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Diagnosis Review Status Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-extrabold text-slate-900">Diagnosis Review Status</h3>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {reviewedTotal}/{totalCasesCount} Reviewed
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          {renderDonut(reviewData, `${reviewedTotal}`, 'Audited')}

          {/* Legend */}
          <div className="space-y-2 flex-1 text-xs">
            {reviewData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-slate-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  <span className="text-[11px] font-semibold">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 text-xs">{item.count}</span>
                  <span className="text-[10px] text-slate-400 ml-1">({item.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Cases by Severity Bar Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-extrabold text-slate-900">Cases by Severity</h3>
          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Severity Index
          </span>
        </div>

        {/* Bar Chart Container */}
        <div className="relative h-40 flex items-end justify-between pt-6 px-3 border-b border-slate-200">
          {/* Y-Axis Grid Labels */}
          <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[10px] font-mono text-slate-400 pointer-events-none">
            <span>20</span>
            <span>15</span>
            <span>10</span>
            <span>5</span>
            <span>0</span>
          </div>

          {/* Grid lines */}
          <div className="absolute left-6 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-slate-100 w-full"></div>
            <div className="border-b border-slate-100 w-full"></div>
            <div className="border-b border-slate-100 w-full"></div>
            <div className="border-b border-slate-100 w-full"></div>
            <div className="border-b border-slate-200 w-full"></div>
          </div>

          {/* Bars */}
          <div className="relative z-10 w-full ml-6 flex items-end justify-around h-full">
            {severityData.map((bar, idx) => {
              const heightPct = Math.min((bar.count / 20) * 100, 100);
              return (
                <div key={idx} className="flex flex-col items-center flex-1 max-w-[42px] h-full justify-end group">
                  <span className="text-[11px] font-extrabold text-slate-900 mb-1 group-hover:scale-110 transition-transform">
                    {bar.count}
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all duration-300 group-hover:brightness-95 shadow-2xs"
                    style={{ height: `${heightPct}%`, backgroundColor: bar.color }}
                  ></div>
                  <span className="text-[11px] text-slate-600 font-bold mt-2 absolute -bottom-6">
                    {bar.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-4"></div>
      </div>
    </div>
  );
}
