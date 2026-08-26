import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  Calendar,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Shield,
  Key,
  LogOut,
  Check,
  Settings,
  AlertTriangle,
  Cpu,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function Header({
  activePageTitle = "Dashboard",
  searchQuery,
  setSearchQuery,
  isBackendOnline,
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
  onNavigate,
  notifications = [],
  setNotifications,
  onSelectCase
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeRole, setActiveRole] = useState('Senior Network Administrator');
  
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllRead = () => {
    if (setNotifications) {
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    }
  };

  const handleNotificationClick = (item) => {
    if (setNotifications) {
      setNotifications(prev =>
        prev.map(n => (n.id === item.id ? { ...n, unread: false } : n))
      );
    }
    setIsNotificationsOpen(false);
    if (item.caseId && onSelectCase) {
      onSelectCase(item.caseId);
    }
    if (onNavigate) {
      onNavigate('cases');
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs font-sans">
      {/* Sidebar Toggle & Page Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all border border-slate-200 shadow-2xs cursor-pointer"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-600" />
          )}
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {activePageTitle}
          </h1>
          <p className="text-xs text-slate-500 font-normal">
            Overview of your network troubleshooting system
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div
          onClick={onOpenSearch}
          className="relative w-full cursor-pointer group"
        >
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <input
            type="text"
            readOnly
            onClick={onOpenSearch}
            placeholder="Search cases, evidence, commands..."
            value={searchQuery}
            className="w-full bg-slate-100/80 border border-slate-200 rounded-lg pl-10 pr-20 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none cursor-pointer group-hover:bg-white group-hover:border-blue-400 transition-all font-sans font-medium"
          />
          <kbd className="absolute right-3 top-2 px-1.5 py-0.5 rounded bg-white text-[10px] font-mono text-slate-400 border border-slate-200 shadow-xs group-hover:border-blue-300">
            Ctrl + K
          </kbd>
        </div>
      </div>

      {/* Right Controls & User Info */}
      <div className="flex items-center space-x-3">
        {/* Date Filter Dropdown */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-xs cursor-pointer hover:bg-slate-50 transition-all">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>25 Aug 2026 - 25 Aug 2026</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Notification Bell with Dropdown Menu */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`relative p-2 rounded-lg transition-all cursor-pointer ${
              isNotificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    System Notifications
                  </h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification Item List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 ${
                        item.unread ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {item.type === 'alert' && (
                          <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === 'ai' && (
                          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                            <Cpu className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === 'review' && (
                          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === 'system' && (
                          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600">
                            <Shield className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-xs font-bold ${item.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                            {item.title}
                          </h5>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        {item.caseId && (
                          <div className="mt-1 flex items-center space-x-1 text-[10px] font-mono font-bold text-blue-600">
                            <span>Open {item.caseId}</span>
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
                <button
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    if (onNavigate) onNavigate('logs');
                  }}
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  View All System Logs & Activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Circle */}
        <button
          onClick={() => alert("NetSage AI Help Desk: Enterprise Cisco Network Troubleshooting Assistance v1.0")}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          title="Help & Support"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* System Online Badge */}
        <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{isBackendOnline ? 'System Online' : 'System Offline'}</span>
        </div>

        {/* User Profile Avatar with Dropdown */}
        <div className="relative pl-2 border-l border-slate-200" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-all cursor-pointer border border-transparent hover:border-slate-200"
          >
            {/* Clean SVG Avatar Badge */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-blue-400/30">
              <span>AD</span>
            </div>
            <div className="hidden xl:block text-left pr-1">
              <div className="text-xs font-extrabold text-slate-900 leading-tight">Admin</div>
              <div className="text-[10px] text-blue-600 font-bold leading-tight truncate max-w-[110px]">
                NOC Engineer
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
              {/* User Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-sm shadow-md">
                    AD
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">System Administrator</h4>
                    <p className="text-[11px] text-slate-500 truncate font-mono">admin@netsage.ai</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                      Superuser Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="p-2 space-y-1 text-xs text-slate-700 font-medium">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate('settings');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Account & System Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate('responsible-ai');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>Responsible AI Audit Log</span>
                </button>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    if (onNavigate) onNavigate('settings');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                >
                  <Key className="w-4 h-4 text-slate-500" />
                  <span>API Keys & Model Config</span>
                </button>
              </div>

              {/* Role Switcher */}
              <div className="p-3 bg-slate-50 border-t border-b border-slate-200 space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                  Active Role
                </div>
                <div className="space-y-1 text-[11px]">
                  {[
                    'Senior Network Engineer',
                    'NOC Tier-2 Specialist',
                    'AI System Auditor'
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => setActiveRole(role)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                        activeRole === role
                          ? 'bg-white font-bold text-blue-700 shadow-2xs border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-200/60'
                      }`}
                    >
                      <span>{role}</span>
                      {activeRole === role && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logout Footer */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    alert('Log Out simulated for Admin session.');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
