import React from 'react';

export function SeverityBadge({ severity }) {
  const sev = (severity || 'Medium').toUpperCase();
  
  let colors = 'bg-slate-800 text-slate-300 border-slate-700';
  if (sev === 'CRITICAL') {
    colors = 'bg-rose-950/80 text-rose-400 border-rose-800/80';
  } else if (sev === 'HIGH') {
    colors = 'bg-orange-950/80 text-orange-400 border-orange-800/80';
  } else if (sev === 'MEDIUM') {
    colors = 'bg-amber-950/80 text-amber-400 border-amber-800/80';
  } else if (sev === 'LOW') {
    colors = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${colors}`}>
      {severity}
    </span>
  );
}

export function ReviewStatusBadge({ decision }) {
  const dec = (decision || 'Pending').toUpperCase();

  if (dec === 'ACCEPTED') {
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-800/90 shadow-sm">
        Accepted
      </span>
    );
  }
  if (dec === 'EDITED') {
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-700/80">
        Edited
      </span>
    );
  }
  if (dec === 'REJECTED') {
    return (
      <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-950/90 text-rose-400 border border-rose-800/90">
        Rejected
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80">
      Pending
    </span>
  );
}

export function CaseStatusBadge({ status }) {
  const st = (status || 'Needs Review').toUpperCase();
  if (st === 'RESOLVED') {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
        Resolved
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-950/60 text-blue-300 border border-blue-800/60">
      Needs Review
    </span>
  );
}
