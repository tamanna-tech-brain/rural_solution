import Booking from "../models/Booking.js";

export const checkBookingConflict = async (
  equipmentId,
  startDate,
  endDate
) => {
  const existingBooking = await Booking.findOne({
    equipmentId,
    status: {
      $ne: "cancelled",
    },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      },
    ],
  });

  return existingBooking;
};

export const calculateBookingAmount = (
  rentalRate,
  totalDays
) => {
  return rentalRate * totalDays;
};