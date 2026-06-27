import Booking from "../models/Booking.js";
import Equipment from "../models/Equipment.js";
import Notification from "../models/Notification.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { equipmentId, startDate, endDate, totalAmount } = req.body;

    if (!equipmentId || !startDate || !endDate || !totalAmount) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ success: false, message: "End date must be after start date." });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ success: false, message: "Equipment not found." });
    }

    if (equipment.isBooked === true) {
      return res.status(400).json({ success: false, message: "This equipment is already booked." });
    }

    const booking = await Booking.create({
      equipmentId,
      renterId: req.user.id,
      startDate,
      endDate,
      totalAmount: Number(totalAmount),
      status: "pending",
    });

    equipment.isBooked = true;
    await equipment.save();

    const populated = await Booking.findById(booking._id)
      .populate("equipmentId")
      .populate("renterId", "name email phone");

    // Notify equipment owner
    try {
      await Notification.create({
        userId: equipment.ownerId,
        message: `Your equipment "${equipment.name}" has been booked by ${req.user.id}.`,
        type: "booking",
        relatedId: booking._id,
        relatedModel: "Booking",
      });
    } catch (notifErr) {
      console.error("Notification creation failed:", notifErr.message);
    }

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL BOOKINGS
export const getBookings = async (req, res) => {
  try {
    const data = await Booking.find()
      .populate("equipmentId")
      .populate("renterId", "name email phone village")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
export const getBookingById = async (req, res) => {
  try {
    const data = await Booking.findById(req.params.id)
      .populate("equipmentId")
      .populate("renterId", "name email phone");

    if (!data) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE BOOKING — only by the renter (verified via JWT)
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // ✅ Use JWT-authenticated user ID
    if (booking.renterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied. You are not the renter." });
    }

    const allowedUpdates = ["startDate", "endDate", "totalAmount", "status"];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) booking[field] = req.body[field];
    });

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate("equipmentId")
      .populate("renterId", "name email phone");

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE BOOKING — only by the renter (verified via JWT), unlocks equipment
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    // ✅ Use JWT-authenticated user ID
    if (booking.renterId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied. You are not the renter." });
    }

    // Unlock equipment
    await Equipment.findByIdAndUpdate(booking.equipmentId, { isBooked: false });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Booking deleted and equipment unlocked." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};