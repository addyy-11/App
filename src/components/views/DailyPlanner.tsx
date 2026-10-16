import React, { useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  Clock, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskCategory, Priority, PersonalTask } from '../../types';
import { getTodayDateString } from '../../utils/storage';

export const DailyPlanner: React.FC = () => {
  const { tasks, addTask, toggleTask, deleteTask, openQuickAdd } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [categoryFilter, setCategoryFilter] = useState<'all' | TaskCategory>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('academic');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('medium');
  const [newTaskTime, setNewTaskTime] = useState('');

  const todayStr = getTodayDateString();

  // Change date helpers
  const handleDateShift = (deltaDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${year}-${month}-${day}`);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => t.date === selectedDate)
      .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        return 0;
      });
  }, [tasks, selectedDate, categoryFilter]);

  const completedCount = filteredTasks.filter(t => t.completed).length;

  const handleQuickInlineAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      date: selectedDate,
      time: newTaskTime || undefined,
      priority: newTaskPriority,
      completed: false,
    });

    setNewTaskTitle('');
    setNewTaskTime('');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Header & Date Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Daily Planner &amp; Priority Tasks
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Organize study blocks, revision sessions, and wellness breaks day by day.
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xs">
          <button
            onClick={() => handleDateShift(-1)}
            title="Previous Day"
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-mono bg-transparent text-neutral-800 dark:text-neutral-200 px-2 py-0.5 focus:outline-hidden"
          />

          <button
            onClick={() => handleDateShift(1)}
            title="Next Day"
            className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 px-2 py-0.5 hover:underline"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Task Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              categoryFilter === 'all'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setCategoryFilter('academic')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              categoryFilter === 'academic'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Academic
          </button>
          <button
            onClick={() => setCategoryFilter('revision')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              categoryFilter === 'revision'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Revision
          </button>
          <button
            onClick={() => setCategoryFilter('wellness')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              categoryFilter === 'wellness'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Wellness
          </button>
          <button
            onClick={() => setCategoryFilter('personal')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              categoryFilter === 'personal'
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
            }`}
          >
            Personal
          </button>
        </div>

        {/* Task Counter */}
        <div className="text-xs font-mono tabular-nums text-neutral-500">
          <span>{completedCount} of {filteredTasks.length} done</span>
        </div>
      </div>

      {/* Inline Quick Add Task for Selected Date */}
      <form 
        onSubmit={handleQuickInlineAdd}
        className="p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xs flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs"
      >
        <input
          type="text"
          placeholder={`Add a new task for ${selectedDate}...`}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100"
        />

        <select
          value={newTaskCategory}
          onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
          className="px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300"
        >
          <option value="academic">Academic</option>
          <option value="revision">Revision</option>
          <option value="wellness">Wellness</option>
          <option value="personal">Personal</option>
        </select>

        <select
          value={newTaskPriority}
          onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
          className="px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md text-neutral-700 dark:text-neutral-300"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input
          type="time"
          value={newTaskTime}
          onChange={(e) => setNewTaskTime(e.target.value)}
          placeholder="Time"
          className="w-24 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono text-neutral-700 dark:text-neutral-300"
        />

        <button
          type="submit"
          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md shadow-xs transition-colors shrink-0"
        >
          Add
        </button>
      </form>

      {/* Task List */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-xs divide-y divide-neutral-100 dark:divide-neutral-800">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center text-neutral-400 text-xs space-y-1">
            <p>No tasks found for this date or category.</p>
            <p className="text-neutral-500">Use the input bar above to add an assignment task, revision topic, or wellness activity.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-3.5 flex items-center justify-between gap-3 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                <div className="overflow-hidden">
                  <div className={`text-xs font-medium ${task.completed ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                    {task.title}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => deleteTask(task.id)}
                  title="Delete Task"
                  className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
