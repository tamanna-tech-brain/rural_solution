import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Tractor, CalendarRange, Store, BadgeDollarSign, ShieldAlert, TrendingUp, Crown, UserCheck, UserX } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TableSkeleton, StatSkeleton } from '../components/LoadingSkeleton';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import API from '../api/api';

const StatCard = ({ icon: Icon, label, value, color, bg, delay = 0 }) => (
  <motion.div className="card p-5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay}}>
    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} mb-3`}><Icon size={20} className={color}/></div>
    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value ?? '—'}</p>
    <p className="text-sm text-slate-500 mt-1">{label}</p>
  </motion.div>
);

const AdminPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, uRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users?limit=20'),
      ]);
      setStats(sRes.data?.data);
      setUsers(uRes.data?.data || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load admin data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleUpdate = async (userId, role) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      toast.success(`User role updated to ${role}.`);
      fetchData();
    } catch (err) { toast.error(err?.response?.data?.message || 'Role update failed.'); }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await API.put(`/admin/users/${userId}/deactivate`);
      toast.success('User deactivated.');
      fetchData();
    } catch (err) { toast.error(err?.response?.data?.message || 'Deactivation failed.'); }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <ShieldAlert size={32} className="text-red-500"/>
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Access Only</h2>
        <p className="mt-2 text-sm text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  const s = stats?.stats;
  const chartData = stats?.monthlyBookings?.map(m => ({
    name: new Date(2024, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    bookings: m.count,
    revenue: m.revenue,
  })) || [];

  const filteredUsers = searchUser
    ? users.filter(u => u.name?.toLowerCase().includes(searchUser.toLowerCase()) || u.email?.toLowerCase().includes(searchUser.toLowerCase()))
    : users;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <h1>🛡️ Admin Panel</h1>
        <p>Platform-wide statistics and user management</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="stats-grid">{[1,2,3,4,5,6].map(i=><StatSkeleton key={i}/>)}</div>
      ) : (
        <div className="stats-grid">
          <StatCard icon={Users}          label="Total Farmers"    value={s?.totalUsers}      color="text-violet-600"   bg="bg-violet-100 dark:bg-violet-900/30"   delay={0.05} />
          <StatCard icon={Tractor}        label="Equipment"        value={s?.totalEquipment}  color="text-amber-600"    bg="bg-amber-100 dark:bg-amber-900/30"     delay={0.1} />
          <StatCard icon={CalendarRange}  label="Bookings"         value={s?.totalBookings}   color="text-indigo-600"   bg="bg-indigo-100 dark:bg-indigo-900/30"   delay={0.15} />
          <StatCard icon={Store}          label="Mandi Pools"      value={s?.totalMandiPools} color="text-sky-600"      bg="bg-sky-100 dark:bg-sky-900/30"         delay={0.2} />
          <StatCard icon={ShieldAlert}    label="Open Disputes"    value={s?.openDisputes}    color="text-red-600"      bg="bg-red-100 dark:bg-red-900/30"         delay={0.25} />
          <StatCard icon={TrendingUp}     label="Total Revenue"    value={s?.totalRevenue ? `₹${s.totalRevenue.toLocaleString('en-IN')}` : '₹0'} color="text-emerald-600" bg="bg-emerald-100 dark:bg-emerald-900/30" delay={0.3} />
        </div>
      )}

      {/* Monthly Chart */}
      {chartData.length > 0 && (
        <motion.div className="card p-6" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.4}}>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">📈 Monthly Bookings (Last 6 Months)</h2>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize:12}} />
                <YAxis tick={{fontSize:12}} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
                  formatter={(v, k) => [k === 'revenue' ? `₹${v}` : v, k === 'revenue' ? 'Revenue' : 'Bookings']}
                />
                <Bar dataKey="bookings" fill="#16a34a" radius={[6,6,0,0]} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* User Management */}
      <motion.div className="card overflow-hidden" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.5}}>
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)] flex-wrap gap-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">👥 User Management</h2>
          <input
            className="input-field w-56"
            placeholder="Search users…"
            value={searchUser}
            onChange={e => setSearchUser(e.target.value)}
          />
        </div>
        {loading ? <TableSkeleton rows={5} cols={5} /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Village</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-xs font-bold text-white shrink-0">
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{u.phone}</td>
                    <td className="text-sm text-slate-600 dark:text-slate-400">{u.village}</td>
                    <td>
                      <span className={`badge ${u.role==='admin'?'badge-purple':'badge-blue'}`}>
                        {u.role==='admin' && <Crown size={10}/>} {u.role}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {u.role !== 'admin' ? (
                          <button onClick={() => handleRoleUpdate(u._id, 'admin')} className="btn btn-secondary py-1 px-2 text-xs">
                            <Crown size={10}/> Promote
                          </button>
                        ) : (
                          <button onClick={() => handleRoleUpdate(u._id, 'farmer')} className="btn btn-ghost py-1 px-2 text-xs">
                            <UserCheck size={10}/> Demote
                          </button>
                        )}
                        {u._id !== user?._id && (
                          <button onClick={() => handleDeactivate(u._id)} className="btn btn-danger py-1 px-2 text-xs">
                            <UserX size={10}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminPage;
