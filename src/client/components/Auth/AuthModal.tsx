import React, { useState } from 'react';
import type { User } from '../../types';
import { LogIn, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import * as authApi from '../../api/auth';
import { ApiError } from '../../api/client';

interface AuthModalProps {
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      if (isRegister) {
        await authApi.register({ email, password, name: name.trim() || undefined });
      }
      // Register does not return tokens, so both paths finish by logging in.
      const user = await authApi.login({ email, password });
      onLogin(user);
    } catch (err) {
      if (err instanceof ApiError) {
        // Zod field errors are more specific than the top-level message.
        setError(err.errors?.[0]?.message ?? err.message);
      } else {
        setError('Could not reach the server. Is the API running?');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Task Manager</h2>
            <p className="text-sm text-slate-400">
              {isRegister ? 'Create a new account' : 'Sign in to access your tasks'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Please wait…
              </>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" /> Register & Continue
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-700/60 text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
          >
            {isRegister
              ? 'Already have an account? Sign in'
              : "Don't have an account? Register here"}
          </button>
        </div>
      </div>
    </div>
  );
};
