import React from 'react';
import type { Task, TaskStatus, Project } from '../../types';
import { Clock, Edit2, Trash2, CheckCircle2, Circle, AlertCircle, Folder } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  project?: Project;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  project,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Done
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case 'TODO':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/60 text-slate-300 border border-slate-600/50">
            <Circle className="w-3.5 h-3.5" /> To Do
          </span>
        );
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'DONE';
    return 'TODO';
  };

  return (
    <div className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600/80 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between gap-3 group">
      {/* Top row: Project Tag & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900/60 border border-slate-700/60 text-[11px] font-medium text-slate-400">
          <Folder className="w-3 h-3 text-amber-400" />
          <span className="truncate max-w-[140px]">{project ? project.name : 'Unassigned'}</span>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete task "${task.title}"?`)) {
                onDelete(task.id);
              }
            }}
            title="Delete Task"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className={`text-base font-semibold leading-snug ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Footer: Due Date & Status toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
        </div>

        {/* Quick status toggle button */}
        <button
          onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
          title="Click to toggle status"
          className="cursor-pointer hover:scale-105 transition-transform"
        >
          {getStatusBadge(task.status)}
        </button>
      </div>
    </div>
  );
};
