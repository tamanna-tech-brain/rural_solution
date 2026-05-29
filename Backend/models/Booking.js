import mongoose from 'mongoose';
const bookingSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    renterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: Date,
    endDate: Date,
    totalAmount: {
  type: Number,
  required: true,
},
    status: {
      type: String,
      
  enum: [
    "pending",
    "confirmed",
    "approved",
    "completed",
    "cancelled",
  ],
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;