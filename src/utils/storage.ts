import { 
  Assignment, 
  Exam, 
  PersonalTask, 
  FocusSession, 
  HydrationEntry, 
  WellnessEntry, 
  AppSettings,
  AppNotification 
} from '../types';

export const DEFAULT_SETTINGS: AppSettings = {
  userName: 'Alex Chen',
  university: 'Imperial College London',
  major: 'Computer Science & AI',
  semester: 'Fall Semester 2026',
  theme: 'system',
  soundEnabled: true,
  soundVolume: 0.6,
  notificationsEnabled: true,
  assignmentReminders: true,
  examReminders: true,
  hydrationReminders: true,
  hydrationIntervalMinutes: 60,
  breakReminders: true,
  breakIntervalMinutes: 50,
  quietHoursStart: '22:30',
  quietHoursEnd: '07:30',
  dailyWaterGoalMl: 2200,
  compactSidebar: false,
};

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSampleData() {
  const today = getTodayDateString();
  const now = new Date();
  
  // Future dates helper
  const addDays = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const sampleAssignments: Assignment[] = [
    {
      id: 'asg-1',
      title: 'Distributed Systems Raft Consensus Protocol',
      subject: 'Distributed Computing',
      description: 'Implement leader election and log replication with unit tests and simulated network partition cases.',
      dueDate: addDays(2),
      dueTime: '23:59',
      priority: 'high',
      status: 'in_progress',
      notes: 'Make sure heartbeat RPC timer is randomized between 150ms and 300ms.',
      estimatedMinutes: 240,
      reminderMinutesBefore: 1440,
      createdAt: addDays(-4),
    },
    {
      id: 'asg-2',
      title: 'Operating Systems Virtual Memory Manager',
      subject: 'Operating Systems',
      description: 'Design multi-level page tables with TLB caching and LRU page replacement algorithm in C++.',
      dueDate: addDays(5),
      dueTime: '17:00',
      priority: 'high',
      status: 'not_started',
      notes: 'Run Valgrind to check for memory leaks before final submission.',
      estimatedMinutes: 300,
      reminderMinutesBefore: 2880,
      createdAt: addDays(-2),
    },
    {
      id: 'asg-3',
      title: 'Machine Learning Term Paper Literature Review',
      subject: 'Machine Learning',
      description: 'Summarize 5 recent papers on State Space Models (Mamba) vs Attention Transformer scaling.',
      dueDate: addDays(8),
      dueTime: '23:59',
      priority: 'medium',
      status: 'in_progress',
      notes: 'Focus on context window quadratic cost vs linear time recurrence.',
      estimatedMinutes: 180,
      reminderMinutesBefore: 1440,
      createdAt: addDays(-3),
    },
    {
      id: 'asg-4',
      title: 'Database Normalization & B+ Tree Indexing Problem Set',
      subject: 'Database Systems',
      description: 'Solve practice problems on BCNF decomposition and write SQL execution plan traces.',
      dueDate: addDays(-1), // overdue demonstration
      dueTime: '23:59',
      priority: 'medium',
      status: 'not_started',
      notes: 'Double check question 4 on dependency preservation.',
      estimatedMinutes: 120,
      reminderMinutesBefore: 60,
      createdAt: addDays(-6),
    },
    {
      id: 'asg-5',
      title: 'Linear Algebra Lab 3: Eigenvalue Spectral Clustering',
      subject: 'Applied Mathematics',
      description: 'Construct graph Laplacian matrix and compute first k eigenvectors for cluster partitioning.',
      dueDate: addDays(-3),
      dueTime: '18:00',
      priority: 'low',
      status: 'submitted',
      notes: 'Submitted via Canvas portal.',
      estimatedMinutes: 90,
      reminderMinutesBefore: 1440,
      createdAt: addDays(-8),
      completedAt: addDays(-3),
    }
  ];

  const sampleExams: Exam[] = [
    {
      id: 'exam-1',
      name: 'Midterm Examination: Algorithms & Complexity',
      subject: 'Algorithms',
      examDate: addDays(6),
      examTime: '10:00',
      location: 'Lecture Hall 4B / Central Quad',
      reminderDaysBefore: 3,
      targetGrade: 'A / 90%+',
      notes: 'Closed book. Permitted one double-sided A4 reference sheet.',
      createdAt: addDays(-14),
      syllabusTopics: [
        { id: 'top-1', name: 'Master Theorem & Divide-and-Conquer Recurrences', status: 'mastered', completed: true },
        { id: 'top-2', name: 'Dynamic Programming: Knapsack & Longest Common Subsequence', status: 'mastered', completed: true },
        { id: 'top-3', name: 'Greedy Algorithms: Huffman Coding & Matroids', status: 'familiar', completed: true },
        { id: 'top-4', name: 'Graph Theory: Bellman-Ford & Floyd-Warshall AP-SP', status: 'familiar', completed: false },
        { id: 'top-5', name: 'Network Flow: Ford-Fulkerson & Max-Flow Min-Cut Theorem', status: 'needs_review', completed: false },
        { id: 'top-6', name: 'NP-Completeness Reductions: 3-SAT to CLIQUE & VERTEX-COVER', status: 'needs_review', completed: false },
      ]
    },
    {
      id: 'exam-2',
      name: 'Computer Architecture & Microprocessors Final',
      subject: 'Computer Architecture',
      examDate: addDays(18),
      examTime: '14:00',
      location: 'South Kensington Exam Hall C',
      reminderDaysBefore: 5,
      targetGrade: 'A+',
      notes: 'Calculator allowed. Bring pencil for timing diagrams.',
      createdAt: addDays(-10),
      syllabusTopics: [
        { id: 'top-21', name: 'RISC-V 5-Stage Pipelining & Hazard Handling', status: 'mastered', completed: true },
        { id: 'top-22', name: 'Branch Prediction (2-Bit Saturating Counters, Tournament)', status: 'familiar', completed: true },
        { id: 'top-23', name: 'Cache Coherence Protocols (MESI & MOESI)', status: 'needs_review', completed: false },
        { id: 'top-24', name: 'Out-of-Order Execution & Tomasulo Algorithm', status: 'needs_review', completed: false },
      ]
    }
  ];

  const sampleTasks: PersonalTask[] = [
    {
      id: 'task-1',
      title: 'Review Raft paper section 5.2 on election timer logic',
      category: 'academic',
      date: today,
      time: '11:00',
      priority: 'high',
      completed: true,
      createdAt: today,
    },
    {
      id: 'task-2',
      title: 'Practice 3 network flow sample problems from Tutorial 4',
      category: 'revision',
      date: today,
      time: '14:30',
      priority: 'high',
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-3',
      title: '15-minute afternoon outdoor walk & posture stretch',
      category: 'wellness',
      date: today,
      time: '16:00',
      priority: 'medium',
      completed: true,
      createdAt: today,
    },
    {
      id: 'task-4',
      title: 'Return library textbook on Database Internals',
      category: 'personal',
      date: today,
      time: '17:30',
      priority: 'low',
      completed: false,
      createdAt: today,
    },
    {
      id: 'task-5',
      title: 'Solve past exam paper (2025 Algorithms Q2 & Q3)',
      category: 'revision',
      date: addDays(1),
      time: '10:00',
      priority: 'high',
      completed: false,
      createdAt: today,
    }
  ];

  const sampleHydration: HydrationEntry[] = [
    { id: 'hyd-1', date: today, amountMl: 250, timestamp: new Date(now.getTime() - 4 * 3600000).toISOString() },
    { id: 'hyd-2', date: today, amountMl: 500, timestamp: new Date(now.getTime() - 2.5 * 3600000).toISOString() },
    { id: 'hyd-3', date: today, amountMl: 250, timestamp: new Date(now.getTime() - 1 * 3600000).toISOString() },
    { id: 'hyd-4', date: today, amountMl: 250, timestamp: new Date(now.getTime() - 0.3 * 3600000).toISOString() },
  ];

  const sampleFocusSessions: FocusSession[] = [
    {
      id: 'foc-1',
      date: today,
      startTime: new Date(now.getTime() - 3 * 3600000).toISOString(),
      durationMinutes: 50,
      type: 'deep_work',
      subject: 'Distributed Computing',
      completed: true,
      notes: 'Drafted heartbeat RPC and leader term transition.',
    },
    {
      id: 'foc-2',
      date: today,
      startTime: new Date(now.getTime() - 1.5 * 3600000).toISOString(),
      durationMinutes: 25,
      type: 'pomodoro',
      subject: 'Algorithms',
      completed: true,
      notes: 'Reviewed Floyd-Warshall pseudo code and dynamic programming matrix.',
    },
    {
      id: 'foc-3',
      date: addDays(-1),
      startTime: new Date(now.getTime() - 27 * 3600000).toISOString(),
      durationMinutes: 50,
      type: 'deep_work',
      subject: 'Machine Learning',
      completed: true,
      notes: 'Annotated SSM state expansion equations.',
    },
    {
      id: 'foc-4',
      date: addDays(-2),
      startTime: new Date(now.getTime() - 52 * 3600000).toISOString(),
      durationMinutes: 50,
      type: 'deep_work',
      subject: 'Distributed Computing',
      completed: true,
    },
    {
      id: 'foc-5',
      date: addDays(-3),
      startTime: new Date(now.getTime() - 76 * 3600000).toISOString(),
      durationMinutes: 25,
      type: 'pomodoro',
      subject: 'Applied Mathematics',
      completed: true,
    }
  ];

  const sampleWellness: WellnessEntry[] = [
    { date: today, sleepHours: 7.5, rating: 4, note: 'Slept well, felt focused during morning study session.' },
    { date: addDays(-1), sleepHours: 6.8, rating: 3, note: 'Slight fatigue in the evening, took a 20 min walk.' },
    { date: addDays(-2), sleepHours: 8.0, rating: 5, note: 'High energy day, cleared major assignments.' },
  ];

  const sampleNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      title: 'Approaching Assignment Deadline',
      message: 'Distributed Systems Raft Consensus Protocol is due in 2 days.',
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      category: 'assignment',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Hydration Reminder',
      message: 'You have logged 1,250 ml today. Grab a fresh glass of water to reach your 2,200 ml target.',
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
      category: 'hydration',
      read: false,
    }
  ];

  return {
    assignments: sampleAssignments,
    exams: sampleExams,
    tasks: sampleTasks,
    hydration: sampleHydration,
    focusSessions: sampleFocusSessions,
    wellness: sampleWellness,
    notifications: sampleNotifications,
  };
}

