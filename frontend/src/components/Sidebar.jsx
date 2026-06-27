import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BadgeDollarSign, CalendarRange, LayoutDashboard,
  MapPinned, ShieldAlert, Tractor, Store, Users, HelpCircle,
  Settings, LogOut, ChevronLeft, ChevronRight, Wheat,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const menuItems = [
  { label: 'Dashboard',     to: '/',             icon: LayoutDashboard, color: 'text-emerald-600' },
  { label: 'Users',         to: '/user',          icon: Users,           color: 'text-violet-600'  },
  { label: 'Equipment',     to: '/equipment',     icon: Tractor,         color: 'text-amber-600'   },
  { label: 'Mandi Pool',    to: '/mandi',         icon: Store,           color: 'text-sky-600'     },
  { label: 'Bookings',      to: '/booking',       icon: CalendarRange,   color: 'text-indigo-600'  },
  { label: 'Payments',      to: '/payment',       icon: BadgeDollarSign, color: 'text-green-600'   },
  { label: 'Disputes',      to: '/dispute',       icon: ShieldAlert,     color: 'text-red-600'     },
  { label: 'Map',           to: '/map',           icon: MapPinned,       color: 'text-teal-600'    },
  { label: 'Notifications', to: '/notifications', icon: Bell,            color: 'text-orange-600'  },
  { label: 'Help Desk',     to: '/help',          icon: HelpCircle,      color: 'text-pink-600'    },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const { user, logoutUser } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = () => {
    setCollapsed(prev => !prev);
    onToggle?.(!collapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onToggle?.(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed left-0 top-0 z-40 h-full flex-col border-r border-[var(--color-border)]
          bg-white dark:bg-slate-900 shadow-xl
          lg:relative lg:flex lg:shadow-none
          ${isOpen ? 'flex' : 'hidden lg:flex'}
        `}
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{ minHeight: '100vh' }}
      >
        {/* Header */}
        <div className={`flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-5 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <motion.div
            className="flex items-center gap-3"
            animate={{ opacity: 1 }}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 shadow-glow">
              <Wheat size={18} className="text-white" />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">KrishiPool</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">Agri Coordination</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Collapse button */}
          <button
            onClick={handleToggle}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {menuItems.map(({ label, to, icon: Icon, color }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => onToggle?.(false)}
              className={({ isActive }) => `
                group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                ${isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`shrink-0 ${isActive ? 'text-white' : color}`}>
                    <Icon size={18} />
                  </span>
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-[var(--color-border)] p-3">
          <div className={`flex items-center gap-3 rounded-xl p-2 ${collapsed ? 'justify-center' : ''}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-sm font-bold text-white shadow-md">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex-1 overflow-hidden"
                >
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {user?.name || 'Guest'}
                  </p>
                  <p className="truncate text-xs text-slate-500 capitalize">{user?.role || 'farmer'}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {!collapsed && (
              <button
                onClick={logoutUser}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;