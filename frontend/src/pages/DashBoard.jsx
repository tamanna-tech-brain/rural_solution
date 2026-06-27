import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tractor, Store, Users, MapPin, BadgeDollarSign, ShieldAlert,
  CalendarRange, TrendingUp, Globe, ArrowRight, Wheat,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import API from '../api/api';

const LANGUAGES = [
  { code: 'en', label: 'English' }, { code: 'hi', label: 'हिंदी' },
  { code: 'bn', label: 'বাংলা' },   { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },   { code: 'ml', label: 'മലയാളം' },
  { code: 'mr', label: 'मराठी' },   { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'ta', label: 'தமிழ்' },   { code: 'te', label: 'తెలుగు' },
  { code: 'ur', label: 'اردو' },    { code: 'or', label: 'ଓଡ଼ିଆ' },
  { code: 'as', label: 'অসমীয়া' },  { code: 'ne', label: 'नेपाली' },
];

const StatCard = ({ icon: Icon, label, value, color, bg, to, delay = 0 }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="card p-5 cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
      onClick={() => to && navigate(to)}
    >
      <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
        <Icon size={22} className={color} />
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        {value ?? <span className="skeleton inline-block h-7 w-16 rounded" />}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      {to && (
        <span className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
          View all <ArrowRight size={12} />
        </span>
      )}
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, color, onClick, delay = 0 }) => (
  <motion.button
    className="card p-5 text-left w-full group hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
    onClick={onClick}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <p className="font-semibold text-slate-800 dark:text-slate-100">{label}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
  </motion.button>
);

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [stats, setStats] = useState(null);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new CustomEvent('krishiLangChanged', { detail: { lang } }));
  };

  useEffect(() => {
    // Try to fetch admin stats if user is admin
    if (user?.role === 'admin') {
      API.get('/admin/stats')
        .then((res) => setStats(res.data?.data?.stats))
        .catch(() => setStats(null));
    }
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-8 text-white shadow-xl"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-24 h-32 w-32 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-20 rounded-full bg-emerald-400/20" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                <Wheat size={16} />
              </div>
              <span className="text-sm font-medium text-emerald-100">KrishiPool Platform</span>
            </div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">
              Welcome back, {user?.name?.split(' ')[0] || 'Farmer'} 👋
            </h1>
            <p className="mt-2 max-w-lg text-emerald-100">
              Smart agri-coordination — rent equipment, pool mandi transport, and manage your farm operations.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-white/15 px-3 py-2">
            <Globe size={16} className="text-emerald-100" />
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
            >
              {LANGUAGES.map(({ code, label }) => (
                <option key={code} value={code} className="text-slate-900">{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/equipment')}
            className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow hover:bg-emerald-50 transition-colors"
          >
            🚜 Browse Equipment
          </button>
          <button
            onClick={() => navigate('/mandi')}
            className="rounded-xl bg-white/20 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
          >
            🚛 Mandi Pool
          </button>
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/user')}
              className="rounded-xl bg-emerald-800/50 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800/70 transition-colors"
            >
              Sign In / Register
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Platform Overview</h2>
        <div className="stats-grid">
          <StatCard icon={Users}          label="Registered Farmers" value={stats?.totalUsers}      color="text-violet-600"   bg="bg-violet-100 dark:bg-violet-900/30" to="/user"     delay={0.1} />
          <StatCard icon={Tractor}        label="Equipment Listed"   value={stats?.totalEquipment}  color="text-amber-600"    bg="bg-amber-100 dark:bg-amber-900/30"   to="/equipment" delay={0.15} />
          <StatCard icon={CalendarRange}  label="Total Bookings"     value={stats?.totalBookings}   color="text-indigo-600"   bg="bg-indigo-100 dark:bg-indigo-900/30" to="/booking"  delay={0.2} />
          <StatCard icon={Store}          label="Mandi Pools"        value={stats?.totalMandiPools} color="text-sky-600"      bg="bg-sky-100 dark:bg-sky-900/30"       to="/mandi"    delay={0.25} />
          <StatCard icon={BadgeDollarSign}label="Total Payments"     value={stats?.totalPayments}   color="text-green-600"    bg="bg-green-100 dark:bg-green-900/30"   to="/payment"  delay={0.3} />
          <StatCard icon={ShieldAlert}    label="Open Disputes"      value={stats?.openDisputes}    color="text-red-600"      bg="bg-red-100 dark:bg-red-900/30"       to="/dispute"  delay={0.35} />
          <StatCard icon={TrendingUp}     label="Total Revenue (₹)"  value={stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString('en-IN')}` : '—'} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/30" delay={0.4} />
          <StatCard icon={MapPin}         label="Live Map"            value="Track" color="text-teal-600" bg="bg-teal-100 dark:bg-teal-900/30" to="/map" delay={0.45} />
        </div>
        {!user?.role || user.role !== 'admin' && (
          <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
            💡 Login as admin to see live statistics. Stats shown above are placeholders.
          </p>
        )}
      </div>

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={Tractor}       label="Add Equipment"   desc="List your farm equipment for rent"    color="bg-amber-500"   onClick={() => navigate('/equipment')}    delay={0.1} />
          <QuickAction icon={Store}         label="Create Mandi Pool" desc="Organize shared transport to mandi" color="bg-sky-500"     onClick={() => navigate('/mandi')}        delay={0.15} />
          <QuickAction icon={BadgeDollarSign} label="Record Payment" desc="Log and track a payment"            color="bg-green-600"   onClick={() => navigate('/payment')}      delay={0.2} />
          <QuickAction icon={ShieldAlert}   label="Raise Dispute"   desc="Report an issue or conflict"         color="bg-red-500"     onClick={() => navigate('/dispute')}      delay={0.25} />
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Platform Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Equipment Marketplace',
              desc: 'Rent tractors, tillers, and farming tools from nearby farmers at fair daily rates.',
              img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
              to: '/equipment',
              tag: 'Equipment',
              tagColor: 'badge-yellow',
            },
            {
              title: 'Mandi Pool Transport',
              desc: 'Share transport costs to the mandi. Join a pool and reduce logistics expenses.',
              img: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=800&auto=format&fit=crop',
              to: '/mandi',
              tag: 'Transport',
              tagColor: 'badge-blue',
            },
            {
              title: 'Secure Payments',
              desc: 'Record payments with screenshot proof. Full transaction history for transparency.',
              img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop',
              to: '/payment',
              tag: 'Finance',
              tagColor: 'badge-green',
            },
          ].map(({ title, desc, img, to, tag, tagColor }, i) => (
            <motion.div
              key={title}
              className="card overflow-hidden cursor-pointer group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(to)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className={`badge ${tagColor} absolute left-3 top-3`}>{tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{desc}</p>
                <span className="mt-3 flex items-center gap-1 text-sm font-semibold text-emerald-600 group-hover:gap-2 transition-all">
                  Explore <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;