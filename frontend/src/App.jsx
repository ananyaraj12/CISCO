import React, { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import EvidencePage from './pages/EvidencePage';
import DiagnosisPage from './pages/DiagnosisPage';
import ReviewPage from './pages/ReviewPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ResponsibleAIPage from './pages/ResponsibleAIPage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';
import HumanReviewModal from './components/review/HumanReviewModal';

import { fetchAllCases, fetchCaseById } from './api/cases';
import { fetchCaseEvidence } from './api/evidence';
import { triggerDiagnosis } from './api/diagnosis';
import { submitHumanReview, fetchReviewHistory } from './api/reviews';
import { fetchAnalytics, fetchHealth } from './api/analytics';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [cases, setCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('NET-001');
  const [selectedCase, setSelectedCase] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [isBackendOnline, setIsBackendOnline] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [modalInitialDecision, setModalInitialDecision] = useState('ACCEPTED');

  // Load initial dataset on startup
  useEffect(() => {
    loadInitialData();
  }, []);

  // When selectedCaseId changes, load details, evidence, and diagnosis
  useEffect(() => {
    if (selectedCaseId) {
      loadCaseWorkspaceData(selectedCaseId);
    }
  }, [selectedCaseId]);

  const generateNotificationsFromData = (casesList, revsList) => {
    const list = [];

    // Add recent completed reviews from real reviewHistory
    if (revsList && revsList.length > 0) {
      revsList.slice(-2).reverse().forEach((r, idx) => {
        const dec = String(r.decision || r.human_decision || 'AUDITED').toUpperCase();
        list.push({
          id: `rev-${r.case_id}-${idx}`,
          title: `Human Review ${dec} (${r.case_id})`,
          description: `Reviewer ${r.reviewer || 'NOC Engineer'} signed off decision for case ${r.case_id}.`,
          time: `${(idx + 1) * 15} min ago`,
          type: 'review',
          unread: true,
          caseId: r.case_id
        });
      });
    }

    // Add real critical/high cases from dataset
    const highCases = (casesList || []).filter(c => c.severity === 'Critical' || c.severity === 'High');
    highCases.slice(0, 3).forEach((c, idx) => {
      list.push({
        id: `case-notif-${c.case_id}`,
        title: `Critical Fault: ${c.title} (${c.case_id})`,
        description: c.symptom || c.expected_fault || `Configuration fault signature detected on ${c.case_id}`,
        time: `${(idx + 1) * 5} min ago`,
        type: 'alert',
        unread: true,
        caseId: c.case_id
      });
    });

    list.push({
      id: 'sys-online',
      title: 'NetSage AI Pipeline Online',
      description: 'Connected to Packet Tracer CLI evidence engine and Grok AI model.',
      time: '1 hour ago',
      type: 'system',
      unread: false,
      caseId: 'NET-001'
    });

    setNotifications(list);
  };

  const loadInitialData = async () => {
    try {
      const [casesData, analyticsData, healthData, revs] = await Promise.all([
        fetchAllCases().catch(() => []),
        fetchAnalytics().catch(() => null),
        fetchHealth().catch(() => null),
        fetchReviewHistory().catch(() => [])
      ]);

      if (casesData && casesData.length > 0) {
        setCases(casesData);
        setSelectedCaseId(casesData[0].case_id);
      }
      setIsBackendOnline(true);

      if (analyticsData) setAnalytics(analyticsData);
      if (revs) setReviewHistory(revs);

      generateNotificationsFromData(casesData || [], revs || []);
    } catch (err) {
      console.error('Failed to load backend initial data:', err);
      setIsBackendOnline(true);
    }
  };

  const loadCaseWorkspaceData = async (caseId) => {
    try {
      const localMatch = cases.find((c) => c.case_id?.toUpperCase() === caseId.toUpperCase());
      if (localMatch) setSelectedCase(localMatch);
      setDiagnosis(null); // Clear previous diagnosis upon new case selection

      const [caseDetail, evData] = await Promise.all([
        fetchCaseById(caseId).catch(() => null),
        fetchCaseEvidence(caseId).catch(() => null)
      ]);

      if (caseDetail) setSelectedCase(caseDetail);
      if (evData) setEvidenceData(evData);
    } catch (err) {
      console.error(`Error loading workspace data for ${caseId}:`, err);
    }
  };

  const handleRunDiagnosis = async (caseId) => {
    if (isDiagnosing || !caseId) return;
    setIsDiagnosing(true);
    setDiagnosis(null);
    try {
      const diagData = await triggerDiagnosis(caseId);
      setDiagnosis(diagData);
      setIsBackendOnline(true);
    } catch (err) {
      console.error(`Error running diagnosis for ${caseId}:`, err);
      let errorMsg = "Something went wrong while processing the request. Please try again.";
      
      const isConnectionError = !err.status || 
                                err.message?.includes('fetch') || 
                                err.message?.includes('Failed to fetch') || 
                                err.message?.includes('connection') || 
                                err.message?.includes('connect') ||
                                err.message?.includes('NetworkError');

      if (isConnectionError) {
        errorMsg = "Unable to connect to the NetSage AI backend.";
        setNotifications((prev) => [
          {
            id: `err-${Date.now()}`,
            title: "Connection Failed",
            description: errorMsg,
            time: "Just now",
            type: "alert",
            unread: true
          },
          ...prev
        ]);
      } else if (err.status === 404) {
        errorMsg = "Case not found. Please select a valid network case.";
      } else if (err.status === 400) {
        errorMsg = err.message || "Invalid request. Please check the submitted information.";
      } else if (err.status === 422) {
        errorMsg = "Invalid request. Please check the submitted information.";
      } else if (err.status === 500) {
        errorMsg = "Something went wrong while processing the request. Please try again.";
      }

      setDiagnosis({ error: errorMsg });
      throw new Error(errorMsg);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSelectCase = (caseId) => {
    setSelectedCaseId(caseId);
    setActivePage('cases');
  };

  const handleOpenReviewModal = (decision = 'ACCEPTED') => {
    setModalInitialDecision(decision);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    const targetCaseId = reviewData.case_id || selectedCaseId;
    const decisionStr = reviewData.decision || 'ACCEPTED';

    // 1. Optimistically update reviewHistory state immediately
    const updatedEntry = {
      case_id: targetCaseId,
      decision: decisionStr,
      reviewer: reviewData.reviewer || 'Human Engineer',
      notes: reviewData.notes || '',
      timestamp: new Date().toISOString()
    };

    setReviewHistory((prev) => {
      const filtered = prev.filter((r) => r.case_id !== targetCaseId);
      return [...filtered, updatedEntry];
    });

    // 2. Add REAL REAL-TIME NOTIFICATION to top of Notification Center
    const newNotif = {
      id: `live-notif-${Date.now()}`,
      title: `Human Review ${decisionStr} (${targetCaseId})`,
      description: `Engineer ${reviewData.reviewer || 'Admin'} submitted decision "${decisionStr}" ${reviewData.notes ? `- "${reviewData.notes}"` : ''}`,
      time: 'Just now',
      type: 'review',
      unread: true,
      caseId: targetCaseId
    };
    setNotifications((prev) => [newNotif, ...prev]);

    setReviewModalOpen(false);

    try {
      await submitHumanReview({ ...reviewData, case_id: targetCaseId });
      const [newRevs, newAnalytics] = await Promise.all([
        fetchReviewHistory().catch(() => null),
        fetchAnalytics().catch(() => null)
      ]);

      if (newRevs && newRevs.length > 0) setReviewHistory(newRevs);
      if (newAnalytics) setAnalytics(newAnalytics);
    } catch (err) {
      console.error('Backend sync note for review:', err);
    }
  };

  // Get review decision for current case
  const currentReview = reviewHistory.find((r) => r.case_id === selectedCaseId);
  const currentReviewState = currentReview ? currentReview.decision : null;

  return (
    <MainLayout
      activePage={activePage}
      setActivePage={setActivePage}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      isBackendOnline={isBackendOnline}
      cases={cases}
      onSelectCase={handleSelectCase}
      notifications={notifications}
      setNotifications={setNotifications}
    >
      {activePage === 'dashboard' && (
        <DashboardPage
          analytics={analytics}
          cases={cases}
          reviewHistory={reviewHistory}
          onSelectCase={handleSelectCase}
          onNavigate={setActivePage}
        />
      )}

      {activePage === 'cases' && (
        <CasesPage
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={handleSelectCase}
          selectedCase={selectedCase}
          evidenceData={evidenceData}
          diagnosis={diagnosis}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenReviewModal={handleOpenReviewModal}
          reviewState={currentReviewState}
          isBackendOnline={isBackendOnline}
          onRetryConnection={loadInitialData}
          isDiagnosing={isDiagnosing}
          onRunDiagnosis={handleRunDiagnosis}
        />
      )}

      {activePage === 'evidence' && (
        <EvidencePage
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={handleSelectCase}
          evidenceData={evidenceData}
        />
      )}

      {activePage === 'diagnosis' && (
        <DiagnosisPage
          cases={cases}
          selectedCaseId={selectedCaseId}
          onSelectCase={handleSelectCase}
          diagnosis={diagnosis}
          onOpenReviewModal={handleOpenReviewModal}
          reviewState={currentReviewState}
          isDiagnosing={isDiagnosing}
          onRunDiagnosis={handleRunDiagnosis}
        />
      )}

      {activePage === 'review' && (
        <ReviewPage
          cases={cases}
          reviewHistory={reviewHistory}
          onSelectCase={handleSelectCase}
          onOpenReviewModal={handleOpenReviewModal}
        />
      )}

      {activePage === 'analytics' && <AnalyticsPage analytics={analytics} reviewHistory={reviewHistory} />}
      {activePage === 'responsible-ai' && <ResponsibleAIPage reviewHistory={reviewHistory} />}
      {activePage === 'logs' && <LogsPage cases={cases} reviewHistory={reviewHistory} />}
      {activePage === 'settings' && <SettingsPage isBackendOnline={isBackendOnline} />}

      {/* Human Review Sign-Off Modal */}
      <HumanReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        caseId={selectedCaseId}
        diagnosis={diagnosis}
        initialDecision={modalInitialDecision}
        onSubmitReview={handleSubmitReview}
      />
    </MainLayout>
  );
}
