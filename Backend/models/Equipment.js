import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    rentalRatePerDay: {
      type: Number,
      required: true,
    },

    location: {
      type: String,
      required: true,
    },

    condition: {
      type: String,
      default: "Good",
    },

    equipmentImage: {
      type: String,
      default: "",
    },

    availability: [
      {
        date: Date,
        isBooked: {
          type: Boolean,
          default: false,
        },

        bookedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    isBooked: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
equipmentSchema.index({ ownerId: 1 });
equipmentSchema.index({ type: 1, location: 1 });
equipmentSchema.index({ isBooked: 1 });

const Equipment = mongoose.model(
  "Equipment",
  equipmentSchema
);

export default Equipment;