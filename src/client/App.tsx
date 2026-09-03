import { useCallback, useEffect, useState } from 'react';
import type { User, Project, Task, TaskStatus } from './types';
import * as authApi from './api/auth';
import * as projectsApi from './api/projects';
import * as tasksApi from './api/tasks';
import { ApiError } from './api/client';

import { Navbar } from './components/Layout/Navbar';
import { AuthModal } from './components/Auth/AuthModal';
import { ProjectSidebar } from './components/Sidebar/ProjectSidebar';
import { ProjectModal } from './components/Sidebar/ProjectModal';
import { TaskSearchBar } from './components/Tasks/TaskSearchBar';
import { TaskList } from './components/Tasks/TaskList';
import { TaskModal } from './components/Tasks/TaskModal';

export function App() {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Server data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const reportError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError) setError(err.errors?.[0]?.message ?? err.message);
    else setError(fallback);
  };

  // Trade the httpOnly refresh cookie for a live session on first load.
  useEffect(() => {
    authApi
      .restoreSession()
      .then(setCurrentUser)
      .finally(() => setRestoring(false));
  }, []);

  // Projects load once per session.
  useEffect(() => {
    if (!currentUser) return;

    projectsApi
      .listProjects()
      .then(setProjects)
      .catch((err) => reportError(err, 'Could not load projects.'));
  }, [currentUser]);

  // Tasks reload whenever a filter changes — the server does the filtering.
  const loadTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const { tasks: rows } = await tasksApi.listTasks({
        projectId: selectedProjectId,
        status: statusFilter,
        search: searchQuery,
      });
      setTasks(rows);
      setError(null);
    } catch (err) {
      reportError(err, 'Could not load tasks.');
    } finally {
      setLoadingTasks(false);
    }
  }, [selectedProjectId, statusFilter, searchQuery]);

  useEffect(() => {
    if (!currentUser) return;

    // Debounced so typing in the search box does not fire a request per keystroke.
    const timer = setTimeout(loadTasks, 250);
    return () => clearTimeout(timer);
  }, [currentUser, loadTasks]);

  // Handlers for Auth
  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await authApi.logout();
    setCurrentUser(null);
    setProjects([]);
    setTasks([]);
    setSelectedProjectId(null);
  };

  // Handlers for Projects
  const handleAddProject = async (
    projectData: Omit<Project, 'id' | 'createdAt' | 'ownerId' | '_count'>,
  ) => {
    try {
      const created = await projectsApi.createProject({
        name: projectData.name,
        description: projectData.description ?? undefined,
      });
      setProjects((prev) => [created, ...prev]);
      setSelectedProjectId(created.id);
    } catch (err) {
      reportError(err, 'Could not create the project.');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.deleteProject(projectId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      // The database cascades the delete, so drop the project's tasks locally too.
      setTasks((prev) => prev.filter((t) => t.projectId !== projectId));
      if (selectedProjectId === projectId) setSelectedProjectId(null);
    } catch (err) {
      reportError(err, 'Could not delete the project.');
    }
  };

  // Handlers for Tasks
  const handleCreateOrUpdateTask = async (
    taskData: Omit<Task, 'id' | 'createdAt'> | Partial<Task>,
  ) => {
    try {
      if (editingTask) {
        const updated = await tasksApi.updateTask(editingTask.id, {
          title: taskData.title,
          description: taskData.description ?? undefined,
          status: taskData.status,
          dueDate: taskData.dueDate ?? undefined,
        });
        setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        setEditingTask(null);
      } else {
        const created = await tasksApi.createTask({
          title: taskData.title!,
          description: taskData.description ?? undefined,
          status: taskData.status,
          dueDate: taskData.dueDate ?? undefined,
          projectId: taskData.projectId!,
        });
        setTasks((prev) => [created, ...prev]);
      }
    } catch (err) {
      reportError(err, 'Could not save the task.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      reportError(err, 'Could not delete the task.');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await tasksApi.setTaskStatus(taskId, newStatus);
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      reportError(err, 'Could not update the status.');
    }
  };

  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  // Wait for the refresh attempt before deciding which screen to show,
  // otherwise a logged-in user sees the auth modal flash on every reload.
  if (restoring) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-sm text-slate-400 font-mono">Restoring session…</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar displaying user name and Sign Out button */}
      <Navbar user={currentUser} onLogout={handleLogout} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Sidebar: Projects list */}
        <ProjectSidebar
          projects={projects}
          tasks={tasks}
          selectedProjectId={selectedProjectId}
          onSelectProject={setSelectedProjectId}
          onOpenAddProjectModal={() => setIsProjectModalOpen(true)}
          onDeleteProject={handleDeleteProject}
        />

        {/* Dashboard Area */}
        <div className="flex-1 flex flex-col gap-5">
          {error && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-200 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Header section displaying active filter name */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-xl font-bold text-slate-100">
                {selectedProject ? selectedProject.name : 'All Tasks'}
              </h2>
              {selectedProject?.description && (
                <p className="text-xs text-slate-400 mt-0.5">{selectedProject.description}</p>
              )}
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {loadingTasks
                ? 'Loading…'
                : `Showing ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
            </span>
          </div>

          {/* Search bar & status filter controls */}
          <TaskSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onOpenAddTaskModal={() => {
              setEditingTask(null);
              setIsTaskModalOpen(true);
            }}
          />

          {/* Task cards list — already filtered by the API */}
          <TaskList
            tasks={tasks}
            projects={projects}
            onEditTask={handleOpenEditTaskModal}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSubmit={handleCreateOrUpdateTask}
        initialTask={editingTask}
        projects={projects}
        defaultProjectId={selectedProjectId}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </div>
  );
}

export default App;
