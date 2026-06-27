import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, Tractor, Store, BadgeDollarSign, ShieldAlert, Info } from 'lucide-react';
import { getNotifications, markNotificationRead, deleteNotification } from '../api/api';
import { TableSkeleton } from '../components/LoadingSkeleton';
import useToast from '../hooks/useToast';
import API from '../api/api';

const TYPE_ICONS = {
  booking:  { icon: Tractor,          color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  mandi:    { icon: Store,            color: 'text-sky-600 bg-sky-100 dark:bg-sky-900/30' },
  payment:  { icon: BadgeDollarSign,  color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  dispute:  { icon: ShieldAlert,      color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  system:   { icon: Info,             color: 'text-slate-600 bg-slate-100 dark:bg-slate-700' },
};

const NotificationPage = () => {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread' | 'read'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch { toast.error('Failed to load notifications.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch { toast.error('Failed to mark as read.'); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read!');
    } catch { toast.error('Failed to mark all as read.'); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>🔔 Notifications</h1>
          <p>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn btn-secondary shrink-0">
            <CheckCheck size={16}/> Mark All Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-fit">
        {['all', 'unread', 'read'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${filter===f ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow' : 'text-slate-500 dark:text-slate-400'}`}>
            {f} {f === 'unread' && unreadCount > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Bell size={48} className="mb-4 text-slate-300"/>
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="mt-1 text-sm text-slate-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif, i) => {
            const typeInfo = TYPE_ICONS[notif.type] || TYPE_ICONS.system;
            const Icon = typeInfo.icon;
            return (
              <motion.div
                key={notif._id}
                className={`card flex items-start gap-4 p-4 transition-all ${!notif.read ? 'border-l-4 border-l-emerald-500' : ''}`}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${typeInfo.color}`}>
                  <Icon size={16}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.read ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notif.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!notif.read && (
                    <button onClick={() => markRead(notif._id)} className="btn btn-secondary py-1 px-2.5 text-xs">
                      Mark Read
                    </button>
                  )}
                  <button onClick={() => handleDelete(notif._id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;