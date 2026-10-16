import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  GraduationCap, 
  Timer, 
  HeartPulse, 
  CalendarDays, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NavTab } from '../types';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Sidebar: React.FC = () => {
  const { 
    currentTab, 
    setCurrentTab, 
    settings, 
    updateSettings, 
    assignments, 
    exams, 
    getTodayHydrationTotal 
  } = useApp();

  const isCompact = settings.compactSidebar;

  const toggleCompact = () => {
    updateSettings({ compactSidebar: !isCompact });
  };

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: CheckSquare },
    { id: 'assignments', label: 'Assignments', icon: FileText },
    { id: 'exams', label: 'Exams', icon: GraduationCap },
    { id: 'focus', label: 'Focus Timer', icon: Timer },
    { id: 'health', label: 'Health & Water', icon: HeartPulse },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'statistics', label: 'Statistics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Calculate live badge counts
  const pendingAssignments = assignments.filter(a => a.status === 'not_started' || a.status === 'in_progress').length;
  const upcomingExams = exams.length;
  const waterProgress = Math.min(100, Math.round((getTodayHydrationTotal() / (settings.dailyWaterGoalMl || 2000)) * 100));

  const getBadge = (tabId: NavTab) => {
    if (tabId === 'assignments' && pendingAssignments > 0) {
      return (
        <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded font-medium ml-auto">
          {pendingAssignments}
        </span>
      );
    }
    if (tabId === 'exams' && upcomingExams > 0) {
      return (
        <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 rounded font-medium ml-auto">
          {upcomingExams}
        </span>
      );
    }
    if (tabId === 'health') {
      return (
        <span className="font-mono text-[10px] tabular-nums text-neutral-400 dark:text-neutral-500 ml-auto">
          {waterProgress}%
        </span>
      );
    }
    return null;
  };

  return (
    <aside 
      className={`h-[calc(100vh-2.75rem)] border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 backdrop-blur-md flex flex-col justify-between shrink-0 transition-all duration-200 select-none ${
        isCompact ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Branding & Navigation */}
      <div className="p-3">
        {/* Brand Lockup */}
        <div className={`flex items-center mb-4 px-2 py-1 ${isCompact ? 'justify-center' : 'justify-between'}`}>
          {!isCompact ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                EH
              </div>
              <div>
                <div className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
                  EduHealth
                </div>
                <div className="text-[10px] text-neutral-400">
                  Desktop Edition
                </div>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs" title="EduHealth Desktop">
              EH
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                title={isCompact ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/40'
                } ${isCompact ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-500'}`} />
                {!isCompact && (
                  <>
                    <span className="truncate">{item.label}</span>
                    {getBadge(item.id)}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Area & Collapse Toggle */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800">
        {!isCompact ? (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-semibold text-xs text-neutral-700 dark:text-neutral-300 shrink-0">
                {settings.userName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {settings.userName}
                </div>
                <div className="text-[10px] text-neutral-400 truncate">
                  {settings.university}
                </div>
              </div>
            </div>

            <button
              onClick={toggleCompact}
              title="Collapse sidebar"
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-7 h-7 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-semibold text-xs text-neutral-700 dark:text-neutral-300"
              title={`${settings.userName} (${settings.university})`}
            >
              {settings.userName.slice(0, 2).toUpperCase()}
            </div>
            <button
              onClick={toggleCompact}
              title="Expand sidebar"
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
