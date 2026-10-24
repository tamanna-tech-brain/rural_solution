import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, Menu, Wheat, Globe, Radio } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useDarkMode from '../hooks/useDarkMode';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
];

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
  const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'en');

  const pageTitle = ROUTE_LABELS[location.pathname] || 'KrishiPool';

  const handleLangChange = (code) => {
    setCurrentLang(code);
    localStorage.setItem('lang', code);
    window.dispatchEvent(new CustomEvent('krishiLangChanged', { detail: { lang: code } }));
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">

        {/* Left — menu + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:flex items-center gap-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200/60 dark:border-emerald-800/40">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <Radio size={11} className="text-emerald-600 dark:text-emerald-400" />
              <span>APMC Grid Live</span>
            </div>
            <span>/</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{pageTitle}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 lg:hidden">{pageTitle}</h1>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Quick Language Selector */}
          <div className="relative flex items-center">
            <div className="flex items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
              <Globe size={14} className="text-emerald-600 dark:text-emerald-400" />
              <select
                value={currentLang}
                onChange={(e) => handleLangChange(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold focus:ring-0 cursor-pointer pr-1"
                aria-label="Language selection"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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