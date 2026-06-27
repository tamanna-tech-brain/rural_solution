import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarRange, Trash2, Edit2, CheckCircle, Clock } from 'lucide-react';
import {
  getBookings, getEquipment, updateBooking, deleteBooking,
  getBookingById, createBooking, updateMandiStatus, getEquipmentById, getMandiById,
} from '../api/api';
import { CardSkeleton } from '../components/LoadingSkeleton';
import ConfirmDialog from '../components/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=400&auto=format&fit=crop';

const STATUS_COLORS = {
  pending:   'badge-yellow',
  confirmed: 'badge-blue',
  approved:  'badge-green',
  completed: 'badge-green',
  cancelled: 'badge-red',
};

const BookingPage = () => {
  const { id, type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const isMandi = type === 'mandi';
  const isEquipment = type === 'equipment';
  const isListView = !id && !type;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [data, setData] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    equipmentId: '', renterId: user?._id || '', startDate: '', endDate: '', totalAmount: '', status: 'pending',
  });

  const fetchBookings = async () => {
    try {
      const res = await getBookings();
      setBookings(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch { setBookings([]); }
  };

  const fetchDetails = async () => {
    if (!id || !type) return;
    try {
      if (isMandi) {
        const res = await getMandiById(id);
        setData(res.data);
      } else if (isEquipment) {
        const res = await getEquipmentById(id);
        setData(res.data);
        setFormData(p => ({ ...p, equipmentId: res.data?._id || '' }));
      }
    } catch { setData(null); }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchBookings(), fetchDetails()]);
      setLoading(false);
    };
    load();
  }, [id, type]);

  // Auto-calculate amount from dates × daily rate
  useEffect(() => {
    if (isEquipment && data?.rentalRatePerDay && formData.startDate && formData.endDate) {
      const days = Math.max(0, Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)));
      if (days > 0) setFormData(p => ({ ...p, totalAmount: days * data.rentalRatePerDay }));
    }
  }, [formData.startDate, formData.endDate, data]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (isEquipment) {
        if (!formData.startDate || !formData.endDate || !formData.totalAmount) {
          return toast.error('Fill all required fields.');
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          return toast.error('End date must be after start date.');
        }
        const payload = {
          equipmentId: formData.equipmentId,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalAmount: Number(formData.totalAmount),
          status: formData.status,
        };
        if (editingId) {
          await updateBooking(editingId, payload);
          toast.success('Booking updated!');
        } else {
          await createBooking(payload);
          toast.success('Equipment booked!');
        }
        await fetchBookings();
        await fetchDetails();
        setEditingId(null);
      } else if (isMandi) {
        await updateMandiStatus(id, { status: 'Confirmed', isBooked: true });
        toast.success('Mandi booked successfully!');
        navigate('/mandi');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Booking failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (bookingId) => {
    try {
      const res = await getBookingById(bookingId);
      const b = res.data?.data || res.data;
      setFormData({
        equipmentId: b.equipmentId?._id || '',
        renterId: user?._id || '',
        startDate: b.startDate?.split('T')[0] || '',
        endDate: b.endDate?.split('T')[0] || '',
        totalAmount: b.totalAmount || '',
        status: b.status || 'pending',
      });
      setEditingId(bookingId);
    } catch { toast.error('Failed to load booking.'); }
  };

  const confirmDelete = async () => {
    try {
      await deleteBooking(deleteTarget);
      toast.success('Booking deleted.');
      await fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = filterStatus ? bookings.filter(b => b.status === filterStatus) : bookings;

  // ── List View (no type/id params) ─────────────────────────────────────────
  if (isListView) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1>📅 Bookings</h1>
            <p>All equipment booking records</p>
          </div>
          <select className="input-field sm:w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending','confirmed','approved','completed','cancelled'].map(s => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(i=><CardSkeleton key={i}/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-16 text-center">
            <CalendarRange size={48} className="mb-4 text-slate-300" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-300">No bookings found</h3>
            <p className="mt-1 text-sm text-slate-400">Go to Equipment page to create a booking.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b, i) => (
              <motion.div key={b._id} className="card overflow-hidden" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
                <img src={b.equipmentId?.equipmentImage || FALLBACK_IMG} alt={b.equipmentId?.name} className="h-40 w-full object-cover" onError={e=>{e.target.src=FALLBACK_IMG}} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{b.equipmentId?.name || 'Equipment'}</h3>
                    <span className={`badge shrink-0 ${STATUS_COLORS[b.status] || 'badge-gray'}`}>{b.status}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">👤 {b.renterId?.name}</p>
                  <p className="text-xs text-slate-500">📅 {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}</p>
                  <p className="mt-2 text-lg font-bold text-emerald-600">₹{b.totalAmount?.toLocaleString('en-IN')}</p>
                  {b.renterId?._id === user?._id && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => handleEdit(b._id)} className="btn btn-ghost flex-1 py-1.5 text-xs"><Edit2 size={12}/>Edit</button>
                      <button onClick={() => setDeleteTarget(b._id)} className="btn btn-danger flex-1 py-1.5 text-xs"><Trash2 size={12}/>Delete</button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <ConfirmDialog isOpen={!!deleteTarget} onConfirm={confirmDelete} onCancel={()=>setDeleteTarget(null)} title="Delete Booking" message="Delete this booking? Equipment will be unlocked." confirmText="Delete" confirmVariant="danger" />
      </div>
    );
  }

  // ── Detail/Create View ────────────────────────────────────────────────────
  if (loading) return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><CardSkeleton key={i}/>)}</div>;
  if (!data) return (
    <div className="card flex flex-col items-center justify-center py-16 text-center">
      <CalendarRange size={48} className="mb-4 text-slate-300" />
      <h3 className="font-semibold">Item not found</h3>
      <button onClick={() => navigate('/equipment')} className="btn btn-primary mt-4">Back to Equipment</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>{isMandi ? '🚛 Book Mandi Trip' : '🚜 Book Equipment'}</h1>
        <p>{isMandi ? 'Confirm your mandi pool reservation' : 'Reserve this equipment for your dates'}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Item Details */}
        <div className="lg:col-span-2">
          <div className="card overflow-hidden">
            {isEquipment && (
              <img src={data.equipmentImage || FALLBACK_IMG} alt={data.name} className="h-48 w-full object-cover" onError={e=>{e.target.src=FALLBACK_IMG}} />
            )}
            <div className="p-5 space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isMandi ? data.mandiLocation : data.name}
              </h2>
              {isEquipment && <>
                <p className="text-sm text-slate-500">Type: {data.type}</p>
                <p className="text-2xl font-bold text-emerald-600">₹{data.rentalRatePerDay}<span className="text-sm font-normal text-slate-400">/day</span></p>
                <p className="text-sm text-slate-500">📍 {data.location}</p>
                <p className="text-sm text-slate-500">Condition: <span className="font-medium">{data.condition}</span></p>
              </>}
              {isMandi && <>
                <p className="text-sm text-slate-500">🚚 Driver: {data.driverName}</p>
                <p className="text-sm text-slate-500">📅 {new Date(data.mandiDate).toLocaleDateString()}</p>
                <p className="text-sm text-slate-500">Capacity: {data.truckCapacity} tons</p>
                <span className={`badge ${data.status==='Confirmed'?'badge-green':'badge-yellow'}`}>{data.status}</span>
              </>}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-3">
          <div className="card p-6">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-4">
              {editingId ? 'Update Booking' : 'Create Booking'}
            </h3>
            {isEquipment && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Renter</label>
                  <input className="input-field bg-slate-50 dark:bg-slate-700" value={user?.name || ''} disabled />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                    <input type="date" className="input-field" value={formData.startDate} min={new Date().toISOString().split('T')[0]} onChange={e=>setFormData(p=>({...p,startDate:e.target.value}))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                    <input type="date" className="input-field" value={formData.endDate} min={formData.startDate} onChange={e=>setFormData(p=>({...p,endDate:e.target.value}))} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Total Amount (₹) — auto-calculated</label>
                  <input type="number" className="input-field" placeholder="Auto-calculated or enter manually" value={formData.totalAmount} onChange={e=>setFormData(p=>({...p,totalAmount:e.target.value}))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 mb-1 block">Status</label>
                  <select className="input-field" value={formData.status} onChange={e=>setFormData(p=>({...p,status:e.target.value}))}>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button onClick={handleSubmit} disabled={submitting || data.isBooked} className="btn btn-primary w-full justify-center">
                  {submitting ? 'Processing…' : editingId ? 'Update Booking' : '📅 Book Now'}
                </button>
                {data.isBooked && <p className="text-sm text-center text-red-500 font-medium">This equipment is currently booked.</p>}
              </div>
            )}
            {isMandi && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Confirm your spot in this mandi pool. You will be added to the farmer list.
                </p>
                <button onClick={handleSubmit} disabled={submitting || data.isBooked} className="btn btn-primary w-full justify-center">
                  {submitting ? 'Processing…' : data.isBooked ? 'Already Booked' : '✅ Confirm Mandi Booking'}
                </button>
              </div>
            )}
          </div>

          {/* Bookings List */}
          {isEquipment && bookings.length > 0 && (
            <div className="mt-5">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-3">All Bookings</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map(b => (
                  <div key={b._id} className="card p-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{b.equipmentId?.name}</p>
                      <p className="text-xs text-slate-500">{b.renterId?.name} • ₹{b.totalAmount}</p>
                    </div>
                    <span className={`badge ${STATUS_COLORS[b.status]||'badge-gray'}`}>{b.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;