import mongoose from 'mongoose';
const mandiPoolSchema = new mongoose.Schema({
  mandiDate: { type: Date, required: true },
  mandiLocation: { type: String, required: true },
  driverName: { type: String },
  truckCapacity: { type: Number, required: true }, // in kg or volume
  farmersJoined: [
    {
      farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      cropType: String,
      cropWeight: Number,
      shareCost: Number
    }
  ],
  totalWeight: { type: Number, default: 0 },
  status: { type: String, default: 'scheduled' } // scheduled, completed
});

const MandiPool = mongoose.model('MandiPool', mandiPoolSchema);
export default MandiPool;