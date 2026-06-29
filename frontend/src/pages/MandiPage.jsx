import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Truck, MapPin, Calendar, Users, Trash2, Edit2, X, Navigation } from 'lucide-react';
import { createMandi, getMandi, updateMandi, deleteMandi, getMandiById, getUsers, updateMandiLocation } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const STATUS_COLORS = {
  Pending:   'badge-yellow',
  Confirmed: 'badge-blue',
  Cancelled: 'badge-red',
  onTrip:    'badge-purple',
  completed: 'badge-green',
};

const MandiPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [mandiList, setMandiList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [trackingId, setTrackingId] = useState(null); // GPS tracking pool

  const [formData, setFormData] = useState({
    mandiDate: '', mandiLocation: '', driverName: '', driverPhone: '',
    truckCapacity: '', status: 'Pending',
    farmersJoined: [{ farmerId: '', cropType: '', cropWeight: '', shareCost: '' }],
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [mRes, uRes] = await Promise.all([getMandi(), getUsers()]);
      setMandiList(mRes.data.data || mRes.data || []);
      setUsers(uRes.data.data || uRes.data || []);
    } catch { toast.error('Failed to load mandi pools.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  // GPS tracking — fixed: clears on unmount and when trackingId changes
  useEffect(() => {
    if (!trackingId) return;
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          await updateMandiLocation(trackingId, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        } catch (err) { console.error('Location update error:', err); }
      }, (err) => console.error('Geolocation error:', err));
    }, 5000);
    return () => clearInterval(interval); // ✅ fixed memory leak
  }, [trackingId]);

  const resetForm = () => {
    setFormData({ mandiDate: '', mandiLocation: '', driverName: '', driverPhone: '', truckCapacity: '', status: 'Pending', farmersJoined: [{ farmerId: '', cropType: '', cropWeight: '', shareCost: '' }] });
    setEditingId(null);
    setShowForm(false);
  };

  const setField = (field, value) => setFormData(p => ({ ...p, [field]: value }));

  const updateFarmer = (idx, field, value) => {
    setFormData(p => {
      const farmers = [...p.farmersJoined];
      farmers[idx] = { ...farmers[idx], [field]: value };
      return { ...p, farmersJoined: farmers };
    });
  };

  const addFarmer = () => setFormData(p => ({ ...p, farmersJoined: [...p.farmersJoined, { farmerId: '', cropType: '', cropWeight: '', shareCost: '' }] }));
  const removeFarmer = (idx) => setFormData(p => ({ ...p, farmersJoined: p.farmersJoined.filter((_, i) => i !== idx) }));

  const handleSubmit = async () => {
    if (!formData.mandiDate || !formData.mandiLocation || !formData.truckCapacity) {
      return toast.error('Fill all required fields.');
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        ownerId: user?._id,
        farmersJoined: formData.farmersJoined.filter(f => f.farmerId),
      };
      if (editingId) {
        await updateMandi(editingId, payload);
        toast.success('Mandi pool updated!');
      } else {
        await createMandi(payload);
        toast.success('Mandi pool created!');
      }
      resetForm();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    } finally { setSubmitting(false); }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getMandiById(id);
      const m = res.data;
      setFormData({
        mandiDate: m.mandiDate?.split('T')[0] || '',
        mandiLocation: m.mandiLocation || '',
        driverName: m.driverName || '',
        driverPhone: m.driverPhone || '',
        truckCapacity: m.truckCapacity || '',
        status: m.status || 'Pending',
        farmersJoined: m.farmersJoined?.length
          ? m.farmersJoined.map(f => ({ farmerId: f.farmerId?._id || f.farmerId || '', cropType: f.cropType || '', cropWeight: f.cropWeight || '', shareCost: f.shareCost || '' }))
          : [{ farmerId: '', cropType: '', cropWeight: '', shareCost: '' }],
      });
      setEditingId(id);
      setShowForm(true);
    } catch { toast.error('Failed to load mandi pool.'); }
  };

  const confirmDelete = async () => {
    try {
      await deleteMandi(deleteTarget);
      toast.success('Mandi pool deleted.');
      fetchAll();
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed.'); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>🚛 Mandi Pool</h1>
          <p>Share transport to the mandi and reduce costs</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary shrink-0">
          <Plus size={16} /> Create Pool
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i=><CardSkeleton key={i}/>)}</div>
      ) : mandiList.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Truck size={48} className="mb-4 text-slate-300" />
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">No mandi pools yet</h3>
          <p className="mt-1 text-sm text-slate-400">Create a pool to start sharing transport costs.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary mt-4"><Plus size={14}/>Create Pool</button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mandiList.map((pool, i) => (
            <motion.div key={pool._id} className="card p-5" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} whileHover={{y:-3}}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{pool.mandiLocation}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">By {pool.ownerId?.name || 'Unknown'}</p>
                </div>
                <span className={`badge shrink-0 ${STATUS_COLORS[pool.status]||'badge-gray'}`}>{pool.status}</span>
              </div>
              <div className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2"><Calendar size={14}/> {new Date(pool.mandiDate).toLocaleDateString()}</p>
                <p className="flex items-center gap-2"><Truck size={14}/> {pool.driverName || 'TBA'} — {pool.truckCapacity} tons</p>
                <p className="flex items-center gap-2"><Users size={14}/> {pool.farmersJoined?.length || 0} farmers joined</p>
                {pool.driverLocation?.lat && (
                  <p className="flex items-center gap-2 text-emerald-600"><MapPin size={14}/> Live GPS active</p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => navigate(`/booking/mandi/${pool._id}`)} disabled={pool.isBooked}
                  className={`btn flex-1 py-1.5 text-xs ${pool.isBooked ? 'btn-ghost opacity-50 cursor-not-allowed' : 'btn-primary'}`}>
                  {pool.isBooked ? 'Full' : 'Join Trip'}
                </button>
                <button onClick={() => navigate(`/trip/${pool._id}`)} className="btn btn-secondary flex-1 py-1.5 text-xs">
                  <Navigation size={12}/> Track
                </button>
                {user?._id === (pool.ownerId?._id || pool.ownerId) && (
                  <>
                    <button onClick={() => handleEdit(pool._id)} className="btn btn-ghost py-1.5 px-2.5 text-xs"><Edit2 size={12}/></button>
                    <button onClick={() => setDeleteTarget(pool._id)} className="btn btn-danger py-1.5 px-2.5 text-xs"><Trash2 size={12}/></button>
                    {pool.tripStarted && (
                      <button onClick={() => setTrackingId(p => p === pool._id ? null : pool._id)}
                        className={`btn py-1.5 px-2.5 text-xs ${trackingId === pool._id ? 'btn-danger' : 'btn-secondary'}`}>
                        {trackingId === pool._id ? '⏹ Stop GPS' : '📍 Start GPS'}
                      </button>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
            <motion.div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{editingId ? 'Edit Mandi Pool' : 'Create Mandi Pool'}</h2>
                <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <input className="input-field" type="date" placeholder="Mandi Date *" value={formData.mandiDate} onChange={e=>setField('mandiDate',e.target.value)} />
                <input className="input-field" placeholder="Mandi Location *" value={formData.mandiLocation} onChange={e=>setField('mandiLocation',e.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="input-field" placeholder="Driver Name" value={formData.driverName} onChange={e=>setField('driverName',e.target.value)} />
                  <input className="input-field" placeholder="Driver Phone" value={formData.driverPhone} onChange={e=>setField('driverPhone',e.target.value)} />
                </div>
                <input className="input-field" type="number" placeholder="Truck Capacity (tons) *" value={formData.truckCapacity} onChange={e=>setField('truckCapacity',e.target.value)} />
                <select className="input-field" value={formData.status} onChange={e=>setField('status',e.target.value)}>
                  {['Pending','Confirmed','Cancelled','onTrip','completed'].map(s=><option key={s} value={s}>{s}</option>)}
                </select>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Farmers</p>
                    <button onClick={addFarmer} className="btn btn-secondary py-1 px-3 text-xs"><Plus size={12}/> Add</button>
                  </div>
                  {formData.farmersJoined.map((f, idx) => (
                    <div key={idx} className="rounded-xl border border-[var(--color-border)] p-3 mb-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-slate-500">Farmer {idx+1}</p>
                        {idx > 0 && <button onClick={()=>removeFarmer(idx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>}
                      </div>
                      <select className="input-field text-sm" value={f.farmerId} onChange={e=>updateFarmer(idx,'farmerId',e.target.value)}>
                        <option value="">Select Farmer</option>
                        {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                      <div className="grid grid-cols-3 gap-2">
                        <input className="input-field text-sm" placeholder="Crop" value={f.cropType} onChange={e=>updateFarmer(idx,'cropType',e.target.value)} />
                        <input className="input-field text-sm" type="number" placeholder="Weight" value={f.cropWeight} onChange={e=>updateFarmer(idx,'cropWeight',e.target.value)} />
                        <input className="input-field text-sm" type="number" placeholder="Cost" value={f.shareCost} onChange={e=>updateFarmer(idx,'shareCost',e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Saving…' : editingId ? 'Update Pool' : 'Create Pool'}</button>
                  <button onClick={resetForm} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} title="Delete Mandi Pool" message="Delete this mandi pool? This cannot be undone." confirmText="Delete" confirmVariant="danger" />
    </div>
  );
};

export default MandiPage;