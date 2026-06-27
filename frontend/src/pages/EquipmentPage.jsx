import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Tractor, MapPin, Edit2, Trash2, CalendarRange, X, Upload } from 'lucide-react';
import { createEquipment, getEquipment, getEquipmentById, updateEquipment, deleteEquipment, getUsers } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import useDebounce from '../hooks/useDebounce';

const CONDITIONS = ['Good', 'Average', 'Old'];
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&auto=format&fit=crop';

const EquipmentPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [equipmentImage, setEquipmentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const debouncedSearch = useDebounce(search);

  const [formData, setFormData] = useState({
    ownerId: '', name: '', type: '', rentalRatePerDay: '', village: '', condition: 'Good',
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [eqRes, usrRes] = await Promise.all([getEquipment(), getUsers()]);
      setEquipments(eqRes.data || []);
      setUsers(usrRes.data || []);
    } catch {
      toast.error('Failed to load equipment.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const resetForm = () => {
    setFormData({ ownerId: '', name: '', type: '', rentalRatePerDay: '', village: '', condition: 'Good' });
    setEquipmentImage(null);
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported.');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
        const data = await res.json();
        const village = data.address.village || data.address.town || data.address.city || '';
        setFormData(p => ({ ...p, village }));
        toast.success('Location detected!');
      } catch { toast.error('Location detection failed.'); }
    }, () => toast.error('Location access denied.'));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEquipmentImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    const { ownerId, name, type, rentalRatePerDay, village } = formData;
    if (!name || !type || !rentalRatePerDay || !village) return toast.error('Fill all required fields.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('ownerId', ownerId || user?._id || '');
      fd.append('name', name);
      fd.append('type', type);
      fd.append('rentalRatePerDay', rentalRatePerDay);
      fd.append('location', village);
      fd.append('condition', formData.condition);
      if (equipmentImage) fd.append('equipmentImage', equipmentImage);

      if (editingId) {
        await updateEquipment(editingId, fd);
        toast.success('Equipment updated!');
      } else {
        await createEquipment(fd);
        toast.success('Equipment added!');
      }
      resetForm();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      const res = await getEquipmentById(id);
      const e = res.data;
      setFormData({ ownerId: e.ownerId?._id || '', name: e.name, type: e.type, rentalRatePerDay: e.rentalRatePerDay, village: e.location, condition: e.condition });
      setImagePreview(e.equipmentImage || '');
      setEditingId(id);
      setShowForm(true);
    } catch { toast.error('Failed to load equipment.'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteEquipment(deleteTarget);
      toast.success('Equipment deleted.');
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = equipments.filter(eq => {
    const q = debouncedSearch.toLowerCase();
    const matchSearch = !q || eq.name?.toLowerCase().includes(q) || eq.type?.toLowerCase().includes(q) || eq.location?.toLowerCase().includes(q);
    const matchCond = !filterCondition || eq.condition === filterCondition;
    return matchSearch && matchCond;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>🚜 Equipment Marketplace</h1>
          <p>Browse and manage farming equipment for rent</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary shrink-0">
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9"
            placeholder="Search by name, type, or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field sm:w-40" value={filterCondition} onChange={e => setFilterCondition(e.target.value)}>
          <option value="">All Conditions</option>
          {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <Tractor size={48} className="mb-4 text-slate-300" />
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">No equipment found</h3>
          <p className="mt-1 text-sm text-slate-400">Try adjusting your search or add new equipment.</p>
          <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary mt-4">
            <Plus size={14} /> Add Equipment
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item, i) => (
            <motion.div
              key={item._id}
              className="card overflow-hidden group"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={item.equipmentImage || FALLBACK_IMG}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={e => { e.target.src = FALLBACK_IMG; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {item.isBooked && (
                  <span className="badge badge-red absolute right-2 top-2">Booked</span>
                )}
                <span className={`badge absolute left-2 top-2 ${item.condition === 'Good' ? 'badge-green' : item.condition === 'Average' ? 'badge-yellow' : 'badge-gray'}`}>
                  {item.condition}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.type}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">₹{item.rentalRatePerDay}<span className="text-xs font-normal text-slate-400">/day</span></span>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin size={12} />{item.location}
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-500 truncate">👤 {item.ownerId?.name || 'Unknown'}</p>

                <div className="mt-3 flex gap-2">
                  {user?._id === (item.ownerId?._id || item.ownerId) && (
                    <>
                      <button onClick={() => handleEdit(item._id)} className="btn btn-ghost flex-1 py-1.5 text-xs">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteTarget(item._id)} className="btn btn-danger flex-1 py-1.5 text-xs">
                        <Trash2 size={12} /> Delete
                      </button>
                    </>
                  )}
                  {!item.isBooked ? (
                    <button onClick={() => navigate(`/booking/equipment/${item._id}`)} className="btn btn-primary flex-1 py-1.5 text-xs">
                      <CalendarRange size={12} /> Book
                    </button>
                  ) : (
                    <button disabled className="btn flex-1 py-1.5 text-xs bg-slate-200 text-slate-400 cursor-not-allowed">Booked</button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm} />
            <motion.div
              className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {editingId ? 'Update Equipment' : 'Add Equipment'}
                </h2>
                <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                <select className="input-field" value={formData.ownerId} onChange={e => setFormData(p=>({...p,ownerId:e.target.value}))}>
                  <option value="">Select Owner (optional)</option>
                  {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <input className="input-field" placeholder="Equipment Name *" value={formData.name} onChange={e => setFormData(p=>({...p,name:e.target.value}))} />
                <input className="input-field" placeholder="Equipment Type *" value={formData.type} onChange={e => setFormData(p=>({...p,type:e.target.value}))} />
                <input className="input-field" type="number" placeholder="Rental Rate per Day (₹) *" value={formData.rentalRatePerDay} onChange={e => setFormData(p=>({...p,rentalRatePerDay:e.target.value}))} />
                <div className="flex gap-2">
                  <input className="input-field flex-1" placeholder="Village / Area *" value={formData.village} onChange={e => setFormData(p=>({...p,village:e.target.value}))} />
                  <button onClick={getCurrentLocation} className="btn btn-secondary shrink-0 px-3" title="Use my location">📍</button>
                </div>
                <select className="input-field" value={formData.condition} onChange={e => setFormData(p=>({...p,condition:e.target.value}))}>
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Image Upload */}
                <div>
                  {imagePreview && (
                    <img src={imagePreview} alt="preview" className="w-full h-36 object-cover rounded-xl mb-2" />
                  )}
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[var(--color-border)] p-4 hover:border-emerald-400 transition-colors">
                    <Upload size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-500">Upload image (optional)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">
                    {submitting ? 'Saving…' : editingId ? 'Update' : 'Add Equipment'}
                  </button>
                  <button onClick={resetForm} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        title="Delete Equipment"
        message="Are you sure you want to delete this equipment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default EquipmentPage;