import mongoose from 'mongoose';
const disputeSchema = new mongoose.Schema({
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bookingId: { type: mongoose.Schema.Types.ObjectId },
  reason: String,
  status: { type: String, default: 'open' } // open, resolved
});

const Dispute = mongoose.model('Dispute', disputeSchema);

export default Dispute;