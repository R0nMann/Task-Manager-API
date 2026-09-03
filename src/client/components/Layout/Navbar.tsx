import React from 'react';
import type { User } from '../../types';
import { LogOut, CheckSquare, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-800 border-b border-slate-700/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Task Manager</h1>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">API Frontend Demo</span>
          </div>
        </div>

        {/* User Info & Sign Out */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/60 border border-slate-700/60 rounded-full">
            <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center font-semibold text-xs border border-blue-500/40">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left pr-1">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user.email}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
