import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  Cpu,
  ShieldCheck,
  BarChart3,
  ShieldAlert,
  Database,
  Settings,
  Shield,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases', icon: FolderGit2 },
  { id: 'evidence', label: 'Evidence Library', icon: FileText },
  { id: 'diagnosis', label: 'AI Diagnosis', icon: Cpu },
  { id: 'review', label: 'Human Review', icon: ShieldCheck },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'responsible-ai', label: 'Responsible AI', icon: ShieldAlert },
  { id: 'logs', label: 'AI Logs', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, setActivePage, isBackendOnline, isCollapsed, onToggleCollapse }) {
  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-[#0B132B] text-slate-300 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-40 transition-all duration-300 ease-in-out border-r border-slate-800/80 overflow-hidden`}
    >
      <div>
        {/* Logo & Brand Header with Toggle Button */}
        <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-800/80`}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white shrink-0">
                <Shield className="w-6 h-6 fill-current" />
              </div>
              <div className="transition-opacity duration-300">
                <div className="text-base font-extrabold tracking-tight text-white leading-tight font-sans">
                  NETSAGE
                </div>
                <div className="text-[11px] text-slate-400 font-medium leading-none mt-0.5 whitespace-nowrap">
                  Network Troubleshooting
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={onToggleCollapse}
              className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white cursor-pointer hover:bg-blue-500 transition-all shrink-0"
              title="Expand Sidebar"
            >
              <Shield className="w-6 h-6 fill-current" />
            </div>
          )}

          {/* Sidebar Collapse Toggle Button */}
          {!isCollapsed && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Sidebar"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-2.5'
                } rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Panel Footer */}
      {!isCollapsed ? (
        <div className="p-4 m-3 rounded-2xl bg-[#121B38] border border-slate-800 space-y-3">
          <div className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
            SYSTEM STATUS
          </div>
          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Backend Online</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">AI Engine Ready</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Dataset Loaded</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">Packet Tracer Connected</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>NETSAGE AI v1.0.0</span>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-3 flex flex-col items-center justify-center space-y-2">
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl bg-[#121B38] border border-slate-800 flex items-center justify-center text-emerald-400 hover:text-white hover:bg-slate-800 transition-all"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </button>
        </div>
      )}
    </aside>
  );
}
