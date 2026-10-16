import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Droplets, 
  GraduationCap, 
  Clock, 
  Calendar 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/storage';

export const StatisticsView: React.FC = () => {
  const { 
    assignments, 
    exams, 
    focusSessions, 
    hydration, 
    settings 
  } = useApp();

  const todayStr = getTodayDateString();

  // Past 7 Days Dates Array
  const past7Days = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      list.push(`${year}-${month}-${day}`);
    }
    return list;
  }, []);

  // 7-day study minutes
  const studyMinutesByDay = useMemo(() => {
    return past7Days.map(dateStr => {
      const daySessions = focusSessions.filter(f => f.date === dateStr && f.completed);
      const minutes = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      const dayLabel = new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
      return {
        date: dateStr,
        label: dayLabel,
        minutes,
        hours: (minutes / 60).toFixed(1),
      };
    });
  }, [past7Days, focusSessions]);

  const maxStudyMinutes = Math.max(120, ...studyMinutesByDay.map(d => d.minutes));

  // 7-day hydration
  const hydrationByDay = useMemo(() => {
    const goal = settings.dailyWaterGoalMl || 2000;
    return past7Days.map(dateStr => {
      const dayEntries = hydration.filter(h => h.date === dateStr);
      const totalMl = dayEntries.reduce((sum, h) => sum + h.amountMl, 0);
      const dayLabel = new Date(dateStr).toLocaleDateString([], { weekday: 'short' });
      return {
        date: dateStr,
        label: dayLabel,
        ml: totalMl,
        percent: Math.min(100, Math.round((totalMl / goal) * 100)),
      };
    });
  }, [past7Days, hydration, settings.dailyWaterGoalMl]);

  // Assignment Stats
  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'submitted').length;
  const assignmentCompletionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  // Breakdown by subject
  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; done: number }>();
    assignments.forEach(a => {
      const sub = a.subject || 'General';
      if (!map.has(sub)) map.set(sub, { total: 0, done: 0 });
      map.get(sub)!.total++;
      if (a.status === 'completed' || a.status === 'submitted') {
        map.get(sub)!.done++;
      }
    });

    return Array.from(map.entries()).map(([subject, counts]) => ({
      subject,
      total: counts.total,
      done: counts.done,
      rate: Math.round((counts.done / counts.total) * 100),
    }));
  }, [assignments]);

  // Exam Syllabus Total Mastery
  const examStats = useMemo(() => {
    let totalTopics = 0;
    let masteredTopics = 0;
    exams.forEach(e => {
      totalTopics += e.syllabusTopics.length;
      masteredTopics += e.syllabusTopics.filter(t => t.completed).length;
    });

    return {
      totalExams: exams.length,
      totalTopics,
      masteredTopics,
      masteryRate: totalTopics > 0 ? Math.round((masteredTopics / totalTopics) * 100) : 0,
    };
  }, [exams]);

  // Total Focus Study Hours
  const totalFocusMinutesEver = useMemo(() => {
    return focusSessions.filter(f => f.completed).reduce((sum, f) => sum + f.durationMinutes, 0);
  }, [focusSessions]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Academic Progress &amp; Study Analytics
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Quantifiable insights into your focused study rhythm, syllabus readiness, and habit adherence.
        </p>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Cumulative Focus</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {(totalFocusMinutesEver / 60).toFixed(1)} hrs
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            {focusSessions.filter(f => f.completed).length} recorded sessions
          </div>
        </div>

        {/* Assignment Rate */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Deliverables Cleared</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {completedAssignments}/{totalAssignments}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            {assignmentCompletionRate}% completion rate
          </div>
        </div>

        {/* Exam Syllabus Mastery */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Syllabus Mastery</span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {examStats.masteryRate}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            {examStats.masteredTopics}/{examStats.totalTopics} topics mastered
          </div>
        </div>

        {/* Hydration 7-day average */}
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Water Adherence</span>
            <Droplets className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
            {Math.round(hydrationByDay.reduce((a, b) => a + b.percent, 0) / 7)}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1 font-mono">
            7-day goal consistency
          </div>
        </div>
      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Focus Study Time (Past 7 Days Bar Chart) */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Focus Time (Past 7 Days)
            </h2>
            <span className="text-xs font-mono text-neutral-400">Hours per day</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            {studyMinutesByDay.map(day => {
              const heightPercent = maxStudyMinutes > 0 ? (day.minutes / maxStudyMinutes) * 100 : 0;
              const isToday = day.date === todayStr;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.hours}h
                  </span>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday ? 'bg-indigo-600' : 'bg-indigo-400/80 dark:bg-indigo-500/80'
                      }`}
                      style={{ height: `${Math.max(4, heightPercent)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-neutral-500'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Hydration Consistency (Past 7 Days) */}
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Hydration Intake Consistency
            </h2>
            <span className="text-xs font-mono text-neutral-400">Target: {settings.dailyWaterGoalMl} ml</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            {hydrationByDay.map(day => {
              const isToday = day.date === todayStr;

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.ml}ml
                  </span>
                  <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-t-md h-full flex items-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        day.percent >= 100 
                          ? 'bg-sky-500' 
                          : isToday 
                          ? 'bg-sky-400' 
                          : 'bg-sky-300 dark:bg-sky-700/80'
                      }`}
                      style={{ height: `${Math.max(4, day.percent)}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${isToday ? 'text-sky-600 dark:text-sky-400 font-bold' : 'text-neutral-500'}`}>
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Coursework Completion by Subject Breakdown */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Coursework Completion by Subject
        </h2>

        {subjectBreakdown.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            No coursework records available.
          </div>
        ) : (
          <div className="space-y-3">
            {subjectBreakdown.map(item => (
              <div key={item.subject} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {item.subject}
                  </span>
                  <span className="font-mono text-neutral-500">
                    {item.done} / {item.total} finished ({item.rate}%)
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
