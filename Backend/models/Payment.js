import mongoose from 'mongoose';
const paymentSchema = new mongoose.Schema({
  payerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, completed, disputed
  transactionDate: { type: Date, default: Date.now },
  relatedBookingId: { type: mongoose.Schema.Types.ObjectId } // Equipment or Mandi Pool
});

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
