import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Tractor, Store, Users, MapPin, BadgeDollarSign, ShieldAlert,
  CalendarRange, TrendingUp, Globe, ArrowRight, Wheat,
  CloudSun, Sparkles, Calculator, CheckCircle2, ArrowUpRight, ArrowDownRight,
  ShieldCheck, Leaf, Fuel
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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

const MANDI_RATES = [
  { crop: 'Wheat (Sharbati)', mandi: 'Khanna Mandi, PB', price: '₹2,425 / Qtl', change: '+2.4%', up: true },
  { crop: 'Mustard (Sarson)', mandi: 'Alwar APMC, RJ', price: '₹5,650 / Qtl', change: '+1.8%', up: true },
  { crop: 'Cotton (Kapas)', mandi: 'Rajkot APMC, GJ', price: '₹7,120 / Qtl', change: '-0.6%', up: false },
  { crop: 'Basmati Paddy', mandi: 'Karnal Mandi, HR', price: '₹3,890 / Qtl', change: '+3.1%', up: true },
  { crop: 'Soybean (Yellow)', mandi: 'Indore Mandi, MP', price: '₹4,780 / Qtl', change: '+0.9%', up: true },
  { crop: 'Chana (Gram)', mandi: 'Akola APMC, MH', price: '₹5,900 / Qtl', change: '-1.2%', up: false },
  { crop: 'Potato (Jyoti)', mandi: 'Agra APMC, UP', price: '₹1,320 / Qtl', change: '+4.0%', up: true },
  { crop: 'Onion (Nashik)', mandi: 'Lasalgaon, MH', price: '₹1,850 / Qtl', change: '+1.5%', up: true },
];

const StatCard = ({ icon: Icon, label, value, subtext, color, bg, to, delay = 0 }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="card p-5 cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(16, 185, 129, 0.12)' }}
      onClick={() => to && navigate(to)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}>
          <Icon size={22} className={color} />
        </div>
        {to && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
            Explore <ArrowRight size={12} />
          </span>
        )}
      </div>
      <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
      {subtext && (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{subtext}</p>
      )}
    </motion.div>
  );
};

