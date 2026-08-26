import React, { useState, useEffect } from 'react';
import { FileText, Folder, Terminal, Network, ArrowRight } from 'lucide-react';
import { fetchPacketTracerFiles } from '../api/evidence';

export default function EvidencePage({ cases, onSelectCase }) {
  const [tab, setTab] = useState('pkt-files');
  const [pktFiles, setPktFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const files = await fetchPacketTracerFiles();
      setPktFiles(files);
    } catch (err) {
      console.error('Error fetching packet tracer files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Packet Tracer Lab Evidence Library</h2>
          <p className="text-xs text-slate-500">
            Audit command outputs, topology notes, and Packet Tracer (.pkt) case files
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setTab('pkt-files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'pkt-files'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Packet Tracer Cases ({pktFiles.length || 29})
          </button>
          <button
            onClick={() => setTab('evidence-tree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'evidence-tree'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            TXT Command Evidence Tree ({cases.length})
          </button>
        </div>
      </div>

      {tab === 'pkt-files' ? (
        /* Packet Tracer Files Table */
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Network className="w-4 h-4 text-blue-600" />
              <span>All Packet Tracer (.pkt) Lab Files</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Showing 29 .pkt files in data/packet_tracer/
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] bg-slate-50">
                  <th className="py-3 px-4">Case ID</th>
                  <th className="py-3 px-4">Packet Tracer Filename</th>
                  <th className="py-3 px-4">Concept</th>
                  <th className="py-3 px-4">Size (KB)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pktFiles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">Loading Packet Tracer files...</td>
                  </tr>
                ) : (
                  pktFiles.map((pkt) => (
                    <tr key={pkt.filename} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{pkt.case_id}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 font-mono">{pkt.filename}</td>
                      <td className="py-3 px-4 text-slate-600">{pkt.concept}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono">{pkt.size_kb} KB</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                          {pkt.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectCase(pkt.case_id)}
                          className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-all"
                        >
                          <span>Inspect Case</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TXT Evidence Tree Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cases.map((c) => (
            <div
              key={c.case_id}
              onClick={() => onSelectCase(c.case_id)}
              className="bg-white border border-slate-200 hover:border-blue-500 rounded-2xl p-4 shadow-xs cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {c.case_id}
                </span>
                <span className="text-[10px] font-medium text-slate-500">{c.concept}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">{c.title}</h4>

              {/* TXT Files Tree Simulation */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-[10px] text-slate-500 space-y-1">
                <div className="flex items-center space-x-1 text-slate-700 font-bold">
                  <Folder className="w-3 h-3 text-blue-600" />
                  <span>data/evidence/{c.case_id}/</span>
                </div>
                <div className="pl-4 space-y-0.5">
                  <div className="flex items-center space-x-1 text-slate-600">
                    <FileText className="w-2.5 h-2.5 text-blue-500" />
                    <span>case.txt</span>
                  </div>
                  <div className="flex items-center space-x-1 text-slate-600">
                    <Terminal className="w-2.5 h-2.5 text-emerald-500" />
                    <span>show_running_config.txt</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
