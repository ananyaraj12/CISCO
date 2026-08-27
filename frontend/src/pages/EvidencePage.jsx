import React, { useState, useEffect } from 'react';
import {
  FileText,
  Folder,
  Terminal,
  Network,
  ArrowRight,
  Search,
  Download,
  Copy,
  Check,
  Sparkles,
  X,
  Layers,
  ShieldCheck,
  ExternalLink,
  Cpu,
  RefreshCw,
  Info,
  Filter
} from 'lucide-react';
import { fetchPacketTracerFiles, fetchCaseEvidence, getDownloadPktUrl, getDownloadEvidenceUrl } from '../api/evidence';
import { SeverityBadge } from '../components/common/StatusBadge';

export default function EvidencePage({
  cases = [],
  selectedCaseId,
  onSelectCase,
  onRunDiagnosisAndNavigate,
  onNavigate
}) {
  const [tab, setTab] = useState('pkt-files'); // 'pkt-files' | 'evidence-tree'
  const [pktFiles, setPktFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConcept, setSelectedConcept] = useState('ALL');

  // Modal Inspector State
  const [activeModalCase, setActiveModalCase] = useState(null);
  const [modalEvidenceData, setModalEvidenceData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeFileTab, setActiveFileTab] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const files = await fetchPacketTracerFiles();
      if (Array.isArray(files)) {
        setPktFiles(files);
      }
    } catch (err) {
      console.error('Error fetching packet tracer files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (pktCase) => {
    setActiveModalCase(pktCase);
    setModalLoading(true);
    setCopied(false);
    setActiveFileTab('');
    try {
      const evData = await fetchCaseEvidence(pktCase.case_id);
      setModalEvidenceData(evData);
    } catch (err) {
      console.error('Error fetching modal evidence:', err);
      setModalEvidenceData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setActiveModalCase(null);
    setModalEvidenceData(null);
  };

  const handleCopyText = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive unique concepts list
  const rawConcepts = pktFiles.map((f) => f.concept).filter(Boolean);
  const uniqueConcepts = ['ALL', ...Array.from(new Set(rawConcepts))];

  // Filtered dataset
  const filteredFiles = pktFiles.filter((f) => {
    const matchesSearch =
      !searchQuery ||
      f.case_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.concept?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.symptom?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesConcept = selectedConcept === 'ALL' || f.concept === selectedConcept;

    return matchesSearch && matchesConcept;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Network className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Packet Tracer Lab & Evidence Library</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit Cisco Packet Tracer (.pkt) simulation files, CLI outputs, running configs, and topology evidence
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-stretch sm:self-auto">
          <button
            onClick={() => setTab('pkt-files')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'pkt-files'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>All Packet Tracer (.pkt) Files ({pktFiles.length})</span>
          </button>
          <button
            onClick={() => setTab('evidence-tree')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              tab === 'evidence-tree'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>TXT Evidence Tree Grid ({cases.length || pktFiles.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Stats & Quick Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 font-mono font-bold text-base border border-blue-100">
            {pktFiles.length || 29}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total .pkt Cases</div>
            <div className="text-xs font-semibold text-slate-800">Cisco Packet Tracer Labs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 font-mono font-bold text-base border border-emerald-100">
            100%
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Audit Status</div>
            <div className="text-xs font-semibold text-slate-800">Ready for AI Diagnosis</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 font-mono font-bold text-base border border-purple-100">
            {uniqueConcepts.length - 1 || 8}
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Network Concepts</div>
            <div className="text-xs font-semibold text-slate-800">DHCP, DNS, WLAN, ACL, NAT</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 font-mono font-bold text-base border border-amber-100">
            CLI
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Captured Outputs</div>
            <div className="text-xs font-semibold text-slate-800">Show Config & Topology Map</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Case ID, concept, or filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Concept Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {uniqueConcepts.slice(0, 8).map((concept) => (
            <button
              key={concept}
              onClick={() => setSelectedConcept(concept)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                selectedConcept === concept
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200/60'
              }`}
            >
              {concept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading Packet Tracer evidence files...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Evidence Files Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No Packet Tracer lab evidence matches your search query "{searchQuery}" or filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedConcept('ALL');
            }}
            className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold hover:bg-blue-100 transition-all inline-flex items-center space-x-1.5"
          >
            <span>Reset Search & Filters</span>
          </button>
        </div>
      ) : tab === 'pkt-files' ? (
        /* Packet Tracer Files Table View */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Network className="w-4 h-4 text-blue-600" />
              <span>Packet Tracer (.pkt) Evidence Registry</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredFiles.length} file(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] bg-slate-50 font-bold">
                  <th className="py-3.5 px-6">Case ID</th>
                  <th className="py-3.5 px-4">Packet Tracer Filename</th>
                  <th className="py-3.5 px-4">Concept</th>
                  <th className="py-3.5 px-4">OSI Layer</th>
                  <th className="py-3.5 px-4">Size (KB)</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFiles.map((pkt) => (
                  <tr
                    key={pkt.case_id || pkt.filename}
                    onClick={() => handleOpenModal(pkt)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-6">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {pkt.case_id}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      <div className="flex items-center space-x-2">
                        <Network className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate max-w-xs">{pkt.filename}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                        {pkt.concept}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {pkt.osi_layer || 'Layer 3'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono font-semibold">
                      {pkt.size_kb} KB
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold inline-flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>{pkt.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenModal(pkt)}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-all shadow-xs"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Inspect Evidence</span>
                      </button>
                      <button
                        onClick={() => {
                          if (onSelectCase) onSelectCase(pkt.case_id);
                        }}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-semibold transition-all"
                        title="Go to Cases Workspace"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TXT Command Evidence Tree Grid View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((c) => (
            <div
              key={c.case_id}
              onClick={() => handleOpenModal(c)}
              className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {c.case_id}
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {c.concept}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {c.title || c.filename}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                  {c.symptom || 'CLI check log ready for inspection.'}
                </p>
              </div>

              {/* Simulated Directory Tree View */}
              <div className="bg-slate-900 text-cyan-300 p-3 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5 shadow-inner">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-bold border-b border-slate-800 pb-1">
                  <Folder className="w-3 h-3 text-blue-400" />
                  <span>data/evidence/{c.case_id}/</span>
                </div>
                <div className="pl-3 space-y-1 text-slate-400">
                  <div className="flex items-center space-x-1.5 hover:text-cyan-300">
                    <FileText className="w-3 h-3 text-blue-400" />
                    <span>evidence_info.txt</span>
                  </div>
                  <div className="flex items-center space-x-1.5 hover:text-emerald-300">
                    <Terminal className="w-3 h-3 text-emerald-400" />
                    <span>show_running_config.txt</span>
                  </div>
                  <div className="flex items-center space-x-1.5 hover:text-amber-300">
                    <Network className="w-3 h-3 text-amber-400" />
                    <span>topology_map.txt</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-mono">{c.size_kb} KB</span>
                <span className="text-blue-600 font-bold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                  <span>Inspect Evidence</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* EVIDENCE INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {activeModalCase && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-150">
          <div
            className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed Top */}
            <div className="bg-slate-900 text-white px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-blue-600 text-white">
                    {activeModalCase.case_id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeModalCase.concept}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {activeModalCase.osi_layer || 'Layer 3'}
                  </span>
                  {activeModalCase.severity && <SeverityBadge severity={activeModalCase.severity} />}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white pt-0.5">
                  {activeModalCase.title || activeModalCase.filename}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 font-mono">
                  Packet Tracer Lab File: <span className="text-cyan-400 font-semibold">{activeModalCase.filename}</span> ({activeModalCase.size_kb} KB)
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body - Scrollable Middle */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Reported Symptom if available */}
              {activeModalCase.symptom && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 space-y-0.5">
                  <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Reported Network Symptom</div>
                  <p className="text-xs text-rose-950 font-semibold">{activeModalCase.symptom}</p>
                </div>
              )}

              {/* Evidence File Content Viewer */}
              {modalLoading ? (
                <div className="bg-slate-900 rounded-xl p-10 text-center text-cyan-400 space-y-2 font-mono text-xs border border-slate-800">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-400" />
                  <span>Loading evidence logs from backend...</span>
                </div>
              ) : modalEvidenceData ? (
                <div className="space-y-3">
                  {/* File Selector Tabs */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-1.5 overflow-x-auto">
                      {Object.keys(modalEvidenceData.files || {}).map((fname) => {
                        const isSelected =
                          activeFileTab === fname ||
                          (!activeFileTab && fname === Object.keys(modalEvidenceData.files)[0]);
                        return (
                          <button
                            key={fname}
                            onClick={() => setActiveFileTab(fname)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                              isSelected
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {fname}
                          </button>
                        );
                      })}
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => {
                        const files = modalEvidenceData.files || {};
                        const curName = activeFileTab || Object.keys(files)[0];
                        handleCopyText(files[curName] || modalEvidenceData.evidence_text);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{copied ? 'Copied!' : 'Copy Log'}</span>
                    </button>
                  </div>

                  {/* Dark Terminal Display */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300 leading-relaxed shadow-inner overflow-x-auto max-h-[260px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-mono text-[11px]">
                      {(() => {
                        const files = modalEvidenceData.files || {};
                        const curName = activeFileTab || Object.keys(files)[0];
                        return files[curName] || modalEvidenceData.evidence_text || 'No content';
                      })()}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs">
                  Evidence details unavailable for this case.
                </div>
              )}
            </div>

            {/* Modal Footer Action Toolbar - Fixed Bottom */}
            <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              {/* File Download Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <a
                  href={getDownloadPktUrl(activeModalCase.case_id)}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download .pkt File</span>
                </a>
                <a
                  href={getDownloadEvidenceUrl(activeModalCase.case_id)}
                  download
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition-all"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download TXT Log</span>
                </a>
              </div>

              {/* Navigation & Diagnosis Buttons */}
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                {onRunDiagnosisAndNavigate && (
                  <button
                    onClick={() => {
                      handleCloseModal();
                      onRunDiagnosisAndNavigate(activeModalCase.case_id);
                    }}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Diagnosis</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleCloseModal();
                    if (onSelectCase) onSelectCase(activeModalCase.case_id);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                >
                  <span>Open in Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
