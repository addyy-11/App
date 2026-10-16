export type Priority = 'low' | 'medium' | 'high';
export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'submitted';

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  priority: Priority;
  status: AssignmentStatus;
  notes?: string;
  estimatedMinutes: number;
  reminderMinutesBefore: number; // e.g. 60, 1440 (1 day), 2880 (2 days)
  createdAt: string;
  completedAt?: string;
}

export type TopicStatus = 'needs_review' | 'familiar' | 'mastered';

export interface SyllabusTopic {
  id: string;
  name: string;
  status: TopicStatus;
  completed: boolean;
  notes?: string;
}

export interface Exam {
  id: string;
  name: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  examTime: string; // HH:mm
  location?: string;
  syllabusTopics: SyllabusTopic[];
  notes?: string;
  targetGrade?: string;
  reminderDaysBefore: number;
  createdAt: string;
}

export type TaskCategory = 'academic' | 'wellness' | 'personal' | 'revision';

export interface PersonalTask {
  id: string;
  title: string;
  category: TaskCategory;
  date: string; // YYYY-MM-DD
  time?: string;
  priority: Priority;
  completed: boolean;
  relatedId?: string; // id of assignment or exam if linked
  createdAt: string;
}

export type FocusModeType = 'pomodoro' | 'deep_work' | 'custom' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO
  durationMinutes: number;
  type: FocusModeType;
  subject?: string;
  completed: boolean;
  notes?: string;
}

export interface HydrationEntry {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  timestamp: string; // ISO
}

export interface WellnessEntry {
  date: string; // YYYY-MM-DD
  sleepHours: number;
  rating: number; // 1-5
  note?: string;
}

export interface AppSettings {
  userName: string;
  university: string;
  major: string;
  semester: string;
  theme: 'system' | 'light' | 'dark';
  soundEnabled: boolean;
  soundVolume: number; // 0.0 to 1.0
  notificationsEnabled: boolean;
  assignmentReminders: boolean;
  examReminders: boolean;
  hydrationReminders: boolean;
  hydrationIntervalMinutes: number;
  breakReminders: boolean;
  breakIntervalMinutes: number;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string; // HH:mm
  dailyWaterGoalMl: number;
  compactSidebar: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'assignment' | 'exam' | 'hydration' | 'break' | 'focus';
  read: boolean;
}

export type NavTab = 
  | 'home' 
  | 'planner' 
  | 'assignments' 
  | 'exams' 
  | 'focus' 
  | 'health' 
  | 'calendar' 
  | 'statistics' 
  | 'settings';
