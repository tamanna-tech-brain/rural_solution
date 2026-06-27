import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShieldAlert, CheckCircle, Trash2, X } from 'lucide-react';
import { createDispute, getDisputes, resolveDispute, deleteDispute } from '../api/api';
import { getUsers, getBookings, getMandi } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const DisputePage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    against: '', bookingType: 'Equipment', bookingId: '', reason: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dRes, uRes, bRes, mRes] = await Promise.all([getDisputes(), getUsers(), getBookings(), getMandi()]);
      setDisputes(dRes.data || []);
      setUsers(uRes.data || []);
      setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || []);
      setMandis(mRes.data || []);
    } catch { toast.error('Failed to load disputes.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setFormData({ against: '', bookingType: 'Equipment', bookingId: '', reason: '' });
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.against || !formData.reason) return toast.error('Fill all required fields.');
    setSubmitting(true);
    try {
      await createDispute(formData);
      toast.success('Dispute raised successfully.');
      resetForm();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to raise dispute.');
    } finally { setSubmitting(false); }
  };

  const handleResolve = async (id) => {
    try {
      await resolveDispute(id);
      toast.success('Dispute resolved!');
      fetchAll();
    } catch (err) { toast.error(err?.response?.data?.message || 'Failed to resolve.'); }
  };

  const confirmDelete = async () => {
    try {
      await deleteDispute(deleteTarget);
      toast.success('Dispute deleted.');
      fetchAll();
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed.'); }
    finally { setDeleteTarget(null); }
  };

  const filtered = filterStatus ? disputes.filter(d => d.status === filterStatus) : disputes;
  const openCount = disputes.filter(d => d.status === 'open').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>⚖️ Disputes</h1>
          <p>Manage and resolve conflicts between farmers</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary shrink-0"><Plus size={16}/> Raise Dispute</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-red-500">{openCount}</p>
          <p className="text-sm text-slate-500 mt-1">Open Disputes</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-3xl font-bold text-green-600">{disputes.filter(d=>d.status==='resolved').length}</p>
          <p className="text-sm text-slate-500 mt-1">Resolved</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <select className="input-field w-44" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Disputes List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <ShieldAlert size={48} className="mb-4 text-slate-300"/>
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">No disputes found</h3>
          <p className="mt-1 text-sm text-slate-400">All clear! No conflicts to resolve.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d, i) => (
            <motion.div key={d._id} className="card p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert size={16} className={d.status==='open'?'text-red-500':'text-green-500'}/>
                    <span className={`badge ${d.status==='open'?'badge-red':'badge-green'}`}>{d.status}</span>
                    <span className="badge badge-gray">{d.bookingType}</span>
                  </div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{d.reason}</p>
                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Raised by: <span className="font-medium text-slate-700 dark:text-slate-300">{d.raisedBy?.name}</span></p>
                    <p>Against: <span className="font-medium text-slate-700 dark:text-slate-300">{d.against?.name}</span></p>
                    <p>{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {d.status === 'open' && d.raisedBy?._id === user?._id && (
                    <button onClick={() => handleResolve(d._id)} className="btn btn-secondary py-1.5 px-3 text-xs">
                      <CheckCircle size={12}/> Resolve
                    </button>
                  )}
                  {d.raisedBy?._id === user?._id && (
                    <button onClick={() => setDeleteTarget(d._id)} className="btn btn-danger py-1.5 px-3 text-xs">
                      <Trash2 size={12}/>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm}/>
            <motion.div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Raise Dispute</h2>
                <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <select className="input-field" value={formData.against} onChange={e=>setFormData(p=>({...p,against:e.target.value}))}>
                  <option value="">Against (User) *</option>
                  {users.filter(u=>u._id!==user?._id).map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <select className="input-field" value={formData.bookingType} onChange={e=>setFormData(p=>({...p,bookingType:e.target.value,bookingId:''}))}>
                  <option value="Equipment">Equipment Booking</option>
                  <option value="Mandi">Mandi Pool</option>
                </select>
                {formData.bookingType === 'Equipment' && (
                  <select className="input-field" value={formData.bookingId} onChange={e=>setFormData(p=>({...p,bookingId:e.target.value}))}>
                    <option value="">Select Related Booking</option>
                    {bookings.map(b=><option key={b._id} value={b._id}>{b.equipmentId?.name||'Equipment'} — ₹{b.totalAmount}</option>)}
                  </select>
                )}
                {formData.bookingType === 'Mandi' && (
                  <select className="input-field" value={formData.bookingId} onChange={e=>setFormData(p=>({...p,bookingId:e.target.value}))}>
                    <option value="">Select Related Mandi Pool</option>
                    {mandis.map(m=><option key={m._id} value={m._id}>{m.mandiLocation}</option>)}
                  </select>
                )}
                <textarea className="input-field h-24 resize-none" placeholder="Describe the issue *" value={formData.reason} onChange={e=>setFormData(p=>({...p,reason:e.target.value}))} />
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">{submitting?'Submitting…':'Raise Dispute'}</button>
                  <button onClick={resetForm} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} title="Delete Dispute" message="Delete this dispute?" confirmText="Delete" confirmVariant="danger"/>
    </div>
  );
};

export default DisputePage;