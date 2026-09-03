import React from 'react';
import type { TaskStatus } from '../../types';
import { Search, Plus, Filter } from 'lucide-react';

interface TaskSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: TaskStatus | 'ALL';
  onStatusFilterChange: (status: TaskStatus | 'ALL') => void;
  onOpenAddTaskModal: () => void;
}

export const TaskSearchBar: React.FC<TaskSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onOpenAddTaskModal,
}) => {
  const statuses: { label: string; value: TaskStatus | 'ALL' }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'To Do', value: 'TODO' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Done', value: 'DONE' },
  ];

  return (
    <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center bg-slate-900/60 p-1 rounded-lg border border-slate-700/60 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1 shrink-0" />
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => onStatusFilterChange(s.value)}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer font-medium ${
                statusFilter === s.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Add Task Button */}
        <button
          onClick={onOpenAddTaskModal}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};
