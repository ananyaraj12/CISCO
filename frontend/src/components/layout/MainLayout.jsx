import React, { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import GlobalSearchModal from '../common/GlobalSearchModal';

export default function MainLayout({
  children,
  activePage,
  setActivePage,
  searchQuery,
  setSearchQuery,
  isBackendOnline,
  cases = [],
  onSelectCase,
  notifications = [],
  setNotifications
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const pageTitles = {
    dashboard: 'Dashboard',
    cases: 'Cases',
    evidence: 'Evidence Library',
    diagnosis: 'AI Diagnosis',
    review: 'Human Review',
    analytics: 'Analytics',
    'responsible-ai': 'Responsible AI',
    logs: 'AI Logs',
    settings: 'Settings'
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex font-sans selection:bg-blue-500 selection:text-white">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isBackendOnline={isBackendOnline}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header
          activePageTitle={pageTitles[activePage] || 'Dashboard'}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isBackendOnline={isBackendOnline}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigate={setActivePage}
          notifications={notifications}
          setNotifications={setNotifications}
          onSelectCase={onSelectCase}
        />
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden min-w-0 space-y-6">
          {children}
        </main>
      </div>

      {/* Global Interactive Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        cases={cases}
        onSelectCase={onSelectCase}
        onNavigate={setActivePage}
      />
    </div>
  );
}
