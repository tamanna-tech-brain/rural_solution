import Booking from "../models/Booking.js";

// CREATE
export const createBooking = async (req, res) => {
  try {
    const booking = await Booking.create(req.body);

    const populated = await booking.populate([
      "equipmentId",
      "renterId",
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("equipmentId")
      .populate("renterId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("equipmentId")
      .populate("renterId");

    if (!booking)
      return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE
export const updateBooking = async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate("equipmentId")
      .populate("renterId");

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE
export const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};