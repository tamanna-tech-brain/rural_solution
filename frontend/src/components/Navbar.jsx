import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, Menu, Search, Wheat } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useDarkMode } from '../context/DarkModeContext';

// Map routes to breadcrumb labels
const ROUTE_LABELS = {
  '/':             'Dashboard',
  '/user':         'Users',
  '/equipment':    'Equipment',
  '/mandi':        'Mandi Pool',
  '/booking':      'Bookings',
  '/payment':      'Payments',
  '/dispute':      'Disputes',
  '/map':          'Live Map',
  '/notifications':'Notifications',
  '/help':         'Help Desk',
  '/admin':        'Admin Panel',
  '/profile':      'My Profile',
};

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleDark } = useDarkMode();

  const pageTitle = ROUTE_LABELS[location.pathname] || 'KrishiPool';

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3">
      <div className="flex items-center justify-between gap-4">

        {/* Left — menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
            <Wheat size={14} className="text-emerald-500" />
            <span>KrishiPool</span>
            <span>/</span>
            <span className="font-medium text-slate-700 dark:text-slate-200">{pageTitle}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 lg:hidden">{pageTitle}</h1>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Dark mode toggle */}
          <motion.button
            onClick={toggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            whileTap={{ scale: 0.9 }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </motion.button>

          {/* Notifications */}
          {isAuthenticated && (
            <motion.button
              onClick={() => navigate('/notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
            </motion.button>
          )}

          {/* User avatar */}
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 hover:border-emerald-300 transition-colors"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-xs font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-emerald-600 capitalize leading-tight">{user?.role || 'farmer'}</p>
              </div>
              <span className="ml-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/user')}
              className="btn btn-primary text-xs py-2 px-4"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;