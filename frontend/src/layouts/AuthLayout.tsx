import React from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CanvasBackground } from '../components/CanvasBackground';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Link2 } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Interactive canvas animation */}
      <CanvasBackground />

      {/* Floating Header */}
      <header className="absolute top-0 w-full max-w-7xl flex items-center justify-between p-6 z-10">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <Link2 className="h-5 w-5" />
          </div>
          <span className="font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Nano Link
          </span>
        </Link>

        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
      </header>

      {/* Auth Form Card */}
      <main className="w-full max-w-md z-10 mt-12">
        <Outlet />
      </main>
    </div>
  );
};
