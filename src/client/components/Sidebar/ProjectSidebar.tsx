import React from 'react';
import type { Project, Task } from '../../types';
import { Folder, FolderPlus, Layers, Trash2 } from 'lucide-react';

interface ProjectSidebarProps {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null; // null = All Tasks
  onSelectProject: (projectId: string | null) => void;
  onOpenAddProjectModal: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  tasks,
  selectedProjectId,
  onSelectProject,
  onOpenAddProjectModal,
  onDeleteProject,
}) => {
  const getTaskCount = (projectId: string | null) => {
    if (projectId === null) return tasks.length;
    return tasks.filter((t) => t.projectId === projectId).length;
  };

  return (
    <aside className="w-full md:w-64 bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects</h2>
        <button
          onClick={onOpenAddProjectModal}
          title="Add New Project"
          className="flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New</span>
        </button>
      </div>

      {/* Navigation list */}
      <div className="space-y-1">
        {/* All Tasks */}
        <button
          onClick={() => onSelectProject(null)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer ${
            selectedProjectId === null
              ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
          }`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <Layers className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">All Tasks</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-900/60 border border-slate-700/60 text-slate-400 font-mono">
            {getTaskCount(null)}
          </span>
        </button>

        {/* Project Items */}
        {projects.map((project) => {
          const isSelected = selectedProjectId === project.id;
          const count = getTaskCount(project.id);

          return (
            <div key={project.id} className="group relative flex items-center">
              <button
                onClick={() => onSelectProject(project.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all cursor-pointer pr-9 ${
                  isSelected
                    ? 'bg-blue-600/20 text-blue-300 font-semibold border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{project.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs bg-slate-900/60 border border-slate-700/60 text-slate-400 font-mono shrink-0">
                  {count}
                </span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete project "${project.name}" and all its assigned tasks?`)) {
                    onDeleteProject(project.id);
                  }
                }}
                title="Delete Project"
                className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {projects.length === 0 && (
          <p className="text-xs text-slate-500 italic px-3 py-2">No projects created yet.</p>
        )}
      </div>
    </aside>
  );
};
