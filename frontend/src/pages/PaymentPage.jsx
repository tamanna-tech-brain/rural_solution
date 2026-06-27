import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BadgeDollarSign, Trash2, X, Upload, ExternalLink } from 'lucide-react';
import { createPayment, getPayments, updatePayment, deletePayment } from '../api/api';
import { getUsers, getBookings, getMandi } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const STATUS_COLORS = { pending: 'badge-yellow', completed: 'badge-green', disputed: 'badge-red' };

const PaymentPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  const [formData, setFormData] = useState({
    payerId: '', payeeId: '', amount: '', status: 'pending',
    paymentType: 'Equipment', equipmentBookingId: '', mandiId: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, uRes, bRes, mRes] = await Promise.all([getPayments(), getUsers(), getBookings(), getMandi()]);
      setPayments(pRes.data || []);
      setUsers(uRes.data || []);
      setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || []);
      setMandis(mRes.data || []);
    } catch { toast.error('Failed to load payments.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setFormData({ payerId: '', payeeId: '', amount: '', status: 'pending', paymentType: 'Equipment', equipmentBookingId: '', mandiId: '' });
    setScreenshot(null);
    setScreenshotPreview('');
    setShowForm(false);
  };

  const handleImageChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setScreenshot(f);
    setScreenshotPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!formData.payerId || !formData.payeeId || !formData.amount) return toast.error('Fill all required fields.');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && fd.append(k, v));
      if (screenshot) fd.append('paymentScreenshot', screenshot);
      await createPayment(fd);
      toast.success('Payment recorded!');
      resetForm();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create payment.');
    } finally { setSubmitting(false); }
  };

  const confirmDelete = async () => {
    try {
      await deletePayment(deleteTarget);
      toast.success('Payment deleted.');
      fetchAll();
    } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed.'); }
    finally { setDeleteTarget(null); }
  };

  const filtered = filterStatus ? payments.filter(p => p.status === filterStatus) : payments;
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>💰 Payments</h1>
          <p>Track all payment records and transactions</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary shrink-0"><Plus size={16}/> Record Payment</button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Payments', value: payments.length, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Completed Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Pending Amount', value: `₹${pendingAmount.toLocaleString('en-IN')}`, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Disputed', value: payments.filter(p=>p.status==='disputed').length, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="card p-4">
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg} mb-2`}>
              <BadgeDollarSign size={18} className={color} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex justify-end">
        <select className="input-field w-44" value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="disputed">Disputed</option>
        </select>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i=><CardSkeleton key={i}/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <BadgeDollarSign size={48} className="mb-4 text-slate-300" />
          <h3 className="font-semibold text-slate-600 dark:text-slate-300">No payments found</h3>
          <button onClick={() => setShowForm(true)} className="btn btn-primary mt-4"><Plus size={14}/> Record First Payment</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <motion.div key={p._id} className="card p-5" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
              {p.paymentScreenshot && (
                <div className="mb-3 relative group">
                  <img src={p.paymentScreenshot} alt="receipt" className="w-full h-32 object-cover rounded-xl" />
                  <a href={p.paymentScreenshot} target="_blank" rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <ExternalLink size={20} className="text-white" />
                  </a>
                </div>
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-2xl font-bold text-emerald-600">₹{p.amount?.toLocaleString('en-IN')}</p>
                  <span className="badge badge-gray text-xs">{p.paymentType}</span>
                </div>
                <span className={`badge ${STATUS_COLORS[p.status]||'badge-gray'}`}>{p.status}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-500">
                <p>From: <span className="font-medium text-slate-700 dark:text-slate-300">{p.payerId?.name}</span></p>
                <p>To: <span className="font-medium text-slate-700 dark:text-slate-300">{p.payeeId?.name}</span></p>
                <p>{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              {p.createdBy?._id === user?._id && (
                <button onClick={() => setDeleteTarget(p._id)} className="btn btn-danger w-full mt-3 py-1.5 text-xs">
                  <Trash2 size={12}/> Delete
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={resetForm}/>
            <motion.div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl max-h-[90vh] overflow-y-auto" initial={{scale:0.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.95,opacity:0}}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Record Payment</h2>
                <button onClick={resetForm} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18}/></button>
              </div>
              <div className="space-y-3">
                <select className="input-field" value={formData.payerId} onChange={e=>setFormData(p=>({...p,payerId:e.target.value}))}>
                  <option value="">Select Payer *</option>
                  {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <select className="input-field" value={formData.payeeId} onChange={e=>setFormData(p=>({...p,payeeId:e.target.value}))}>
                  <option value="">Select Payee *</option>
                  {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
                </select>
                <input className="input-field" type="number" placeholder="Amount (₹) *" value={formData.amount} onChange={e=>setFormData(p=>({...p,amount:e.target.value}))} />
                <select className="input-field" value={formData.paymentType} onChange={e=>setFormData(p=>({...p,paymentType:e.target.value}))}>
                  <option value="Equipment">Equipment Booking</option>
                  <option value="Mandi">Mandi Pool</option>
                </select>
                {formData.paymentType === 'Equipment' && (
                  <select className="input-field" value={formData.equipmentBookingId} onChange={e=>setFormData(p=>({...p,equipmentBookingId:e.target.value}))}>
                    <option value="">Select Booking *</option>
                    {bookings.map(b=><option key={b._id} value={b._id}>{b.equipmentId?.name} — ₹{b.totalAmount}</option>)}
                  </select>
                )}
                {formData.paymentType === 'Mandi' && (
                  <select className="input-field" value={formData.mandiId} onChange={e=>setFormData(p=>({...p,mandiId:e.target.value}))}>
                    <option value="">Select Mandi Pool *</option>
                    {mandis.map(m=><option key={m._id} value={m._id}>{m.mandiLocation} — {new Date(m.mandiDate).toLocaleDateString()}</option>)}
                  </select>
                )}
                <select className="input-field" value={formData.status} onChange={e=>setFormData(p=>({...p,status:e.target.value}))}>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="disputed">Disputed</option>
                </select>
                <div>
                  {screenshotPreview && <img src={screenshotPreview} alt="preview" className="w-full h-32 object-cover rounded-xl mb-2"/>}
                  <label className="flex items-center gap-2 cursor-pointer rounded-xl border-2 border-dashed border-[var(--color-border)] p-3 hover:border-emerald-400 transition-colors">
                    <Upload size={16} className="text-slate-400"/>
                    <span className="text-sm text-slate-500">Upload payment screenshot</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange}/>
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary flex-1">{submitting ? 'Saving…' : 'Record Payment'}</button>
                  <button onClick={resetForm} className="btn btn-ghost flex-1">Cancel</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} title="Delete Payment" message="Delete this payment record?" confirmText="Delete" confirmVariant="danger"/>
    </div>
  );
};

export default PaymentPage;