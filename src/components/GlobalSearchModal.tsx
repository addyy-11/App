import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, FileText, GraduationCap, CheckSquare, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GlobalSearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    assignments, 
    exams, 
    tasks, 
    setCurrentTab 
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'assignments' | 'exams' | 'tasks'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      id: string;
      title: string;
      type: 'assignment' | 'exam' | 'task';
      subtitle: string;
      meta: string;
      targetTab: 'assignments' | 'exams' | 'planner';
    }> = [];

    if (filterType === 'all' || filterType === 'assignments') {
      assignments.forEach(a => {
        if (
          a.title.toLowerCase().includes(q) ||
          a.subject.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
        ) {
          results.push({
            id: a.id,
            title: a.title,
            type: 'assignment',
            subtitle: a.subject,
            meta: `Due ${a.dueDate} · ${a.priority.toUpperCase()} priority · ${a.status.replace('_', ' ')}`,
            targetTab: 'assignments',
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'exams') {
      exams.forEach(e => {
        const matchesTopic = e.syllabusTopics.some(t => t.name.toLowerCase().includes(q));
        if (
          e.name.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q)) ||
          matchesTopic
        ) {
          results.push({
            id: e.id,
            title: e.name,
            type: 'exam',
            subtitle: e.subject,
            meta: `Exam date ${e.examDate} · ${e.syllabusTopics.length} topics`,
            targetTab: 'exams',
          });
        }
      });
    }

    if (filterType === 'all' || filterType === 'tasks') {
      tasks.forEach(t => {
        if (t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) {
          results.push({
            id: t.id,
            title: t.title,
            type: 'task',
            subtitle: t.category,
            meta: `Scheduled ${t.date} · ${t.completed ? 'Completed' : 'Pending'}`,
            targetTab: 'planner',
          });
        }
      });
    }

    return results;
  }, [query, filterType, assignments, exams, tasks]);

  if (!isSearchOpen) return null;

  const handleSelectResult = (targetTab: 'assignments' | 'exams' | 'planner') => {
    setCurrentTab(targetTab);
    setIsSearchOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 z-50 animate-in fade-in duration-150"
      onClick={() => setIsSearchOpen(false)}
    >
      <div 
        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search assignments, courses, syllabus topics, tasks..."
            className="w-full bg-transparent text-sm focus:outline-hidden placeholder-neutral-400 text-neutral-900 dark:text-neutral-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline font-mono text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-700">
            ESC
          </kbd>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 px-4 py-2 bg-neutral-50 dark:bg-neutral-950/40 border-b border-neutral-100 dark:border-neutral-800 text-xs">
          <span className="text-[11px] text-neutral-400 mr-1">Filter:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('assignments')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filterType === 'assignments'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setFilterType('exams')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filterType === 'exams'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setFilterType('tasks')}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
              filterType === 'tasks'
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300'
            }`}
          >
            Tasks
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {!query.trim() ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              Search by title, subject name, topic name, or notes...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-8 text-center text-neutral-400 text-xs">
              No matching records found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {searchResults.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelectResult(item.targetTab)}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div className="mt-0.5 p-1 rounded bg-neutral-100 dark:bg-neutral-800 shrink-0">
                      {item.type === 'assignment' && <FileText className="w-3.5 h-3.5 text-indigo-500" />}
                      {item.type === 'exam' && <GraduationCap className="w-3.5 h-3.5 text-purple-500" />}
                      {item.type === 'task' && <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        <span className="font-medium text-neutral-700 dark:text-neutral-300">{item.subtitle}</span>
                        <span className="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                        <span>{item.meta}</span>
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>Select to open section</span>
          </div>
          <span className="font-mono">{searchResults.length} results</span>
        </div>
      </div>
    </div>
  );
};
