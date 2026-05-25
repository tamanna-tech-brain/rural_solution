import mongoose from 'mongoose';
const equipmentSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, required: true }, // Tractor / Harvester / Drone
  rentalRatePerDay: { type: Number, required: true },

  availability: [
    {
      date: Date,
      isBooked: { type: Boolean, default: false },
      bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],
  condition: { type: String, default: 'Good' },
  location: { type: String, required: true }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;