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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "approved", "completed", "cancelled"],
      default: "pending", // ✅ Fixed: was missing default
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
bookingSchema.index({ equipmentId: 1 });
bookingSchema.index({ renterId: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;