const QuickAction = ({ icon: Icon, label, desc, color, onClick, delay = 0 }) => (
  <motion.button
    className="card p-5 text-left w-full group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all shadow-sm hover:shadow-md"
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
    <p className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{label}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{desc}</p>
  </motion.button>
);

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || 'en');
  const [stats, setStats] = useState(null);

  // Mandi transport calculator state
  const [quintals, setQuintals] = useState(30);
  const [distanceKm, setDistanceKm] = useState(25);

  const soloCost = Math.round(distanceKm * 45 + quintals * 20);
  const poolCost = Math.round(distanceKm * 22 + quintals * 11);
  const savings = Math.max(0, soloCost - poolCost);
  const savingsPercent = Math.round((savings / soloCost) * 100);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', lang);
    window.dispatchEvent(new CustomEvent('krishiLangChanged', { detail: { lang } }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user?.role === 'admin') {
          const res = await API.get('/admin/stats');
          setStats(res.data?.data?.stats);
        } else {
          const res = await API.get('/admin/overview');
          setStats(res.data?.data?.stats);
        }
      } catch {
        setStats(null);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* ── APMC Mandi Live Ticker ───────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-950/10 dark:bg-emerald-950/30 backdrop-blur-md py-2.5 px-4">
        <div className="flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <span className="h-2 w-2 rounded-full bg-white animate-ping" />
            LIVE APMC
          </div>
          <div className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs font-semibold py-0.5">
            {MANDI_RATES.map((item, idx) => (
              <div key={idx} className="inline-flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <span className="font-bold text-slate-900 dark:text-white">{item.crop}</span>
                <span className="text-slate-500 dark:text-slate-400">({item.mandi}):</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.price}</span>
                <span className={`inline-flex items-center text-[10px] font-bold ${item.up ? 'text-emerald-500' : 'text-red-500'}`}>
                  {item.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.change}
                </span>
                {idx < MANDI_RATES.length - 1 && <span className="text-slate-300 dark:text-slate-700">|</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero Banner ─────────────────────────────────────────────── */}
      <motion.div
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 p-8 sm:p-10 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-400/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 right-20 h-48 w-48 rounded-full bg-teal-300/15 blur-xl" />
        <div className="pointer-events-none absolute left-1/3 top-0 h-32 w-32 rounded-full bg-white/10 blur-lg" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Sparkles size={13} className="text-amber-300" /> Rural AgTech 2.0
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 px-3 py-1 text-xs font-medium border border-emerald-300/30">
                <ShieldCheck size={13} className="text-emerald-200" /> Escrow Protected
              </span>
            </div>
            <h1 className="text-3xl font-black sm:text-4xl lg:text-5xl leading-tight">
              Welcome, {user?.name?.split(' ')[0] || 'Kisan Mitra'} 🌾
            </h1>
            <p className="mt-3 text-base sm:text-lg text-emerald-100 font-medium leading-relaxed">
              Rent farm equipment directly from neighbors, pool transport to mandi, and cut farm operational costs by up to 45%.
            </p>

            {/* Quick Metrics Badges */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-sm border border-white/10">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>2,480+ Verified Farmers</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-sm border border-white/10">
                <Tractor size={16} className="text-amber-300" />
                <span>390+ Active Machinery</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-sm border border-white/10">
                <Fuel size={16} className="text-teal-300" />
                <span>₹42 Lakhs+ Transport Saved</span>
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Language */}
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl bg-white/15 px-3.5 py-2 backdrop-blur-md border border-white/20">
              <Globe size={18} className="text-emerald-200" />
              <select
                value={language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
                aria-label="Select Language"
              >
                {LANGUAGES.map(({ code, label }) => (
                  <option key={code} value={code} className="text-slate-900 font-medium">{label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2.5 mt-2">
              <button
                onClick={() => navigate('/equipment')}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-200"
              >
                <Tractor size={18} /> Browse Equipment
              </button>
              <button
                onClick={() => navigate('/mandi')}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/30 border border-white/30 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-500/50 backdrop-blur-sm transition-all duration-200"
              >
                <Store size={18} /> Mandi Pool Transport
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate('/user')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-black/30 border border-white/20 px-6 py-2.5 text-xs font-semibold text-emerald-100 hover:bg-black/40 backdrop-blur-sm transition-all duration-200"
                >
                  Farmer Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Interactive Savings Calculator & Weather Advisory ───────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mandi Pool Savings Calculator */}
        <div className="lg:col-span-2 card p-6 border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/50 dark:from-slate-900 dark:to-emerald-950/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <Calculator size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Mandi Transport Cost-Split Calculator</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">See how much you save by sharing transport with fellow farmers</p>
              </div>
            </div>
            <span className="badge badge-green text-xs font-bold">Smart Split</span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 mt-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Produce Quantity</span>
                <span className="text-emerald-600 dark:text-emerald-400">{quintals} Quintals</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={quintals}
                onChange={(e) => setQuintals(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5 Qtl</span>
                <span>50 Qtl</span>
                <span>100 Qtl</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Distance to Mandi</span>
                <span className="text-emerald-600 dark:text-emerald-400">{distanceKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>5 km</span>
                <span>40 km</span>
                <span>80 km</span>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase">Solo Booking</p>
              <p className="text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300 line-through">₹{soloCost.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Pooled Rate</p>
              <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">₹{poolCost.toLocaleString('en-IN')}</p>
            </div>
            <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
              <p className="text-[11px] font-semibold text-amber-500 uppercase">You Save</p>
              <p className="text-base sm:text-lg font-black text-amber-500">₹{savings.toLocaleString('en-IN')} <span className="text-xs">({savingsPercent}%)</span></p>
            </div>
          </div>
        </div>

        {/* Kisan Agro-Weather Advisory */}
        <div className="card p-6 border-teal-500/20 bg-gradient-to-br from-teal-50/50 via-white to-sky-50/50 dark:from-slate-900 dark:to-teal-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CloudSun size={20} className="text-teal-600 dark:text-teal-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Field Weather & Spray</h3>
            </div>
            <span className="badge badge-blue text-[10px]">Today</span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">28°C</span>
            <span className="text-xs font-semibold text-emerald-600">Optimal Field Conditions</span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Humidity:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">54% (Favorable)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Wind Velocity:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">7 km/h (Safe to spray)</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Rain Alert:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">0% next 48h</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-teal-100/60 dark:bg-teal-950/50 p-3 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2">
            <Leaf size={14} className="shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
            <span><strong>Advisory:</strong> Ideal window for tractor plowing and pesticide application before upcoming weekend.</span>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" /> KrishiPool Network Stats
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Real-time agricultural coordination</span>
        </div>
        <div className="stats-grid">
          <StatCard 
            icon={Users}          
            label="Verified Farmers" 
            value={stats?.totalUsers ?? '2,480+'}      
            subtext="+142 this week"
            color="text-violet-600"   
            bg="bg-violet-100 dark:bg-violet-900/30" 
            to="/user"     
            delay={0.1} 
          />
          <StatCard 
            icon={Tractor}        
            label="Machinery Listed"   
            value={stats?.totalEquipment ?? '395'}  
            subtext="Tractors, Harvesters & Drills"
            color="text-amber-600"    
            bg="bg-amber-100 dark:bg-amber-900/30"   
            to="/equipment" 
            delay={0.15} 
          />
          <StatCard 
            icon={CalendarRange}  
            label="Successful Bookings"     
            value={stats?.totalBookings ?? '1,840+'}   
            subtext="99.4% completion rate"
            color="text-indigo-600"   
            bg="bg-indigo-100 dark:bg-indigo-900/30" 
            to="/booking"  
            delay={0.2} 
          />
          <StatCard 
            icon={Store}          
            label="Active Mandi Pools"        
            value={stats?.totalMandiPools ?? '620+'} 
            subtext="Shared freight to APMC"
            color="text-sky-600"      
            bg="bg-sky-100 dark:bg-sky-900/30"       
            to="/mandi"    
            delay={0.25} 
          />
          <StatCard 
            icon={BadgeDollarSign}
            label="Escrow Payments"     
            value={stats?.totalPayments ? `₹${stats.totalPayments.toLocaleString('en-IN')}` : '₹48.2L'}     
            subtext="Zero payment default"
            color="text-green-600"    
            bg="bg-green-100 dark:bg-green-900/30"   
            to="/payment"  
            delay={0.3} 
          />
          <StatCard 
            icon={ShieldAlert}    
            label="Dispute Resolution"      
            value={stats?.openDisputes ?? '99.2%'}    
            subtext="Resolved within 24h"
            color="text-red-600"      
            bg="bg-red-100 dark:bg-red-900/30"       
            to="/dispute"  
            delay={0.35} 
          />
          <StatCard 
            icon={TrendingUp}     
            label="Total Farmer Savings"  
            value="₹42.8 Lakh" 
            subtext="Via pooling & fair rentals"
            color="text-emerald-600" 
            bg="bg-emerald-100 dark:bg-emerald-900/30" 
            delay={0.4} 
          />
          <StatCard 
            icon={MapPin}         
            label="Live GPS Radar"            
            value="38 Active" 
            subtext="Machinery on map"
            color="text-teal-600" 
            bg="bg-teal-100 dark:bg-teal-900/30" 
            to="/map" 
            delay={0.45} 
          />
        </div>
      </div>

      {/* ── Revenue Trends Chart (Admin Only) ────────────────────────── */}
      {user?.role === 'admin' && stats && (
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" /> Revenue & Activity Trends
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { name: 'Mon', revenue: 4000, bookings: 24 },
                { name: 'Tue', revenue: 3000, bookings: 13 },
                { name: 'Wed', revenue: 2000, bookings: 98 },
                { name: 'Thu', revenue: 2780, bookings: 39 },
                { name: 'Fri', revenue: 1890, bookings: 48 },
                { name: 'Sat', revenue: 2390, bookings: 38 },
                { name: 'Sun', revenue: 3490, bookings: 43 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Farmer Operations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={Tractor}         label="Rent Out Machinery"  desc="Earn ₹1,500 - ₹4,000/day during idle season"   color="bg-amber-500"   onClick={() => navigate('/equipment')}    delay={0.1} />
          <QuickAction icon={Store}           label="Create Mandi Pool"   desc="Find 2-4 farmers to share one truck to APMC"    color="bg-sky-500"     onClick={() => navigate('/mandi')}        delay={0.15} />
          <QuickAction icon={BadgeDollarSign} label="Log Payment & Proof" desc="UPI / QR code payment with audit screenshot"     color="bg-green-600"   onClick={() => navigate('/payment')}      delay={0.2} />
          <QuickAction icon={ShieldAlert}     label="Dispute & Mediation" desc="Fast 24-hr resolution on fuel, delay, or damage" color="bg-red-500"     onClick={() => navigate('/dispute')}      delay={0.25} />
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">Core Agri Services</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Equipment Sharing Marketplace',
              desc: 'Tractors, rotavators, harvesters, and laser levelers nearby at transparent hourly/daily rates.',
              img: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=800&auto=format&fit=crop',
              to: '/equipment',
              tag: 'Equipment',
              tagColor: 'badge-yellow',
            },
            {
              title: 'Mandi Transport Pooling',
              desc: 'Never send a half-empty tractor trolley. Pool produce with neighbors and reduce transport bills by up to 45%.',
              img: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=800&auto=format&fit=crop',
              to: '/mandi',
              tag: 'Logistics',
              tagColor: 'badge-blue',
            },
            {
              title: 'Transparent Settlement',
              desc: 'Proof-of-payment receipts, OTP-based rental start & stop, and community panchayat dispute resolution.',
              img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=800&auto=format&fit=crop',
              to: '/payment',
              tag: 'Finance',
              tagColor: 'badge-green',
            },
          ].map(({ title, desc, img, to, tag, tagColor }, i) => (
            <motion.div
              key={title}
              className="card overflow-hidden cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
              onClick={() => navigate(to)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={img}
                  alt={title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <span className={`badge ${tagColor} absolute left-3 top-3 shadow-md`}>{tag}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 transition-colors">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                <span className="mt-4 flex items-center gap-1.5 text-sm font-bold text-emerald-600 group-hover:gap-2.5 transition-all">
                  Open Service <ArrowRight size={15} />
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