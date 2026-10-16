import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Assignment, 
  Exam, 
  PersonalTask, 
  FocusSession, 
  HydrationEntry, 
  WellnessEntry, 
  AppSettings, 
  AppNotification, 
  NavTab,
  TopicStatus
} from '../types';
import { 
  loadStoredData, 
  saveStoredData, 
  generateSampleData, 
  DEFAULT_SETTINGS, 
  getTodayDateString 
} from '../utils/storage';
import { sendDesktopNotification, requestNotificationPermission } from '../utils/notifications';
import { soundManager } from '../utils/audio';

interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  
  // Assignments
  assignments: Assignment[];
  addAssignment: (item: Omit<Assignment, 'id' | 'createdAt'>) => void;
  updateAssignment: (id: string, item: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleAssignmentComplete: (id: string) => void;
  markAssignmentSubmitted: (id: string) => void;
  
  // Exams
  exams: Exam[];
  addExam: (item: Omit<Exam, 'id' | 'createdAt'>) => void;
  updateExam: (id: string, item: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  toggleExamTopicStatus: (examId: string, topicId: string, status?: TopicStatus) => void;
  addExamTopic: (examId: string, topicName: string) => void;
  deleteExamTopic: (examId: string, topicId: string) => void;
  
  // Tasks
  tasks: PersonalTask[];
  addTask: (item: Omit<PersonalTask, 'id' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  
  // Focus Sessions
  focusSessions: FocusSession[];
  logFocusSession: (session: Omit<FocusSession, 'id'>) => void;
  
  // Hydration
  hydration: HydrationEntry[];
  logWater: (amountMl: number) => void;
  undoLastHydration: () => void;
  getTodayHydrationTotal: () => number;
  
  // Wellness
  wellness: WellnessEntry[];
  logWellness: (entry: WellnessEntry) => void;
  getTodayWellness: () => WellnessEntry | undefined;
  
  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (title: string, message: string, category: AppNotification['category']) => void;
  requestDesktopPermission: () => Promise<void>;
  
  // Modals & Search
  isQuickAddOpen: boolean;
  quickAddInitialType: 'assignment' | 'exam' | 'task' | 'hydration';
  openQuickAdd: (type?: 'assignment' | 'exam' | 'task' | 'hydration') => void;
  closeQuickAdd: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Management
  resetAllData: () => void;
  loadSampleSemester: () => void;
  importBackup: (backupData: any) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => loadStoredData());

  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [settings, setSettings] = useState<AppSettings>(initialData.settings);
  const [assignments, setAssignments] = useState<Assignment[]>(initialData.assignments);
  const [exams, setExams] = useState<Exam[]>(initialData.exams);
  const [tasks, setTasks] = useState<PersonalTask[]>(initialData.tasks);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(initialData.focusSessions);
  const [hydration, setHydration] = useState<HydrationEntry[]>(initialData.hydration);
  const [wellness, setWellness] = useState<WellnessEntry[]>(initialData.wellness);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialData.notifications);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddInitialType, setQuickAddInitialType] = useState<'assignment' | 'exam' | 'task' | 'hydration'>('assignment');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Sync to local storage on changes
  useEffect(() => {
    saveStoredData({
      settings,
      assignments,
      exams,
      tasks,
      focusSessions,
      hydration,
      wellness,
      notifications
    });
  }, [settings, assignments, exams, tasks, focusSessions, hydration, wellness, notifications]);

  // Handle Theme application
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (settings.theme === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        if (mediaQuery.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [settings.theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, textarea, or contentEditable, avoid triggering navigation shortcuts
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Ctrl + N or Cmd + N -> New Task/Item
      if ((e.ctrlKey || e.metaKey) && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        setQuickAddInitialType('assignment');
        setIsQuickAddOpen(true);
        return;
      }

      // Ctrl + F or Cmd + F -> Global Search
      if ((e.ctrlKey || e.metaKey) && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Ctrl + , -> Settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        setCurrentTab('settings');
        return;
      }

      // Escape -> close open modals
      if (e.key === 'Escape') {
        if (isQuickAddOpen) setIsQuickAddOpen(false);
        if (isSearchOpen) setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQuickAddOpen, isSearchOpen]);

  // Periodic Reminder Checker (Deadlines, Hydration, Break)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = getTodayDateString();

      // Check overdue or upcoming assignments due today
      if (settings.assignmentReminders) {
        assignments.forEach(asg => {
          if (asg.status !== 'completed' && asg.status !== 'submitted' && asg.dueDate === todayStr) {
            const [dueH, dueM] = (asg.dueTime || '23:59').split(':').map(Number);
            const dueMinutes = dueH * 60 + dueM;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const diff = dueMinutes - currentMinutes;

            if (diff > 0 && diff <= 120 && diff % 30 === 0) {
              const msg = `"${asg.title}" is due in ${Math.round(diff)} minutes!`;
              sendDesktopNotification('Assignment Due Soon', {
                body: msg,
                tag: `asg-reminder-${asg.id}`,
                category: 'assignment',
                settings,
              });
            }
          }
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [assignments, settings]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const addNotification = useCallback((title: string, message: string, category: AppNotification['category']) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: new Date().toISOString(),
      category,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]);
    sendDesktopNotification(title, {
      body: message,
      category,
      settings
    });
  }, [settings]);

  // Assignments Handlers
  const addAssignment = useCallback((item: Omit<Assignment, 'id' | 'createdAt'>) => {
    const newAsg: Assignment = {
      ...item,
      id: 'asg-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setAssignments(prev => [newAsg, ...prev]);
    addNotification('New Assignment Created', `"${newAsg.title}" due ${newAsg.dueDate}`, 'assignment');
    if (settings.soundEnabled) soundManager.playTaskCompleted(settings.soundVolume);
  }, [addNotification, settings.soundEnabled, settings.soundVolume]);

  const updateAssignment = useCallback((id: string, item: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, ...item } : a));
  }, []);

  const deleteAssignment = useCallback((id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  }, []);

  const toggleAssignmentComplete = useCallback((id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const isDone = a.status === 'completed' || a.status === 'submitted';
        const newStatus = isDone ? 'in_progress' : 'completed';
        if (!isDone && settings.soundEnabled) {
          soundManager.playTaskCompleted(settings.soundVolume);
        }
        return {
          ...a,
          status: newStatus,
          completedAt: !isDone ? new Date().toISOString() : undefined
        };
      }
      return a;
    }));
  }, [settings.soundEnabled, settings.soundVolume]);

  const markAssignmentSubmitted = useCallback((id: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        if (settings.soundEnabled) soundManager.playTaskCompleted(settings.soundVolume);
        return {
          ...a,
          status: 'submitted',
          completedAt: a.completedAt || new Date().toISOString()
        };
      }
      return a;
    }));
  }, [settings.soundEnabled, settings.soundVolume]);

  // Exam Handlers
  const addExam = useCallback((item: Omit<Exam, 'id' | 'createdAt'>) => {
    const newExam: Exam = {
      ...item,
      id: 'exam-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setExams(prev => [newExam, ...prev]);
    addNotification('Exam Added to Calendar', `${newExam.name} scheduled for ${newExam.examDate}`, 'exam');
  }, [addNotification]);

  const updateExam = useCallback((id: string, item: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...item } : e));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
  }, []);

  const toggleExamTopicStatus = useCallback((examId: string, topicId: string, status?: TopicStatus) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          syllabusTopics: e.syllabusTopics.map(t => {
            if (t.id === topicId) {
              if (status) {
                return { ...t, status, completed: status === 'mastered' };
              }
              const nextStatus: TopicStatus = 
                t.status === 'needs_review' ? 'familiar' :
                t.status === 'familiar' ? 'mastered' : 'needs_review';
              return { ...t, status: nextStatus, completed: nextStatus === 'mastered' };
            }
            return t;
          })
        };
      }
      return e;
    }));
  }, []);

  const addExamTopic = useCallback((examId: string, topicName: string) => {
    if (!topicName.trim()) return;
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        const newTopic = {
          id: 'top-' + Date.now(),
          name: topicName.trim(),
          status: 'needs_review' as TopicStatus,
          completed: false
        };
        return {
          ...e,
          syllabusTopics: [...e.syllabusTopics, newTopic]
        };
      }
      return e;
    }));
  }, []);

  const deleteExamTopic = useCallback((examId: string, topicId: string) => {
    setExams(prev => prev.map(e => {
      if (e.id === examId) {
        return {
          ...e,
          syllabusTopics: e.syllabusTopics.filter(t => t.id !== topicId)
        };
      }
      return e;
    }));
  }, []);

  // Tasks Handlers
  const addTask = useCallback((item: Omit<PersonalTask, 'id' | 'createdAt'>) => {
    const newTask: PersonalTask = {
      ...item,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    if (settings.soundEnabled) soundManager.playTaskCompleted(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const next = !t.completed;
        if (next && settings.soundEnabled) {
          soundManager.playTaskCompleted(settings.soundVolume);
        }
        return { ...t, completed: next };
      }
      return t;
    }));
  }, [settings.soundEnabled, settings.soundVolume]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  // Focus Handlers
  const logFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: 'foc-' + Date.now(),
    };
    setFocusSessions(prev => [newSession, ...prev]);
    addNotification('Study Session Completed', `${session.durationMinutes} minutes logged for ${session.subject || 'General Study'}.`, 'focus');
    if (settings.soundEnabled) soundManager.playTimerComplete(settings.soundVolume);
  }, [addNotification, settings.soundEnabled, settings.soundVolume]);

  // Hydration Handlers
  const logWater = useCallback((amountMl: number) => {
    const entry: HydrationEntry = {
      id: 'hyd-' + Date.now(),
      date: getTodayDateString(),
      amountMl,
      timestamp: new Date().toISOString(),
    };
    setHydration(prev => [entry, ...prev]);
    if (settings.soundEnabled) soundManager.playHydrationLogged(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  const undoLastHydration = useCallback(() => {
    const today = getTodayDateString();
    setHydration(prev => {
      const index = prev.findIndex(h => h.date === today);
      if (index === -1) return prev;
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  }, []);

  const getTodayHydrationTotal = useCallback(() => {
    const today = getTodayDateString();
    return hydration
      .filter(h => h.date === today)
      .reduce((sum, item) => sum + item.amountMl, 0);
  }, [hydration]);

  // Wellness Handlers
  const logWellness = useCallback((entry: WellnessEntry) => {
    setWellness(prev => {
      const filtered = prev.filter(w => w.date !== entry.date);
      return [entry, ...filtered];
    });
  }, []);

  const getTodayWellness = useCallback(() => {
    const today = getTodayDateString();
    return wellness.find(w => w.date === today);
  }, [wellness]);

  // Notification Handlers
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const requestDesktopPermission = useCallback(async () => {
    const perm = await requestNotificationPermission();
    if (perm === 'granted') {
      updateSettings({ notificationsEnabled: true });
      addNotification('Notifications Enabled', 'You will receive reminders for assignments, exams, and wellness.', 'break');
    }
  }, [updateSettings, addNotification]);

  // Modal triggers
  const openQuickAdd = useCallback((type?: 'assignment' | 'exam' | 'task' | 'hydration') => {
    if (type) setQuickAddInitialType(type);
    setIsQuickAddOpen(true);
  }, []);

  const closeQuickAdd = useCallback(() => {
    setIsQuickAddOpen(false);
  }, []);

  // System Resets & Backups
  const resetAllData = useCallback(() => {
    setAssignments([]);
    setExams([]);
    setTasks([]);
    setFocusSessions([]);
    setHydration([]);
    setWellness([]);
    setNotifications([]);
    setSettings(DEFAULT_SETTINGS);
    localStorage.clear();
  }, []);

  const loadSampleSemester = useCallback(() => {
    const sample = generateSampleData();
    setAssignments(sample.assignments);
    setExams(sample.exams);
    setTasks(sample.tasks);
    setFocusSessions(sample.focusSessions);
    setHydration(sample.hydration);
    setWellness(sample.wellness);
    setNotifications(sample.notifications);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const importBackup = useCallback((backupData: any) => {
    if (backupData.settings) setSettings(backupData.settings);
    if (backupData.assignments) setAssignments(backupData.assignments);
    if (backupData.exams) setExams(backupData.exams);
    if (backupData.tasks) setTasks(backupData.tasks);
    if (backupData.focusSessions) setFocusSessions(backupData.focusSessions);
    if (backupData.hydration) setHydration(backupData.hydration);
    if (backupData.wellness) setWellness(backupData.wellness);
    if (backupData.notifications) setNotifications(backupData.notifications);
  }, []);

  const value = useMemo(() => ({
    currentTab,
    setCurrentTab,
    settings,
    updateSettings,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentComplete,
    markAssignmentSubmitted,
    exams,
    addExam,
    updateExam,
    deleteExam,
    toggleExamTopicStatus,
    addExamTopic,
    deleteExamTopic,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    focusSessions,
    logFocusSession,
    hydration,
    logWater,
    undoLastHydration,
    getTodayHydrationTotal,
    wellness,
    logWellness,
    getTodayWellness,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    addNotification,
    requestDesktopPermission,
    isQuickAddOpen,
    quickAddInitialType,
    openQuickAdd,
    closeQuickAdd,
    isSearchOpen,
    setIsSearchOpen,
    resetAllData,
    loadSampleSemester,
    importBackup,
  }), [
    currentTab,
    settings,
    updateSettings,
    assignments,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    toggleAssignmentComplete,
    markAssignmentSubmitted,
    exams,
    addExam,
    updateExam,
    deleteExam,
    toggleExamTopicStatus,
    addExamTopic,
    deleteExamTopic,
    tasks,
    addTask,
    toggleTask,
    deleteTask,
    focusSessions,
    logFocusSession,
    hydration,
    logWater,
    undoLastHydration,
    getTodayHydrationTotal,
    wellness,
    logWellness,
    getTodayWellness,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    addNotification,
    requestDesktopPermission,
    isQuickAddOpen,
    quickAddInitialType,
    openQuickAdd,
    closeQuickAdd,
    isSearchOpen,
    setIsSearchOpen,
    resetAllData,
    loadSampleSemester,
    importBackup,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