const STORAGE_KEYS = {
  SETTINGS: 'eduhealth_settings_v1',
  ASSIGNMENTS: 'eduhealth_assignments_v1',
  EXAMS: 'eduhealth_exams_v1',
  TASKS: 'eduhealth_tasks_v1',
  FOCUS: 'eduhealth_focus_v1',
  HYDRATION: 'eduhealth_hydration_v1',
  WELLNESS: 'eduhealth_wellness_v1',
  NOTIFICATIONS: 'eduhealth_notifications_v1',
};

export function loadStoredData() {
  if (typeof window === 'undefined') {
    return {
      settings: DEFAULT_SETTINGS,
      ...generateSampleData()
    };
  }

  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const rawAssignments = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
    const rawExams = localStorage.getItem(STORAGE_KEYS.EXAMS);
    const rawTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    const rawFocus = localStorage.getItem(STORAGE_KEYS.FOCUS);
    const rawHydration = localStorage.getItem(STORAGE_KEYS.HYDRATION);
    const rawWellness = localStorage.getItem(STORAGE_KEYS.WELLNESS);
    const rawNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);

    // If first launch ever, initialize with sample student semester
    if (!rawSettings && !rawAssignments) {
      const sample = generateSampleData();
      saveStoredData({
        settings: DEFAULT_SETTINGS,
        ...sample
      });
      return {
        settings: DEFAULT_SETTINGS,
        ...sample
      };
    }

    return {
      settings: rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS,
      assignments: rawAssignments ? JSON.parse(rawAssignments) : [],
      exams: rawExams ? JSON.parse(rawExams) : [],
      tasks: rawTasks ? JSON.parse(rawTasks) : [],
      focusSessions: rawFocus ? JSON.parse(rawFocus) : [],
      hydration: rawHydration ? JSON.parse(rawHydration) : [],
      wellness: rawWellness ? JSON.parse(rawWellness) : [],
      notifications: rawNotifs ? JSON.parse(rawNotifs) : [],
    };
  } catch (err) {
    console.error('Failed reading stored local data:', err);
    return {
      settings: DEFAULT_SETTINGS,
      ...generateSampleData()
    };
  }
}

