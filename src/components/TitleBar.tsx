import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  Laptop, 
  Check, 
  Trash2, 
  Clock, 
  ShieldCheck,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TitleBar: React.FC = () => {
  const { 
    currentTab, 
    settings, 
    updateSettings, 
    openQuickAdd, 
    setIsSearchOpen,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    requestDesktopPermission
  } = useApp();

  const [currentTime, setCurrentTime] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDateStr(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close notifications menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const cycleTheme = () => {
    const themes: Array<'system' | 'light' | 'dark'> = ['system', 'light', 'dark'];
    const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
    updateSettings({ theme: themes[nextIdx] });
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'home': return 'Dashboard Overview';
      case 'planner': return 'Daily Planner & Tasks';
      case 'assignments': return 'Assignment Manager';
      case 'exams': return 'Exam Preparation & Syllabus';
      case 'focus': return 'Deep Work & Study Timer';
      case 'health': return 'Hydration & Wellness Tracker';
      case 'calendar': return 'Academic Schedule';
      case 'statistics': return 'Progress & Analytics';
      case 'settings': return 'Preferences & Backup';
      default: return 'Overview';
    }
  };

  return (
    <header className="h-11 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md flex items-center justify-between px-3 shrink-0 select-none app-drag-region z-30">
      {/* Left Zone: macOS-Style Window Controls & Breadcrumb */}
      <div className="flex items-center gap-3 app-no-drag">
        {/* macOS Window dots (decorative/native simulation) */}
        <div className="flex items-center gap-1.5 px-1">
          <div 
            title="Close Window (Alt+F4)"
            className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer border border-rose-600/30"
          />
          <div 
            title="Minimize Window"
            className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer border border-amber-500/30"
          />
          <div 
            title="Maximize / Restore"
            className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer border border-emerald-600/30"
          />
        </div>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

        <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 tracking-tight">EduHealth</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span className="text-neutral-600 dark:text-neutral-300">{getTabLabel(currentTab)}</span>
        </div>
      </div>

      {/* Center Zone: Quick Search Bar Affordance */}
      <div className="flex items-center app-no-drag">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors border border-neutral-200/60 dark:border-neutral-700/60"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Search assignments, exams, tasks...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="hidden md:inline font-mono text-[10px] bg-white dark:bg-neutral-900 px-1 py-0.5 rounded border border-neutral-200 dark:border-neutral-700 text-neutral-400">
            Ctrl+F
          </kbd>
        </button>
      </div>

      {/* Right Zone: Quick Add, Clock, Theme, Notification Center */}
      <div className="flex items-center gap-2 app-no-drag">
        {/* Quick Add Button */}
        <button
          onClick={() => openQuickAdd('assignment')}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-md transition-colors shadow-xs"
          title="Quick Add (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New</span>
          <kbd className="hidden lg:inline text-[9px] bg-indigo-700/60 px-1 rounded text-indigo-100 font-mono">
            Ctrl+N
          </kbd>
        </button>

        <div className="h-4 w-[1px] bg-neutral-200 dark:bg-neutral-800" />

        {/* Date & Time display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono tabular-nums px-1">
          <Clock className="w-3 h-3 text-neutral-400" />
          <span>{currentDateStr}</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>{currentTime}</span>
        </div>

        {/* Theme Cycler */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${settings.theme} (Click to switch)`}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
        >
          {settings.theme === 'light' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : settings.theme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Laptop className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 relative text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
            title="Notifications & Reminders"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-3 z-50 text-neutral-900 dark:text-neutral-100 text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1.5 font-semibold text-neutral-800 dark:text-neutral-200">
                  <Bell className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[10px]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Notification Permission Banner if not enabled */}
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                <div className="mb-2 p-2 bg-neutral-50 dark:bg-neutral-800/80 rounded border border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Desktop Notifications</span>
                  </div>
                  <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Enable native desktop alerts for assignment deadlines, exams, and break reminders.
                  </p>
                  <button
                    onClick={requestDesktopPermission}
                    className="mt-1.5 px-2 py-0.8 bg-indigo-600 text-white rounded font-medium text-[10px] hover:bg-indigo-500 transition-colors"
                  >
                    Enable Notifications
                  </button>
                </div>
              )}

              {/* Notification list */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-neutral-400 text-xs">
                    No new reminders or notifications
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div
                      key={notif.id}
                      className={`p-2 rounded border transition-colors ${
                        notif.read 
                          ? 'border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20 text-neutral-500' 
                          : 'border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 text-neutral-800 dark:text-neutral-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-medium text-xs leading-tight">{notif.title}</span>
                        {!notif.read && (
                          <button
                            onClick={() => markNotificationAsRead(notif.id)}
                            title="Mark as read"
                            className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5 leading-snug">
                        {notif.message}
                      </p>
                      <span className="text-[10px] font-mono text-neutral-400 mt-1 block">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
