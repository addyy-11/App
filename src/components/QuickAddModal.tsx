import React, { useState, useEffect } from 'react';
import { X, FileText, GraduationCap, CheckSquare, Droplets, Clock, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Priority, TaskCategory } from '../types';
import { getTodayDateString } from '../utils/storage';

export const QuickAddModal: React.FC = () => {
  const { 
    isQuickAddOpen, 
    closeQuickAdd, 
    quickAddInitialType, 
    addAssignment, 
    addExam, 
    addTask, 
    logWater 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'assignment' | 'exam' | 'task' | 'hydration'>('assignment');

  // Form states
  const today = getTodayDateString();

  // Assignment form
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState('');
  const [asgDueDate, setAsgDueDate] = useState(today);
  const [asgDueTime, setAsgDueTime] = useState('23:59');
  const [asgPriority, setAsgPriority] = useState<Priority>('medium');
  const [asgEstMins, setAsgEstMins] = useState(120);
  const [asgDescription, setAsgDescription] = useState('');
  const [asgReminderMinutes, setAsgReminderMinutes] = useState(1440); // 1 day

  // Exam form
  const [examName, setExamName] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState(today);
  const [examTime, setExamTime] = useState('09:00');
  const [examLocation, setExamLocation] = useState('');
  const [examTargetGrade, setExamTargetGrade] = useState('A');
  const [examReminderDays, setExamReminderDays] = useState(3);
  const [examInitialTopics, setExamInitialTopics] = useState('');

  // Task form
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('academic');
  const [taskDate, setTaskDate] = useState(today);
  const [taskTime, setTaskTime] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');

  // Hydration form
  const [customWaterMl, setCustomWaterMl] = useState(250);

  useEffect(() => {
    if (isQuickAddOpen) {
      setActiveTab(quickAddInitialType);
    }
  }, [isQuickAddOpen, quickAddInitialType]);

  if (!isQuickAddOpen) return null;

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim()) return;

    addAssignment({
      title: asgTitle.trim(),
      subject: asgSubject.trim() || 'General Course',
      description: asgDescription.trim(),
      dueDate: asgDueDate,
      dueTime: asgDueTime,
      priority: asgPriority,
      status: 'not_started',
      estimatedMinutes: Number(asgEstMins) || 60,
      reminderMinutesBefore: Number(asgReminderMinutes),
      notes: '',
    });

    // Reset & close
    setAsgTitle('');
    setAsgSubject('');
    setAsgDescription('');
    closeQuickAdd();
  };

  const handleExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    const topicsList = examInitialTopics
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((name, idx) => ({
        id: `top-${Date.now()}-${idx}`,
        name,
        status: 'needs_review' as const,
        completed: false,
      }));

    addExam({
      name: examName.trim(),
      subject: examSubject.trim() || 'Major Exam',
      examDate,
      examTime,
      location: examLocation.trim() || 'Exam Hall',
      targetGrade: examTargetGrade,
      reminderDaysBefore: Number(examReminderDays),
      syllabusTopics: topicsList,
      notes: '',
    });

    setExamName('');
    setExamSubject('');
    setExamInitialTopics('');
    closeQuickAdd();
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle.trim(),
      category: taskCategory,
      date: taskDate,
      time: taskTime || undefined,
      priority: taskPriority,
      completed: false,
    });

    setTaskTitle('');
    closeQuickAdd();
  };

  const handleWaterSubmit = (amount: number) => {
    logWater(amount);
    closeQuickAdd();
  };

  return (
    <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800">
          <div className="font-semibold text-sm">Quick Add Item</div>
          <button 
            onClick={closeQuickAdd}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-neutral-100 dark:border-neutral-800 p-1.5 gap-1 bg-neutral-50 dark:bg-neutral-950/50">
          <button
            type="button"
            onClick={() => setActiveTab('assignment')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'assignment'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <span>Assignment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'exam'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
            <span>Exam</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'task'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Task</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hydration')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'hydration'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Hydration</span>
          </button>
        </div>

        {/* Tab Forms */}
        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {/* Assignment Tab */}
          {activeTab === 'assignment' && (
            <form onSubmit={handleAssignmentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Consensus Raft Lab"
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Subject / Course
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Distributed Computing"
                    value={asgSubject}
                    onChange={(e) => setAsgSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={asgPriority}
                    onChange={(e) => setAsgPriority(e.target.value as Priority)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={asgDueTime}
                    onChange={(e) => setAsgDueTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="15"
                    value={asgEstMins}
                    onChange={(e) => setAsgEstMins(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Reminder Notification
                  </label>
                  <select
                    value={asgReminderMinutes}
                    onChange={(e) => setAsgReminderMinutes(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="60">1 hour before</option>
                    <option value="180">3 hours before</option>
                    <option value="1440">1 day before</option>
                    <option value="2880">2 days before</option>
                    <option value="0">No reminder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Description & Deliverables
                </label>
                <textarea
                  rows={2}
                  placeholder="Key instructions, rubric checkpoints, or team responsibilities..."
                  value={asgDescription}
                  onChange={(e) => setAsgDescription(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs"
                >
                  Create Assignment
                </button>
              </div>
            </form>
          )}

          {/* Exam Tab */}
          {activeTab === 'exam' && (
            <form onSubmit={handleExamSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Exam Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm: Algorithms & Complexity"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science 302"
                    value={examSubject}
                    onChange={(e) => setExamSubject(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Location / Room
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Quad Lecture Hall 4"
                    value={examLocation}
                    onChange={(e) => setExamLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Exam Time
                  </label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Syllabus Revision Topics (one per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Divide and Conquer Recurrences\nDynamic Programming\nNetwork Flow Algorithms`}
                  value={examInitialTopics}
                  onChange={(e) => setExamInitialTopics(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs"
                >
                  Add Exam
                </button>
              </div>
            </form>
          )}

          {/* Task Tab */}
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 2 chapters of distributed consensus paper"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="academic">Academic Study</option>
                    <option value="revision">Exam Revision</option>
                    <option value="wellness">Wellness &amp; Health</option>
                    <option value="personal">Personal / Errand</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    required
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Time (Optional)
                  </label>
                  <input
                    type="time"
                    value={taskTime}
                    onChange={(e) => setTaskTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeQuickAdd}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs"
                >
                  Add Task
                </button>
              </div>
            </form>
          )}

          {/* Hydration Tab */}
          {activeTab === 'hydration' && (
            <div className="space-y-4 text-xs">
              <p className="text-neutral-500 dark:text-neutral-400">
                Log fresh water intake to maintain focus, brain energy, and daily wellness.
              </p>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleWaterSubmit(150)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-lg flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">150 ml</span>
                  <span className="text-[10px] text-neutral-400">Small Cup</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWaterSubmit(250)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-lg flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">250 ml</span>
                  <span className="text-[10px] text-neutral-400">Regular Glass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleWaterSubmit(500)}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 rounded-lg flex flex-col items-center gap-1 transition-all"
                >
                  <Droplets className="w-5 h-5 text-sky-500" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">500 ml</span>
                  <span className="text-[10px] text-neutral-400">Water Bottle</span>
                </button>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] text-neutral-500 mb-1">
                    Or custom intake amount:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="25"
                      min="50"
                      max="2000"
                      value={customWaterMl}
                      onChange={(e) => setCustomWaterMl(Number(e.target.value))}
                      className="w-28 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
                    />
                    <span className="text-neutral-400 text-xs">ml</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleWaterSubmit(customWaterMl)}
                  className="mt-4 px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors shadow-xs"
                >
                  Log Custom Amount
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
