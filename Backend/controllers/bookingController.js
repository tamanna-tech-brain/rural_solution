import Booking from "../models/Booking.js";
import Equipment from "../models/Equipment.js";

// CREATE BOOKING
export const createBooking = async (req, res) => {
  try {
    const { equipmentId } = req.body;

    const equipment = await Equipment.findById(equipmentId);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    // 🔴 STRICT LOCK
    if (equipment.isBooked === true) {
      return res.status(400).json({
        message: "This equipment is already booked",
      });
    }

    const booking = await Booking.create(req.body);

    equipment.isBooked = true;
    await equipment.save();

    const populated = await booking.populate([
      "equipmentId",
      "renterId",
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getBookings = async (req, res) => {
  try {
    const data = await Booking.find()
      .populate("equipmentId")
      .populate("renterId");

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
export const getBookingById = async (req, res) => {
  try {
    const data = await Booking.findById(req.params.id)
      .populate("equipmentId")
      .populate("renterId");

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE (ONLY OWNER)
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.renterId.toString() !== req.body.renterId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(["equipmentId", "renterId"]);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE (ONLY OWNER + UNLOCK EQUIPMENT)
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Not found" });
    }

    const renterId = req.body?.renterId;

    if (!renterId || booking.renterId.toString() !== renterId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Equipment.findByIdAndUpdate(booking.equipmentId, {
      isBooked: false,
    });

    await Booking.findByIdAndDelete(req.params.id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};