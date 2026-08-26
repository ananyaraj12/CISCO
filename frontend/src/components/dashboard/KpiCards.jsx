import React from 'react';
import { FileText, Cpu, UserCheck, CheckCircle2, FolderGit2 } from 'lucide-react';

export default function KpiCards({ analytics, reviewHistory = [], cases = [] }) {
  const totalCases = cases.length > 0 ? cases.length : (analytics?.total_cases ?? 30);
  const pktFiles = cases.length > 0 ? cases.length : (analytics?.packet_tracer_files ?? 30);
  const aiDiagnoses = cases.length > 0 ? cases.length : (analytics?.ai_diagnoses ?? 30);
  
  const reviewedCount = reviewHistory.length;
  const getDecision = (r) => String(r.decision || r.human_decision || '').toUpperCase();
  const acceptedCount = reviewHistory.filter((r) => getDecision(r) === 'ACCEPTED').length;

  const agreement = reviewedCount > 0 
    ? ((acceptedCount / reviewedCount) * 100).toFixed(1) 
    : '100.0';

  const cards = [
    {
      title: 'TOTAL CASES',
      value: totalCases,
      subtitle: 'Troubleshooting cases',
      icon: FileText,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100',
      strokeColor: '#2563EB',
      sparkline: 'M0 15 Q 15 5, 30 18 T 60 8 T 90 22 T 100 12',
    },
    {
      title: 'PACKET TRACER FILES',
      value: pktFiles,
      subtitle: '.pkt topology files',
      icon: FolderGit2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      strokeColor: '#10B981',
      sparkline: 'M0 18 Q 15 8, 30 20 T 60 12 T 90 22 T 100 10',
    },
    {
      title: 'AI DIAGNOSES',
      value: aiDiagnoses,
      subtitle: 'Diagnoses generated',
      icon: Cpu,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      strokeColor: '#8B5CF6',
      sparkline: 'M0 20 Q 20 10, 40 22 T 70 8 T 90 18 T 100 12',
    },
    {
      title: 'HUMAN REVIEWS',
      value: reviewedCount,
      subtitle: `${reviewedCount} of ${totalCases} audited`,
      icon: UserCheck,
      iconBg: 'bg-orange-50 text-orange-600 border border-orange-100',
      strokeColor: '#F97316',
      sparkline: 'M0 12 Q 15 22, 35 10 T 65 18 T 85 8 T 100 16',
    },
    {
      title: 'HUMAN-AI AGREEMENT',
      value: `${agreement}%`,
      subtitle: 'Sign-off approval rate',
      icon: CheckCircle2,
      iconBg: 'bg-teal-50 text-teal-600 border border-teal-100',
      strokeColor: '#14B8A6',
      sparkline: 'M0 15 Q 25 8, 50 18 T 75 10 T 100 14',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 font-sans">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  {card.title}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.iconBg} shadow-2xs`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                  {card.value}
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  {card.subtitle}
                </div>
              </div>
            </div>

            {/* Sparkline wave */}
            <div className="mt-3 pt-1">
              <svg viewBox="0 0 100 30" className="w-full h-7 overflow-visible opacity-90">
                <path
                  d={card.sparkline}
                  fill="none"
                  stroke={card.strokeColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
