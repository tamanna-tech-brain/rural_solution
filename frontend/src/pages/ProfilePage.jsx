import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Globe, Shield, CheckCircle, Star, Edit2, Save, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import API from '../api/api';

const ProfilePage = () => {
  const { user, updateProfile, logoutUser } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', village: '', region: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        village: user.village || '',
        region: user.region || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name || !formData.village) return toast.error('Name and village are required.');
    setLoading(true);
    try {
      const res = await API.put(`/users/${user._id}`, formData);
      updateProfile(res.data?.data || res.data);
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  const trustColor =
    user?.trustScore >= 8 ? 'text-green-600' :
    user?.trustScore >= 5 ? 'text-amber-600' : 'text-red-500';

  if (!user) {
    return (
      <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <User size={48} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Not Logged In</h2>
        <p className="mt-2 text-sm text-slate-500">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <motion.div className="card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-700 text-3xl font-bold text-white shadow-lg">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-emerald-500" title="Online" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user.name}</h2>
              <div className="mt-1 flex flex-wrap gap-2">
                <span className={`badge ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'} capitalize`}>
                  {user.role}
                </span>
                {user.verified && (
                  <span className="badge badge-green flex items-center gap-1">
                    <CheckCircle size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(p => !p)}
            className={`btn ${editing ? 'btn-ghost' : 'btn-secondary'} py-2 px-3 text-sm`}
          >
            {editing ? <><X size={14}/> Cancel</> : <><Edit2 size={14}/> Edit</>}
          </button>
        </div>

        {/* Trust Score */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Star size={14} className="text-amber-500" /> Trust Score
            </span>
            <span className={`text-2xl font-bold ${trustColor}`}>{user.trustScore}/10</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-green-600 transition-all duration-700"
              style={{ width: `${(user.trustScore / 10) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {user.trustScore >= 8 ? '⭐ Excellent reputation' : user.trustScore >= 5 ? '✅ Good standing' : '⚠️ Needs improvement'}
          </p>
        </div>

        {/* Info Fields */}
        <div className="space-y-3">
          {[
            { icon: User,  label: 'Full Name',  key: 'name',    type: 'text' },
            { icon: Mail,  label: 'Email',      key: 'email',   type: 'email' },
            { icon: Phone, label: 'Phone',      key: 'phone',   type: 'tel' },
            { icon: MapPin,label: 'Village',    key: 'village', type: 'text' },
            { icon: Globe, label: 'Region',     key: 'region',  type: 'text' },
          ].map(({ icon: Icon, label, key, type }) => (
            <div key={key} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700">
                <Icon size={15} className="text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                {editing ? (
                  <input
                    type={type}
                    className="input-field py-2 text-sm"
                    value={formData[key]}
                    onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))}
                    disabled={key === 'email' || key === 'phone'}
                  />
                ) : (
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user[key] || '—'}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mt-5"
          >
            <button onClick={handleSave} disabled={loading} className="btn btn-primary flex-1 justify-center">
              <Save size={14} /> {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <button onClick={() => setEditing(false)} className="btn btn-ghost flex-1">Cancel</button>
          </motion.div>
        )}
      </motion.div>

      {/* Account Security */}
      <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" /> Account Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Verification</p>
              <p className="text-xs text-slate-500">Your email address is verified</p>
            </div>
            <span className={`badge ${user.verified ? 'badge-green' : 'badge-red'}`}>
              {user.verified ? '✓ Verified' : 'Unverified'}
            </span>
          </div>
          <div className="h-px bg-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Account Status</p>
              <p className="text-xs text-slate-500">Your account is active</p>
            </div>
            <span className="badge badge-green">Active</span>
          </div>
          <div className="h-px bg-[var(--color-border)]" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</p>
              <p className="text-xs text-slate-500">Your platform access level</p>
            </div>
            <span className={`badge capitalize ${user.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>{user.role}</span>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div className="card border-red-200 dark:border-red-800 p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="font-bold text-red-600 mb-3">Danger Zone</h3>
        <button
          onClick={logoutUser}
          className="btn btn-danger w-full justify-center"
        >
          Sign Out of KrishiPool
        </button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
