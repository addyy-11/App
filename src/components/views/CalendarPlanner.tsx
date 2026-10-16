import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  FileText, 
  GraduationCap, 
  Timer, 
  CheckSquare, 
  Filter 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/storage';

export const CalendarPlanner: React.FC = () => {
  const { 
    assignments, 
    exams, 
    tasks, 
    focusSessions, 
    openQuickAdd, 
    addTask 
  } = useApp();

  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [filterCategory, setFilterCategory] = useState<'all' | 'assignments' | 'exams' | 'tasks' | 'focus'>('all');
  const [selectedDayString, setSelectedDayString] = useState<string>(getTodayDateString());

  // Current calendar viewing month
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth()); // 0-indexed

  const todayStr = getTodayDateString();

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const jumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDayString(todayStr);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar Grid Days Calculation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayIndex = firstDayOfMonth.getDay(); // 0 is Sunday
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Preceding padding days from previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, '0');
      const d = String(dayNum).padStart(2, '0');
      days.push({
        dateString: `${y}-${m}-${d}`,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Days in current month
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const m = String(currentMonth + 1).padStart(2, '0');
      const d = String(i).padStart(2, '0');
      const dateStr = `${currentYear}-${m}-${d}`;
      days.push({
        dateString: dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Trailing padding days to fill 35 or 42 grid slots
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(currentYear, currentMonth + 1, i);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, '0');
      const d = String(i).padStart(2, '0');
      days.push({
        dateString: `${y}-${m}-${d}`,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [currentYear, currentMonth, todayStr]);

  // Map events to dateStrings
  const eventsByDate = useMemo(() => {
    const map = new Map<string, Array<{
      id: string;
      title: string;
      type: 'assignment' | 'exam' | 'task' | 'focus';
      time?: string;
      meta?: string;
    }>>();

    const addEvent = (date: string, item: any) => {
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(item);
    };

    if (filterCategory === 'all' || filterCategory === 'assignments') {
      assignments.forEach(a => {
        addEvent(a.dueDate, {
          id: a.id,
          title: a.title,
          type: 'assignment',
          time: a.dueTime,
          meta: a.subject,
        });
      });
    }

    if (filterCategory === 'all' || filterCategory === 'exams') {
      exams.forEach(e => {
        addEvent(e.examDate, {
          id: e.id,
          title: `Exam: ${e.name}`,
          type: 'exam',
          time: e.examTime,
          meta: e.subject,
        });
      });
    }

    if (filterCategory === 'all' || filterCategory === 'tasks') {
      tasks.forEach(t => {
        addEvent(t.date, {
          id: t.id,
          title: t.title,
          type: 'task',
          time: t.time,
          meta: t.category,
        });
      });
    }

    if (filterCategory === 'all' || filterCategory === 'focus') {
      focusSessions.forEach(f => {
        addEvent(f.date, {
          id: f.id,
          title: `${f.durationMinutes}m Focus Session`,
          type: 'focus',
          meta: f.subject,
        });
      });
    }

    return map;
  }, [assignments, exams, tasks, focusSessions, filterCategory]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDayString) || [];
  }, [eventsByDate, selectedDayString]);

  // Full Agenda List (sorted chronologically)
  const allAgendaEvents = useMemo(() => {
    const list: Array<{
      date: string;
      items: Array<any>;
    }> = [];

    const sortedDates = Array.from(eventsByDate.keys()).sort();
    sortedDates.forEach(date => {
      const items = eventsByDate.get(date) || [];
      if (items.length > 0) {
        list.push({ date, items });
      }
    });

    return list;
  }, [eventsByDate]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Academic Schedule &amp; Calendar
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Synchronized calendar of assignment deadlines, exams, revision milestones, and study time.
          </p>
        </div>

        {/* Month Navigation & Today */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-1 shadow-xs">
            <button
              onClick={prevMonth}
              title="Previous Month"
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold px-2 text-neutral-800 dark:text-neutral-200 min-w-[120px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={nextMonth}
              title="Next Month"
              className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToToday}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg shadow-xs transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Control Bar: View Switcher (Month / Agenda) & Category Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
              filterCategory === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterCategory('assignments')}
            className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
              filterCategory === 'assignments'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilterCategory('exams')}
            className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
              filterCategory === 'exams'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setFilterCategory('tasks')}
            className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
              filterCategory === 'tasks'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilterCategory('focus')}
            className={`px-3 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
              filterCategory === 'focus'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Study Sessions
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'month'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Month View
          </button>
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Agenda View
          </button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Calendar Month Grid (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-2 text-center text-xs font-semibold text-neutral-400">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayEvents = eventsByDate.get(day.dateString) || [];
                const isSelected = selectedDayString === day.dateString;

                return (
                  <div
                    key={day.dateString}
                    onClick={() => setSelectedDayString(day.dateString)}
                    className={`min-h-[76px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                        : day.isCurrentMonth
                        ? 'border-neutral-100 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                        : 'border-transparent text-neutral-300 dark:text-neutral-700 bg-neutral-50/40 dark:bg-neutral-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-medium ${
                        day.isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                          : day.isCurrentMonth
                          ? 'text-neutral-800 dark:text-neutral-200'
                          : 'text-neutral-400 dark:text-neutral-600'
                      }`}>
                        {day.dayNumber}
                      </span>

                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono text-neutral-400 tabular-nums">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Small Event Badges */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] px-1 py-0.2 rounded truncate leading-tight ${
                            ev.type === 'assignment'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-medium'
                              : ev.type === 'exam'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 font-semibold'
                              : ev.type === 'focus'
                              ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 font-medium'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-medium'
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-neutral-400 font-mono">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Inspector Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {selectedDayString === todayStr ? 'Today' : selectedDayString}
                </h3>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  {selectedDateEvents.length} scheduled event(s)
                </div>
              </div>

              <button
                onClick={() => openQuickAdd('task')}
                className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300 text-xs flex items-center gap-1"
                title="Add task on this date"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* List of events for selected day */}
            <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-neutral-400">
                  <p>No deadlines or tasks scheduled for this day.</p>
                  <button
                    onClick={() => openQuickAdd('assignment')}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    + Add an assignment or task
                  </button>
                </div>
              ) : (
                selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-1 text-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {ev.type === 'assignment' && <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      {ev.type === 'exam' && <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                      {ev.type === 'task' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      {ev.type === 'focus' && <Timer className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight">
                        {ev.title}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500 flex items-center gap-2 font-mono">
                      {ev.meta && <span>{ev.meta}</span>}
                      {ev.time && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{ev.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
          {allAgendaEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              No calendar events or scheduled deliverables.
            </div>
          ) : (
            allAgendaEvents.map(agendaGroup => (
              <div key={agendaGroup.date} className="space-y-2">
                <div className="text-xs font-bold font-mono text-neutral-500 pb-1 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
                  <CalendarIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{agendaGroup.date}</span>
                  {agendaGroup.date === todayStr && (
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-sans font-semibold">
                      Today
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pl-4">
                  {agendaGroup.items.map(ev => (
                    <div 
                      key={ev.id}
                      className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {ev.type === 'assignment' && <FileText className="w-3.5 h-3.5 text-amber-500" />}
                        {ev.type === 'exam' && <GraduationCap className="w-3.5 h-3.5 text-purple-500" />}
                        {ev.type === 'task' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                        {ev.type === 'focus' && <Timer className="w-3.5 h-3.5 text-indigo-500" />}
                        <div>
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">{ev.title}</span>
                          {ev.meta && <span className="text-neutral-400 ml-2 text-[11px]">({ev.meta})</span>}
                        </div>
                      </div>

                      {ev.time && (
                        <span className="font-mono text-neutral-400 text-xs">{ev.time}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
