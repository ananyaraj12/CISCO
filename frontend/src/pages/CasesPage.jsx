import React from 'react';
import CaseListPanel from '../components/workspace/CaseListPanel';
import CaseDetailPanel from '../components/workspace/CaseDetailPanel';
import AIDiagnosisPanel from '../components/workspace/AIDiagnosisPanel';

export default function CasesPage({
  cases,
  selectedCaseId,
  onSelectCase,
  selectedCase,
  evidenceData,
  diagnosis,
  searchQuery,
  setSearchQuery,
  onOpenReviewModal,
  reviewState,
  isDiagnosing,
  onRunDiagnosis
}) {
  return (
    <div className="space-y-4">
      {/* 3-Column Responsive Case Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Panel: Case List (3 cols / 280-320px) */}
        <div className="lg:col-span-3">
          <CaseListPanel
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={onSelectCase}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>

        {/* Center Panel: Case Info + Packet Tracer Evidence (4.5 cols) */}
        <div className="lg:col-span-5">
          <CaseDetailPanel caseData={selectedCase} evidenceData={evidenceData} />
        </div>

        {/* Right Panel: Rule Engine + AI Diagnosis + Human Review (4.5 cols) */}
        <div className="lg:col-span-4">
          <AIDiagnosisPanel
            diagnosis={diagnosis}
            selectedCase={selectedCase}
            onOpenReviewModal={onOpenReviewModal}
            reviewState={reviewState}
            isDiagnosing={isDiagnosing}
            onRunDiagnosis={onRunDiagnosis}
          />
        </div>
      </div>
    </div>
  );
}
