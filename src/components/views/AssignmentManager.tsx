import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Plus, 
  Check, 
  Send, 
  Trash2, 
  Edit3, 
  Clock, 
  AlertCircle, 
  Filter, 
  Search, 
  ArrowUpDown,
  Calendar,
  X,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentStatus, Priority } from '../../types';
import { getTodayDateString } from '../../utils/storage';

export const AssignmentManager: React.FC = () => {
  const { 
    assignments, 
    addAssignment, 
    updateAssignment, 
    deleteAssignment, 
    toggleAssignmentComplete, 
    markAssignmentSubmitted,
    openQuickAdd 
  } = useApp();

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AssignmentStatus | 'overdue'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created'>('deadline');

  // Edit Modal State
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  // Confirmation Modals State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmSubmitId, setConfirmSubmitId] = useState<string | null>(null);

  const todayStr = getTodayDateString();

  // Unique subjects list for filtering
  const allSubjects = useMemo(() => {
    const set = new Set<string>();
    assignments.forEach(a => {
      if (a.subject) set.add(a.subject);
    });
    return Array.from(set);
  }, [assignments]);

  // Filtered & Sorted assignments
  const filteredAssignments = useMemo(() => {
    return assignments
      .filter(a => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = a.title.toLowerCase().includes(q);
          const matchSub = a.subject.toLowerCase().includes(q);
          const matchDesc = a.description.toLowerCase().includes(q);
          if (!matchTitle && !matchSub && !matchDesc) return false;
        }

        // Status Filter
        if (statusFilter === 'overdue') {
          const isDone = a.status === 'completed' || a.status === 'submitted';
          if (isDone) return false;
          return a.dueDate < todayStr;
        } else if (statusFilter !== 'all') {
          if (a.status !== statusFilter) return false;
        }

        // Subject Filter
        if (subjectFilter !== 'all' && a.subject !== subjectFilter) {
          return false;
        }

        // Priority Filter
        if (priorityFilter !== 'all' && a.priority !== priorityFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return new Date(`${a.dueDate}T${a.dueTime}`).getTime() - new Date(`${b.dueDate}T${b.dueTime}`).getTime();
        }
        if (sortBy === 'priority') {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'created') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [assignments, searchQuery, statusFilter, subjectFilter, priorityFilter, sortBy, todayStr]);

  const overdueCount = useMemo(() => {
    return assignments.filter(a => {
      const isDone = a.status === 'completed' || a.status === 'submitted';
      return !isDone && a.dueDate < todayStr;
    }).length;
  }, [assignments, todayStr]);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssignment) return;
    updateAssignment(editingAssignment.id, editingAssignment);
    setEditingAssignment(null);
  };

  const handleConfirmSubmit = () => {
    if (confirmSubmitId) {
      markAssignmentSubmitted(confirmSubmitId);
      setConfirmSubmitId(null);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteAssignment(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const getStatusBadge = (status: AssignmentStatus) => {
    switch (status) {
      case 'submitted':
        return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Submitted</span>;
      case 'completed':
        return <span className="text-indigo-600 dark:text-indigo-400 font-medium">Completed</span>;
      case 'in_progress':
        return <span className="text-amber-600 dark:text-amber-400 font-medium">In Progress</span>;
      default:
        return <span className="text-neutral-500 font-medium">Not Started</span>;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Assignment Manager
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Track coursework deliverables, milestones, deadlines, and submission records.
          </p>
        </div>

        <button
          onClick={() => openQuickAdd('assignment')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="space-y-3">
        {/* Search input + status tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, course, or instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100"
            />
          </div>

          {/* Status filter segments */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              All ({assignments.length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'in_progress'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'completed'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                statusFilter === 'submitted'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Submitted
            </button>
            {overdueCount > 0 && (
              <button
                onClick={() => setStatusFilter('overdue')}
                className={`px-2.5 py-1 font-medium rounded-md whitespace-nowrap transition-colors ${
                  statusFilter === 'overdue'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                }`}
              >
                Overdue ({overdueCount})
              </button>
            )}
          </div>
        </div>

        {/* Secondary filters: Subject, Priority, Sorting */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Subject dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Subject:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Subjects</option>
              {allSubjects.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Priority dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-1.5 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-neutral-700 dark:text-neutral-300"
            >
              <option value="deadline">Due Date</option>
              <option value="priority">Priority</option>
              <option value="created">Date Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignment Cards List */}
      <div className="space-y-3">
        {filteredAssignments.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-10 text-center text-xs text-neutral-400">
            <FileText className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-700 mb-2" />
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">No assignments found matching current filters.</p>
            <p className="mt-1">Try adjusting your filters or create a new assignment.</p>
            <button
              onClick={() => openQuickAdd('assignment')}
              className="mt-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md font-medium"
            >
              + Create Assignment
            </button>
          </div>
        ) : (
          filteredAssignments.map(asg => {
            const isCompleted = asg.status === 'completed';
            const isSubmitted = asg.status === 'submitted';
            const isDone = isCompleted || isSubmitted;
            const isOverdue = !isDone && asg.dueDate < todayStr;

            return (
              <div
                key={asg.id}
                className={`p-4 rounded-xl border bg-white dark:bg-neutral-900 shadow-xs transition-colors space-y-3 ${
                  isOverdue 
                    ? 'border-rose-300 dark:border-rose-900/60' 
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                {/* Header row: title, course, actions */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${isDone ? 'line-through text-neutral-400' : 'text-neutral-900 dark:text-neutral-100'}`}>
                        {asg.title}
                      </h3>
                      {isOverdue && (
                        <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                          Overdue
                        </span>
                      )}
                    </div>
                    {/* Metadata line without pills */}
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      <span className="font-medium text-neutral-700 dark:text-neutral-300">{asg.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Due {asg.dueDate} at {asg.dueTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className={`capitalize ${asg.priority === 'high' ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
                        {asg.priority} Priority
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Status: {getStatusBadge(asg.status)}</span>
                      {asg.estimatedMinutes > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{asg.estimatedMinutes}m est.</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {/* Toggle complete */}
                    <button
                      onClick={() => toggleAssignmentComplete(asg.id)}
                      title={isDone ? 'Mark incomplete' : 'Mark complete'}
                      className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors ${
                        isCompleted
                          ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                          : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{isCompleted ? 'Completed' : 'Complete'}</span>
                    </button>

                    {/* Mark submitted (with explicit confirmation prompt) */}
                    {!isSubmitted && (
                      <button
                        onClick={() => setConfirmSubmitId(asg.id)}
                        title="Mark as submitted to institution"
                        className="p-1.5 rounded-md border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Mark Submitted</span>
                      </button>
                    )}

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingAssignment(asg)}
                      title="Edit Assignment"
                      className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button (with confirmation) */}
                    <button
                      onClick={() => setConfirmDeleteId(asg.id)}
                      title="Delete Assignment"
                      className="p-1.5 rounded-md border border-neutral-200 dark:border-neutral-700 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description & notes */}
                {asg.description && (
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/40 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800/80">
                    {asg.description}
                  </p>
                )}

                {asg.notes && (
                  <div className="text-[11px] text-neutral-500 italic">
                    Note: {asg.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Assignment Dialog */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl w-full max-w-lg p-5 text-neutral-900 dark:text-neutral-100 text-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="font-semibold text-sm">Edit Assignment</h2>
              <button 
                onClick={() => setEditingAssignment(null)}
                className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingAssignment.title}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={editingAssignment.subject}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, subject: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={editingAssignment.priority}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, priority: e.target.value as Priority })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                    value={editingAssignment.dueDate}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={editingAssignment.dueTime}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, dueTime: e.target.value })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={editingAssignment.status}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, status: e.target.value as AssignmentStatus })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                    Estimated Time (Minutes)
                  </label>
                  <input
                    type="number"
                    value={editingAssignment.estimatedMinutes}
                    onChange={(e) => setEditingAssignment({ ...editingAssignment, estimatedMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingAssignment.description}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                />
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 font-medium mb-1">
                  Personal Notes
                </label>
                <input
                  type="text"
                  value={editingAssignment.notes || ''}
                  onChange={(e) => setEditingAssignment({ ...editingAssignment, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingAssignment(null)}
                  className="px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Marking Submitted */}
      {confirmSubmitId && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-900 dark:text-neutral-100 font-semibold text-sm">
              <Send className="w-4 h-4 text-emerald-500" />
              <span>Confirm Submission</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Are you sure you want to mark this assignment as officially submitted? This will record your submission timestamp.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmSubmitId(null)}
                className="px-3 py-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md shadow-xs"
              >
                Yes, Mark as Submitted
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Permanent Deletion */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-5 max-w-sm w-full space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Assignment</span>
            </div>
            <p className="text-neutral-600 dark:text-neutral-300">
              Are you sure you want to permanently delete this assignment record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
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
