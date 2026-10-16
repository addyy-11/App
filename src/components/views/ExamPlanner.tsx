import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  Circle, 
  HelpCircle, 
  Award, 
  BookOpen, 
  Calendar, 
  MapPin, 
  Lightbulb,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Exam, SyllabusTopic, TopicStatus } from '../../types';
import { getTodayDateString } from '../../utils/storage';

export const ExamPlanner: React.FC = () => {
  const { 
    exams, 
    addExam, 
    updateExam, 
    deleteExam, 
    toggleExamTopicStatus, 
    addExamTopic, 
    deleteExamTopic, 
    openQuickAdd,
    addTask 
  } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState('');
  const [confirmDeleteExamId, setConfirmDeleteExamId] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  const activeExam = useMemo(() => {
    if (selectedExamId) {
      return exams.find(e => e.id === selectedExamId) || exams[0];
    }
    return exams[0] || null;
  }, [exams, selectedExamId]);

  // Offline study suggestions algorithm
  const studySuggestions = useMemo(() => {
    if (!activeExam) return [];
    const suggestions: string[] = [];

    const examDate = new Date(activeExam.examDate);
    const now = new Date(todayStr);
    const daysLeft = Math.max(0, Math.round((examDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));

    const needsReviewTopics = activeExam.syllabusTopics.filter(t => t.status === 'needs_review');
    const familiarTopics = activeExam.syllabusTopics.filter(t => t.status === 'familiar');
    const masteredTopics = activeExam.syllabusTopics.filter(t => t.status === 'mastered');

    if (daysLeft === 0) {
      suggestions.push('Exam is today! Do light formula checks, stay hydrated, and rest your mind before the paper.');
    } else if (daysLeft <= 3) {
      suggestions.push(`High priority: Only ${daysLeft} day(s) remaining. Concentrate exclusively on active recall and past papers.`);
    } else {
      const pace = needsReviewTopics.length > 0 
        ? Math.ceil(needsReviewTopics.length / Math.max(1, daysLeft - 1))
        : 1;
      suggestions.push(`Suggested study pace: Master ~${pace} challenging topic(s) per day to reach 100% readiness with time for mock testing.`);
    }

    if (needsReviewTopics.length > 0) {
      suggestions.push(`Focus next revision block on: "${needsReviewTopics[0].name}".`);
    } else if (familiarTopics.length > 0) {
      suggestions.push(`Great baseline! Upgrade "${familiarTopics[0].name}" from Familiar to Mastered by completing timed practice questions.`);
    } else if (masteredTopics.length > 0) {
      suggestions.push('All syllabus topics marked Mastered! Maintain retention with an overall timed mock exam.');
    }

    return suggestions;
  }, [activeExam, todayStr]);

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam || !newTopicName.trim()) return;
    addExamTopic(activeExam.id, newTopicName.trim());
    setNewTopicName('');
  };

  const handleCreateStudyTaskFromTopic = (topicName: string) => {
    if (!activeExam) return;
    addTask({
      title: `Revise ${activeExam.subject}: ${topicName}`,
      category: 'revision',
      date: todayStr,
      priority: 'high',
      completed: false,
    });
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteExamId) {
      deleteExam(confirmDeleteExamId);
      if (selectedExamId === confirmDeleteExamId) {
        setSelectedExamId(null);
      }
      setConfirmDeleteExamId(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Exam Planner &amp; Revision Assistant
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Syllabus breakdown, confidence matrices, countdown timers, and revision suggestions.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('exam')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Exam</span>
        </button>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-10 text-center text-xs text-neutral-400">
          <GraduationCap className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
          <p className="font-semibold text-neutral-700 dark:text-neutral-300">No examinations added yet.</p>
          <p className="mt-1">Add your midterms, finals, or certification exams with their syllabus topics.</p>
          <button
            onClick={() => openQuickAdd('exam')}
            className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium"
          >
            + Register First Exam
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Exam Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-1">
              Registered Examinations ({exams.length})
            </h2>

            <div className="space-y-2">
              {exams.map(exam => {
                const target = new Date(exam.examDate);
                const now = new Date(todayStr);
                const daysLeft = Math.round((target.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isSelected = activeExam?.id === exam.id;
                const masteredCount = exam.syllabusTopics.filter(t => t.completed).length;
                const totalTopics = exam.syllabusTopics.length;
                const percent = totalTopics > 0 ? Math.round((masteredCount / totalTopics) * 100) : 0;

                return (
                  <div
                    key={exam.id}
                    onClick={() => setSelectedExamId(exam.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                          {exam.name}
                        </div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {exam.subject}
                        </div>
                      </div>

                      <div className="text-right shrink-0 font-mono">
                        <span className={`text-xs font-bold ${daysLeft <= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {daysLeft < 0 ? 'Passed' : daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                        </span>
                        {daysLeft > 0 && <span className="text-[10px] text-neutral-400 block">left</span>}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono mb-1">
                        <span>{masteredCount}/{totalTopics} mastered</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-neutral-100 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Exam Details & Syllabus Checklist (8 cols) */}
          {activeExam && (
            <div className="lg:col-span-8 space-y-6">
              {/* Exam Overview Banner */}
              <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {activeExam.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{activeExam.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Date: {activeExam.examDate} at {activeExam.examTime}</span>
                      {activeExam.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Room: {activeExam.location}</span>
                        </>
                      )}
                      {activeExam.targetGrade && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Target: {activeExam.targetGrade}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmDeleteExamId(activeExam.id)}
                    title="Delete Exam Record"
                    className="p-1.5 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors self-end sm:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {activeExam.notes && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
                    {activeExam.notes}
                  </p>
                )}

                {/* Study Pace Suggestions Card */}
                {studySuggestions.length > 0 && (
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/60 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      <span>Revision Strategy &amp; Suggestions</span>
                    </div>
                    <ul className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 pl-5 list-disc">
                      {studySuggestions.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Syllabus Topics Checklist */}
              <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Syllabus Topics &amp; Mastery Levels
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-neutral-400">
                    {activeExam.syllabusTopics.filter(t => t.completed).length} of {activeExam.syllabusTopics.length} mastered
                  </span>
                </div>

                {/* Add Topic Bar */}
                <form onSubmit={handleAddTopic} className="p-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/20 flex items-center gap-2 text-xs">
                  <input
                    type="text"
                    placeholder="Add syllabus topic or sub-chapter (e.g. Master Theorem)..."
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-md shadow-xs transition-colors shrink-0"
                  >
                    Add Topic
                  </button>
                </form>

                {/* Topics Table / List */}
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {activeExam.syllabusTopics.length === 0 ? (
                    <div className="p-6 text-center text-xs text-neutral-400">
                      No syllabus topics registered yet. Add topics to track your revision confidence!
                    </div>
                  ) : (
                    activeExam.syllabusTopics.map(topic => {
                      const isMastered = topic.status === 'mastered';
                      const isFamiliar = topic.status === 'familiar';

                      return (
                        <div
                          key={topic.id}
                          className="p-3 flex items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 transition-colors group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <button
                              onClick={() => toggleExamTopicStatus(activeExam.id, topic.id)}
                              title="Click to cycle status: Needs Review -> Familiar -> Mastered"
                              className="text-neutral-400 hover:text-indigo-600 shrink-0"
                            >
                              {isMastered ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                              ) : isFamiliar ? (
                                <Circle className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                              ) : (
                                <Circle className="w-4 h-4 text-rose-400" />
                              )}
                            </button>

                            <div>
                              <div className={`text-xs font-medium ${isMastered ? 'text-neutral-400 line-through' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                {topic.name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                                <span className={
                                  isMastered ? 'text-emerald-600 dark:text-emerald-400 font-medium' :
                                  isFamiliar ? 'text-amber-600 dark:text-amber-400 font-medium' :
                                  'text-rose-500 font-medium'
                                }>
                                  {topic.status === 'needs_review' ? 'Needs Review' : topic.status === 'familiar' ? 'Familiar' : 'Mastered'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Fast Action: Create Study Task from this topic */}
                            <button
                              onClick={() => handleCreateStudyTaskFromTopic(topic.name)}
                              title="Schedule revision task for this topic today"
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              + Task
                            </button>

                            {/* Cycle button */}
                            <button
                              onClick={() => toggleExamTopicStatus(activeExam.id, topic.id)}
                              className="px-2 py-0.8 text-[11px] border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                            >
                              Cycle Level
                            </button>

                            <button
                              onClick={() => deleteExamTopic(activeExam.id, topic.id)}
                              title="Delete Topic"
                              className="p-1 text-neutral-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Exam Confirmation Modal */}
      {confirmDeleteExamId && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Examination Record</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Are you sure you want to permanently delete this exam and its syllabus topics?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteExamId(null)}
                className="px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-md shadow-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
