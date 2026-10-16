import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Droplets, 
  Timer, 
  GraduationCap, 
  Plus, 
  ArrowUpRight,
  Sparkles,
  Coffee,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/storage';

export const HomeDashboard: React.FC = () => {
  const { 
    settings, 
    assignments, 
    exams, 
    tasks, 
    focusSessions, 
    getTodayHydrationTotal, 
    logWater, 
    toggleTask,
    toggleAssignmentComplete, 
    setCurrentTab, 
    openQuickAdd,
    loadSampleSemester 
  } = useApp();

  const todayStr = getTodayDateString();

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's tasks
  const todayTasks = useMemo(() => {
    return tasks.filter(t => t.date === todayStr);
  }, [tasks, todayStr]);

  const completedTodayTasksCount = todayTasks.filter(t => t.completed).length;
  const taskProgressPercent = todayTasks.length > 0 ? Math.round((completedTodayTasksCount / todayTasks.length) * 100) : 0;

  // Today's focus study time
  const todayFocusMinutes = useMemo(() => {
    return focusSessions
      .filter(f => f.date === todayStr && f.completed)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [focusSessions, todayStr]);

  // Today's hydration
  const todayHydration = getTodayHydrationTotal();
  const hydrationGoal = settings.dailyWaterGoalMl || 2000;
  const hydrationPercent = Math.min(100, Math.round((todayHydration / hydrationGoal) * 100));

  // Upcoming assignments (sorted by dueDate)
  const upcomingAssignments = useMemo(() => {
    return [...assignments]
      .filter(a => a.status !== 'completed' && a.status !== 'submitted')
      .sort((a, b) => new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime())
      .slice(0, 4);
  }, [assignments]);

  // Upcoming exams (sorted by date)
  const upcomingExams = useMemo(() => {
    return [...exams]
      .sort((a, b) => new Date(`${a.examDate}T${a.examTime}`).getTime() - new Date(`${b.examDate}T${b.examTime}`).getTime())
      .slice(0, 3);
  }, [exams]);

  // Helper for due countdown string
  const getDaysDiffString = (targetDateStr: string) => {
    const target = new Date(targetDateStr);
    const now = new Date(todayStr);
    const diffDays = Math.round((target.getTime() - now.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `In ${diffDays} days`;
  };

  const hasNoData = assignments.length === 0 && exams.length === 0 && tasks.length === 0;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Greeting Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            {greeting}, {settings.userName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            <span>{settings.semester}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.major}</span>
            <span aria-hidden="true">·</span>
            <span>{settings.university}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasNoData && (
            <button
              onClick={loadSampleSemester}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors"
            >
              Load Sample Semester Data
            </button>
          )}
          <button
            onClick={() => openQuickAdd('assignment')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task or Due Date</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tasks Progress */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Daily Tasks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
              {completedTodayTasksCount}/{todayTasks.length}
            </span>
            <span className="text-xs text-neutral-400">
              ({taskProgressPercent}%)
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${taskProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Today's Focus Study Time */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Focus Time Today</span>
            <Timer className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
              {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-neutral-400">
            <span>Target: 4 hours</span>
            <button 
              onClick={() => setCurrentTab('focus')} 
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Start Session &rarr;
            </button>
          </div>
        </div>

        {/* Metric 3: Hydration */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Hydration Intake</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
              {todayHydration.toLocaleString()}
            </span>
            <span className="text-xs text-neutral-400">/ {hydrationGoal} ml</span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-sky-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${hydrationPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Wellness & Posture Break */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Break Reminder</span>
            <Coffee className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              {settings.breakReminders ? `Active (${settings.breakIntervalMinutes}m)` : 'Paused'}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              20-20-20 eye rest &amp; stretch interval
            </p>
          </div>
          <div className="mt-3">
            <button
              onClick={() => setCurrentTab('health')}
              className="text-[11px] text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
            >
              Manage Health Routine &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left column (Tasks & Assignments) & Right column (Exams & Quick Water Log) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks & Schedule */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Today's Priority Agenda
                </h2>
                <span className="text-xs text-neutral-400 font-mono">({todayTasks.length})</span>
              </div>
              <button
                onClick={() => openQuickAdd('task')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add task</span>
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {todayTasks.length === 0 ? (
                <div className="p-6 text-center text-neutral-400 text-xs">
                  <p>No tasks scheduled for today.</p>
                  <button
                    onClick={() => openQuickAdd('task')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    + Create your first daily task
                  </button>
                </div>
              ) : (
                todayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className="p-3.5 flex items-start justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-4 h-4 text-neutral-400" />
                        )}
                      </button>
                      <div>
                        <div className={`text-xs font-medium leading-snug ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span className="capitalize">{task.category}</span>
                          {task.time && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">{task.time}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className={`capitalize ${task.priority === 'high' ? 'text-rose-500 font-medium' : ''}`}>
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Assignments Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Upcoming Deadlines &amp; Assignments
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('assignments')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {upcomingAssignments.length === 0 ? (
                <div className="p-6 text-center text-neutral-400 text-xs">
                  <p>All caught up! No pending assignments.</p>
                  <button
                    onClick={() => openQuickAdd('assignment')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    + Add an assignment
                  </button>
                </div>
              ) : (
                upcomingAssignments.map(asg => {
                  const countdown = getDaysDiffString(asg.dueDate);
                  const isOverdue = countdown.includes('Overdue');
                  return (
                    <div 
                      key={asg.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                          {asg.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          <span className="font-medium text-neutral-700 dark:text-neutral-300">{asg.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{asg.dueDate} at {asg.dueTime}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{asg.estimatedMinutes}m est</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`text-[11px] font-mono font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-600 dark:text-neutral-400'}`}>
                          {countdown}
                        </span>
                        <button
                          onClick={() => toggleAssignmentComplete(asg.id)}
                          title="Mark Complete"
                          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-emerald-600 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Exams & Hydration Widget */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  Exams &amp; Revision
                </h2>
              </div>
              <button
                onClick={() => setCurrentTab('exams')}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View all &rarr;
              </button>
            </div>

            <div className="p-4 space-y-4">
              {upcomingExams.length === 0 ? (
                <div className="text-center text-neutral-400 text-xs py-4">
                  <p>No exams registered.</p>
                  <button
                    onClick={() => openQuickAdd('exam')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    + Register an upcoming exam
                  </button>
                </div>
              ) : (
                upcomingExams.map(exam => {
                  const target = new Date(exam.examDate);
                  const now = new Date(todayStr);
                  const diffDays = Math.max(0, Math.round((target.getTime() - now.getTime()) / (1000 * 3600 * 24)));
                  const completedTopics = exam.syllabusTopics.filter(t => t.completed).length;
                  const totalTopics = exam.syllabusTopics.length;
                  const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

                  return (
                    <div 
                      key={exam.id} 
                      className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {exam.name}
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            {exam.subject} · {exam.examDate}
                          </div>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {diffDays}d
                          </span>
                          <span className="text-[10px] text-neutral-400 block">remaining</span>
                        </div>
                      </div>

                      {/* Topic completion bar */}
                      <div>
                        <div className="flex justify-between text-[10px] text-neutral-400 font-mono mb-1">
                          <span>Syllabus: {completedTopics}/{totalTopics} mastered</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all duration-300" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Hydration Intake Widget */}
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-500" />
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  Quick Hydrate
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-neutral-500">
                {todayHydration}/{hydrationGoal} ml
              </span>
            </div>

            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              One-click logging for study desk hydration:
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => logWater(150)}
                className="py-2 px-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                +150 ml
              </button>
              <button
                onClick={() => logWater(250)}
                className="py-2 px-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                +250 ml
              </button>
              <button
                onClick={() => logWater(500)}
                className="py-2 px-2 text-xs font-medium border border-neutral-200 dark:border-neutral-700 rounded-md hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 text-neutral-700 dark:text-neutral-300 transition-colors"
              >
                +500 ml
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
