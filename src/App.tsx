/**
 * EduHealth Desktop — Premium All-in-One Student Productivity & Wellness App
 * @license Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { QuickAddModal } from './components/QuickAddModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

// Views
import { HomeDashboard } from './components/views/HomeDashboard';
import { DailyPlanner } from './components/views/DailyPlanner';
import { AssignmentManager } from './components/views/AssignmentManager';
import { ExamPlanner } from './components/views/ExamPlanner';
import { FocusTimer } from './components/views/FocusTimer';
import { HealthWellness } from './components/views/HealthWellness';
import { CalendarPlanner } from './components/views/CalendarPlanner';
import { StatisticsView } from './components/views/StatisticsView';
import { SettingsView } from './components/views/SettingsView';

const MainContent: React.FC = () => {
  const { currentTab } = useApp();

  const renderCurrentView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeDashboard />;
      case 'planner':
        return <DailyPlanner />;
      case 'assignments':
        return <AssignmentManager />;
      case 'exams':
        return <ExamPlanner />;
      case 'focus':
        return <FocusTimer />;
      case 'health':
        return <HealthWellness />;
      case 'calendar':
        return <CalendarPlanner />;
      case 'statistics':
        return <StatisticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="flex-1 h-[calc(100vh-2.75rem)] overflow-y-auto bg-neutral-50/50 dark:bg-neutral-950/40 text-neutral-900 dark:text-neutral-100">
      {renderCurrentView()}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 select-none">
        {/* macOS-style Window Chrome / TitleBar */}
        <TitleBar />

        {/* Workspace Canvas: Sidebar + Scrollable Content Viewport */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <MainContent />
        </div>

        {/* Global Dialogs & Modals */}
        <QuickAddModal />
        <GlobalSearchModal />
      </div>
    </AppProvider>
  );
}
