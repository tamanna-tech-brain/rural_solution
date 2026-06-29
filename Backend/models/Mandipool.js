import mongoose from "mongoose";

const mandiPoolSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  mandiDate: {
    type: Date,
    required: true,
  },

  mandiLocation: {
    type: String,
    required: true,
  },

  driverName: String,

  driverPhone: String,

  truckCapacity: {
    type: Number,
    required: true,
  },

  farmersJoined: [
    {
      farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },

      cropType: String,

      cropWeight: Number,

      shareCost: Number,
    },
  ],

  totalWeight: {
    type: Number,
    default: 0,
  },

  // FIXED STATUS
  status: {
    type: String,

    enum: [
      "Pending",
      "Confirmed",
      "Cancelled",
      "onTrip",
      "completed",
    ],

    default: "Pending",
  },

  isBooked: {
    type: Boolean,
    default: false,
  },

  // DRIVER GPS
  driverLocation: {
    lat: Number,

    lng: Number,

    startedAt: String,

    endedAt: String,

    updatedAt: Date,
  },

  tripStarted: {
    type: Boolean,
    default: false,
  },
});

// Indexes for performance
mandiPoolSchema.index({ ownerId: 1 });
mandiPoolSchema.index({ mandiDate: 1 });
mandiPoolSchema.index({ status: 1 });

export default mongoose.model(
  "MandiPool",
  mandiPoolSchema
);