export function saveStoredData(data: {
  settings?: AppSettings;
  assignments?: Assignment[];
  exams?: Exam[];
  tasks?: PersonalTask[];
  focusSessions?: FocusSession[];
  hydration?: HydrationEntry[];
  wellness?: WellnessEntry[];
  notifications?: AppNotification[];
}) {
  if (typeof window === 'undefined') return;

  try {
    if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    if (data.assignments) localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
    if (data.exams) localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(data.exams));
    if (data.tasks) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
    if (data.focusSessions) localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(data.focusSessions));
    if (data.hydration) localStorage.setItem(STORAGE_KEYS.HYDRATION, JSON.stringify(data.hydration));
    if (data.wellness) localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(data.wellness));
    if (data.notifications) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export function exportBackupJSON(data: Record<string, unknown>): string {
  const payload = {
    app: 'EduHealth Desktop',
    version: '1.2.0',
    exportDate: new Date().toISOString(),
    payload: data,
  };
  return JSON.stringify(payload, null, 2);
}

export function validateAndParseBackup(jsonString: string): { success: boolean; data?: any; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, error: 'File is not a valid JSON object.' };
    }

    const payload = parsed.payload || parsed;
    if (!payload.assignments && !payload.exams && !payload.tasks && !payload.settings) {
      return { success: false, error: 'Unrecognized schema: Missing EduHealth core records.' };
    }

    return {
      success: true,
      data: {
        settings: payload.settings || DEFAULT_SETTINGS,
        assignments: Array.isArray(payload.assignments) ? payload.assignments : [],
        exams: Array.isArray(payload.exams) ? payload.exams : [],
        tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
        focusSessions: Array.isArray(payload.focusSessions) ? payload.focusSessions : [],
        hydration: Array.isArray(payload.hydration) ? payload.hydration : [],
        wellness: Array.isArray(payload.wellness) ? payload.wellness : [],
        notifications: Array.isArray(payload.notifications) ? payload.notifications : [],
      }
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid JSON formatting.';
    return { success: false, error: errorMsg };
  }
}
