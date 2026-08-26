import React from 'react';
import ResponsibleAILogs from '../components/ResponsibleAILogs';

export default function ResponsibleAIPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Responsible AI & Audit Governance</h2>
        <p className="text-xs text-slate-500">
          Enforcing safety mandates, human-in-the-loop evaluation, and immutable audit logs
        </p>
      </div>

      <ResponsibleAILogs />
    </div>
  );
}
