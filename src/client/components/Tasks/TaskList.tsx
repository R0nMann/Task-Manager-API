import React from 'react';
import type { Task, TaskStatus, Project } from '../../types';
import { TaskItem } from './TaskItem';
import { Inbox } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  projects,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const getProjectMap = () => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  };

  const projectMap = getProjectMap();

  if (tasks.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
        <div className="p-3 bg-slate-800 text-slate-500 rounded-full mb-3 border border-slate-700/60">
          <Inbox className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-slate-300">No tasks found</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Try adjusting your search query or filter, or click "Add Task" to create a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          project={projectMap.get(task.projectId)}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};
