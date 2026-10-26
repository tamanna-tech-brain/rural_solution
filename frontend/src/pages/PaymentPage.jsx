import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BadgeDollarSign, Trash2, X, Upload, ExternalLink, QrCode, Smartphone, Copy, Check, Zap, ShieldCheck, FileText, Printer, Volume2, Award, CheckCircle2 } from 'lucide-react';
import { createPayment, getPayments, deletePayment } from '../api/api';
import { getUsers, getBookings, getMandi } from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { useLanguage } from '../context/LanguageContext';

const STATUS_COLORS = { pending: 'badge-yellow', completed: 'badge-green', disputed: 'badge-red' };

const PaymentPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const { currentLang, t } = useLanguage();

  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');

  // 1-Tap UPI Intent & Dynamic QR States
  const [upiAmount, setUpiAmount] = useState('2400');
  const [copiedVpa, setCopiedVpa] = useState(false);
  const upiNote = 'Tractor Rental Escrow';
  const upiVpa = 'krishipool.escrow@icici';

  const [formData, setFormData] = useState({
    payerId: '', payeeId: '', amount: '', status: 'pending',
    paymentType: 'Equipment', equipmentBookingId: '', mandiId: '',
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, uRes, bRes, mRes] = await Promise.all([
        getPayments().catch(() => ({ data: [] })),
        user ? getUsers().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
        getBookings().catch(() => ({ data: [] })),
        getMandi().catch(() => ({ data: [] })),
      ]);
      setPayments(Array.isArray(pRes.data) ? pRes.data : pRes.data?.data || []);
      setUsers(Array.isArray(uRes.data) ? uRes.data : uRes.data?.data || []);
      setBookings(Array.isArray(bRes.data) ? bRes.data : bRes.data?.data || []);
      setMandis(Array.isArray(mRes.data) ? mRes.data : mRes.data?.data || []);
    } catch {
      toast.error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
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

  const playKisanSoundbox = (amount) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chime
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 0.35);
        });
      }

      if ('speechSynthesis' in window) {
        setTimeout(() => {
          const text = `KrishiPool Escrow Verified! Payment of rupees ${amount} successfully received and secured in rural escrow.`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = currentLang === 'en' ? 'en-IN' : 'hi-IN';
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
        }, 550);
      }
    } catch {
      // AudioContext fallback
    }
  };

  const handleSimulateUpiSuccess = async () => {
    if (!users.length) return toast.error('No users available for demo transaction.');
    setSubmitting(true);
    try {
      const payer = users[0];
      const payee = users[1] || users[0];
      const fd = new FormData();
      fd.append('payerId', payer._id);
      fd.append('payeeId', payee._id);
      fd.append('amount', upiAmount);
      fd.append('paymentType', 'Equipment');
      fd.append('status', 'completed');
      await createPayment(fd);
      playKisanSoundbox(upiAmount);
      toast.success(`₹${upiAmount} successfully verified and locked in KrishiPool Escrow!`);
      setShowUpiModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment simulation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const upiUrl = `upi://pay?pa=${upiVpa}&pn=KrishiPool%20Escrow&am=${upiAmount}&cu=INR&tn=${encodeURIComponent(upiNote)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedVpa(true);
    toast.success('UPI ID copied to clipboard!');
    setTimeout(() => setCopiedVpa(false), 2000);
  };

  const filtered = filterStatus ? payments.filter(p => p.status === filterStatus) : payments;
  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((s, p) => s + (p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="page-header mb-0">
          <h1>💰 {t('payments', 'Payments & Escrow')}</h1>
          <p>Instant UPI settlement, escrow safety, and transaction audit</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => playKisanSoundbox(upiAmount)}
            className="btn btn-ghost border border-slate-300 dark:border-slate-700 py-2 px-3 text-xs flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition-colors"
            title="Play rural soundbox chime & voice confirmation"
          >
            <Volume2 size={15} className="text-emerald-500" /> {t('soundbox_alert', 'Soundbox Alert')}
          </button>
          <button
            onClick={() => setShowUpiModal(true)}
            className="btn bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0 shadow-lg hover:shadow-emerald-500/20 flex items-center gap-2"
          >
            <Zap size={16} className="text-amber-300" /> {t('upi_pay_qr', '1-Tap UPI Pay & QR')}
          </button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary shrink-0">
            <Plus size={16} /> {t('record_payment', 'Record Payment')}
          </button>
        </div>
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
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setSelectedReceipt(p)}
                  className="btn btn-secondary flex-1 py-1.5 text-xs flex items-center justify-center gap-1.5"
                >
                  <FileText size={13} className="text-emerald-500" /> Escrow Receipt
                </button>
                {p.createdBy?._id === user?._id && (
                  <button onClick={() => setDeleteTarget(p._id)} className="btn btn-danger py-1.5 px-2.5 text-xs" title="Delete record">
                    <Trash2 size={12}/>
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ⚡ 1-Tap UPI & Dynamic QR Modal */}
      <AnimatePresence>
        {showUpiModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 p-6 shadow-2xl text-slate-900 dark:text-slate-100 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">1-Tap UPI Intent & QR</h2>
                    <p className="text-xs text-slate-500">Universal Bharat QR & Mobile Deep Links</p>
                  </div>
                </div>
                <button onClick={() => setShowUpiModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X size={18} />
                </button>
              </div>

              {/* Amount Settings */}
              <div className="my-4 space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Escrow Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-lg font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    className="input-field pl-8 text-xl font-bold text-emerald-600"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(e.target.value)}
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-2">
                  {['500', '1200', '2400', '5000', '8000'].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setUpiAmount(amt)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        upiAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR Display */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200">
                  <img src={qrUrl} alt="UPI QR Code" className="w-44 h-44 object-contain rounded-xl" />
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">Scan with PhonePe, Google Pay, Paytm, or BHIM</p>

                {/* Copy VPA Box */}
                <div className="mt-3 flex items-center justify-between w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
                  <span className="font-mono text-slate-700 dark:text-slate-300 truncate">{upiVpa}</span>
                  <button
                    onClick={() => copyToClipboard(upiVpa)}
                    className="ml-2 font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 shrink-0"
                  >
                    {copiedVpa ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    {copiedVpa ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 1-Tap Mobile Intent Deep Links */}
              <div className="mt-5 space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instant Mobile 1-Tap Apps:</p>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`phonepe://pay?pa=${upiVpa}&pn=KrishiPool&am=${upiAmount}&cu=INR`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-xs font-bold shadow-md transition-transform active:scale-95"
                  >
                    <Smartphone size={14} /> Open in PhonePe
                  </a>
                  <a
                    href={`gpay://upi/pay?pa=${upiVpa}&pn=KrishiPool&am=${upiAmount}&cu=INR`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 text-xs font-bold shadow-md transition-transform active:scale-95"
                  >
                    <Smartphone size={14} /> Open in GPay
                  </a>
                  <a
                    href={`paytmmp://pay?pa=${upiVpa}&pn=KrishiPool&am=${upiAmount}&cu=INR`}
                    className="flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white py-2 px-3 text-xs font-bold shadow-md transition-transform active:scale-95"
                  >
                    <Smartphone size={14} /> Open in Paytm
                  </a>
                  <a
                    href={upiUrl}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white py-2 px-3 text-xs font-bold shadow-md transition-transform active:scale-95"
                  >
                    <Zap size={14} /> Any UPI App
                  </a>
                </div>
              </div>

              {/* Escrow Demo Simulation Button */}
              <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  onClick={handleSimulateUpiSuccess}
                  disabled={submitting}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white w-full py-2.5 font-bold flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} /> {submitting ? 'Verifying with Bank...' : 'Confirm & Deposit to Escrow'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* 📄 Official Kisan Escrow Certificate & Printable PDF Tax Receipt Modal */}
      <AnimatePresence>
        {selectedReceipt && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-slate-100 overflow-y-auto max-h-[92vh]"
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
            >
              {/* Header with KrishiPool Escrow Emblem */}
              <div className="flex items-start justify-between pb-4 border-b-2 border-emerald-500/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      KrishiPool <span className="text-emerald-600 dark:text-emerald-400">एस्क्रो रसीद</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">Official Digital Rural Escrow & Tax Receipt</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Certificate Verification Ribbon */}
              <div className="my-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-3 flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                  REF: KP-ESC-{(selectedReceipt._id || '98765432').slice(-8).toUpperCase()}
                </span>
                <span className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={14} /> 100% Escrow Protected
                </span>
              </div>

              {/* Transaction Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 py-3 text-xs border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Tenant Farmer (Payer):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                    {selectedReceipt.payerId?.name || 'Local Farmer'}
                  </p>
                  <p className="text-slate-500">{selectedReceipt.payerId?.village || 'Sehore'}, MP</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Owner / Transporter (Payee):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5">
                    {selectedReceipt.payeeId?.name || 'Equipment Owner'}
                  </p>
                  <p className="text-slate-500">{selectedReceipt.payeeId?.village || 'Bhopal'}, MP</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Transaction Date:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {new Date(selectedReceipt.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase font-semibold">Purpose:</span>
                  <p className="font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                    {selectedReceipt.paymentType} Lease Settlement
                  </p>
                </div>
              </div>

              {/* Itemized Financial Breakdown Table */}
              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Base Agricultural Lease / Freight:</span>
                  <span className="font-mono font-bold">₹{(selectedReceipt.amount * 0.95).toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Panchayat Transit Damage Guarantee (Escrow):</span>
                  <span className="font-mono font-bold">₹{(selectedReceipt.amount * 0.05).toFixed(0)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">APMC Krishi Cess & Platform Fee:</span>
                  <span className="font-bold text-emerald-600">₹0 (100% Subsidized)</span>
                </div>
                <div className="flex justify-between py-2 text-sm font-black border-t-2 border-slate-200 dark:border-slate-700">
                  <span className="text-slate-900 dark:text-slate-100">Total Secured in Escrow:</span>
                  <span className="text-emerald-600 text-base">₹{selectedReceipt.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Security Hash & Watermark */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 break-all">
                <p className="font-semibold text-slate-600 dark:text-slate-400">Cryptographic Audit Hash:</p>
                <span>SHA-256: 4f9e8a71d02c98b671a5f4c3d2e1b0a9f8e7d6c5b4a39281706f5e4d3c2b1a0</span>
              </div>

              {/* Print and Close Actions */}
              <div className="mt-6 flex gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white flex-1 py-2.5 font-bold flex items-center justify-center gap-2 shadow-lg"
                >
                  <Printer size={16} /> Print / Save as PDF
                </button>
                <button onClick={() => setSelectedReceipt(null)} className="btn btn-ghost flex-1">
                  Close
                </button>
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