import React, { useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Volume2, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  Terminal, 
  FileCode,
  Laptop
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportBackupJSON, validateAndParseBackup, DEFAULT_SETTINGS } from '../../utils/storage';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    assignments, 
    exams, 
    tasks, 
    focusSessions, 
    hydration, 
    wellness, 
    notifications,
    resetAllData,
    loadSampleSemester,
    importBackup,
    requestDesktopPermission
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status banners
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  // Handle Export JSON Backup
  const handleExportBackup = () => {
    const payload = {
      settings,
      assignments,
      exams,
      tasks,
      focusSessions,
      hydration,
      wellness,
      notifications,
    };
    const jsonStr = exportBackupJSON(payload);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eduhealth-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle File Input Change for Backup Import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = validateAndParseBackup(content);
      if (res.success && res.data) {
        importBackup(res.data);
        setImportStatus({
          success: true,
          message: `Successfully restored ${res.data.assignments?.length || 0} assignments, ${res.data.exams?.length || 0} exams, and ${res.data.tasks?.length || 0} tasks.`,
        });
      } else {
        setImportStatus({
          success: false,
          message: res.error || 'Failed to parse backup file.',
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: 'Could not read file from disk.',
      });
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmReset = () => {
    resetAllData();
    setConfirmResetOpen(false);
  };

  const notifPermission = typeof window !== 'undefined' && 'Notification' in window 
    ? Notification.permission 
    : 'unsupported';

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Preferences &amp; System Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Configure notifications, quiet hours, sound feedback, student identity, and local backups.
        </p>
      </div>

      {/* Student Identity Card */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Student Profile &amp; Institution
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              Student Name
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => updateSettings({ userName: e.target.value })}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              University / College
            </label>
            <input
              type="text"
              value={settings.university}
              onChange={(e) => updateSettings({ university: e.target.value })}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              Major / Degree Program
            </label>
            <input
              type="text"
              value={settings.major}
              onChange={(e) => updateSettings({ major: e.target.value })}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
              Current Academic Term
            </label>
            <input
              type="text"
              value={settings.semester}
              onChange={(e) => updateSettings({ semester: e.target.value })}
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Visual Appearance & Theme */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Appearance &amp; Theme
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <button
            onClick={() => updateSettings({ theme: 'system' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.theme === 'system'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            System Default
          </button>
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            Light Mode
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-3 rounded-xl border text-center transition-all ${
              settings.theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            Dark Mode
          </button>
        </div>
      </div>

      {/* Notifications & Quiet Hours */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Desktop Notifications &amp; Reminders
            </h2>
          </div>

          {notifPermission !== 'granted' && (
            <button
              onClick={requestDesktopPermission}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors"
            >
              Request OS Permission
            </button>
          )}
        </div>

        <div className="text-xs text-neutral-500">
          OS Permission Status:{' '}
          <span className={`font-mono font-semibold ${notifPermission === 'granted' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
            {notifPermission.toUpperCase()}
          </span>
        </div>

        {/* Reminder Category Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.assignmentReminders}
              onChange={(e) => updateSettings({ assignmentReminders: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Assignment Deadline Alerts</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.examReminders}
              onChange={(e) => updateSettings({ examReminders: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Exam &amp; Revision Reminders</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.hydrationReminders}
              onChange={(e) => updateSettings({ hydrationReminders: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Hydration Drink Reminders</span>
          </label>

          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.breakReminders}
              onChange={(e) => updateSettings({ breakReminders: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600"
            />
            <span>Posture &amp; Eye Rest Reminders</span>
          </label>
        </div>

        {/* Quiet Hours */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
          <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Do Not Disturb / Quiet Hours
          </div>
          <p className="text-[11px] text-neutral-400">
            Suppress desktop audio and pop-ups while sleeping or attending quiet lecture periods.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-sm text-xs">
            <div>
              <label className="block text-neutral-500 mb-1">Start Time</label>
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => updateSettings({ quietHoursStart: e.target.value })}
                className="w-full px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
              />
            </div>
            <div>
              <label className="block text-neutral-500 mb-1">End Time</label>
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSettings({ quietHoursEnd: e.target.value })}
                className="w-full px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Audio & Synthesizer Feedback */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Sound Effects &amp; Audio Chimes
            </h2>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
            className="w-4 h-4 rounded text-indigo-600"
          />
        </div>

        <div className="text-xs space-y-2">
          <label className="block text-neutral-500">
            Synthesized Chime Volume ({Math.round(settings.soundVolume * 100)}%)
          </label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={settings.soundVolume}
            onChange={(e) => updateSettings({ soundVolume: Number(e.target.value) })}
            className="w-full max-w-sm accent-indigo-600"
          />
        </div>
      </div>

      {/* Local Storage & JSON Backup Management */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Local Data Storage &amp; Backup
          </h2>
        </div>

        <p className="text-xs text-neutral-500">
          All data is persisted in local offline storage on this machine. No cloud sync, registration, or telemetry is required.
        </p>

        {importStatus && (
          <div className={`p-3 rounded-lg text-xs ${importStatus.success ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'}`}>
            {importStatus.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {/* Export JSON */}
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-semibold rounded-md shadow-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import JSON */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3.5 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-800 dark:text-neutral-200 rounded-md transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restore from Backup</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />

          {/* Sample Semester Loader */}
          <button
            onClick={loadSampleSemester}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Load Sample Semester Data</span>
          </button>

          {/* Wipe All Data */}
          <button
            onClick={() => setConfirmResetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Data</span>
          </button>
        </div>
      </div>

      {/* Desktop Windows 10/11 Packaging & Standalone Run Guide */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-neutral-500" />
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Windows 10 / 11 Packaging &amp; Build Guide
          </h2>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          EduHealth Desktop is configured for direct Windows 64-bit compilation via Tauri or Electron.
        </p>

        <div className="bg-white dark:bg-neutral-900 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 space-y-1">
          <div className="text-neutral-400"># To compile standalone Windows .exe / MSI installer locally:</div>
          <div>npm run build</div>
          <div>npx tauri build # produces src-tauri/target/release/bundle/msi/EduHealth.msi</div>
          <div className="text-neutral-400 pt-1"># Or via Electron:</div>
          <div>npx electron-builder --win # outputs dist/EduHealth-Setup-1.0.0.exe</div>
        </div>

        <div className="text-xs text-neutral-500">
          Keyboard Shortcuts: <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-[10px]">Ctrl+N</kbd> (New item), <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-[10px]">Ctrl+F</kbd> (Search), <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-[10px]">Ctrl+,</kbd> (Settings), <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded text-[10px]">ESC</kbd> (Close dialog).
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {confirmResetOpen && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Factory Reset Application Data?</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              This will erase all stored assignments, exam syllabi, study logs, and hydration records from local storage.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmResetOpen(false)}
                className="px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-md shadow-xs"
              >
                Yes, Wipe Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
