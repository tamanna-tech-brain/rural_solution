import MandiPool from "../models/MandiPool.js";

// CREATE
export const createMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.create({
      ...req.body,
      ownerId: req.user._id, // ✅ FIX
    });

    res.status(201).json(mandi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getMandi = async (req, res) => {
  try {
    const data = await MandiPool.find()
  .populate({ path: "ownerId", select: "name email" })
  .populate({ path: "farmersJoined.farmerId", select: "name" });
    return res.status(200).json(data);
  } catch (err) {
    console.log("GET MANDI ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// GET BY ID
export const getMandiById = async (req, res) => {
  try {
    const data = await MandiPool.findById(req.params.id)
      .populate("farmersJoined.farmerId", "name");

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE (ONLY OWNER)
export const updateMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);

    if (!mandi) return res.status(404).json({ message: "Not found" });

    if (mandi.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can update" });
    }

    Object.assign(mandi, req.body);

    if (mandi.farmersJoined.length >= 2) {
      mandi.tripStarted = true;
    }

    await mandi.save();

    res.json(mandi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE (ONLY OWNER)
export const deleteMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);

    if (!mandi) return res.status(404).json({ message: "Not found" });

    if (mandi.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only owner can delete" });
    }

    await mandi.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DRIVER LOCATION + START/END TRIP
export const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng, endTrip } = req.body;

    const mandi = await MandiPool.findById(req.params.id);

    if (!mandi) {
      return res.status(404).json({
        message: "Mandi not found",
      });
    }

    if (endTrip) {
      mandi.tripStarted = false;

      mandi.driverLocation = {
        ...mandi.driverLocation,
        endedAt: new Date().toLocaleTimeString(),
      };

      await mandi.save();

      return res.json(mandi);
    }

    mandi.driverLocation = {
      lat,
      lng,
      startedAt:
        mandi.driverLocation?.startedAt ||
        new Date().toLocaleTimeString(),
      updatedAt: new Date(),
    };

    mandi.tripStarted = true;

    await mandi.save();

    res.json(mandi);
  } catch (err) {
    console.log("LOCATION UPDATE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};
 
// UPDATE STATUS / BOOKING
// UPDATE STATUS
export const updateMandiStatus = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);

    if (!mandi) {
      return res.status(404).json({
        message: "Mandi not found",
      });
    }

    const { status, isBooked, tripStarted } = req.body;

    // VALID STATUS VALUES
    const validStatus = [
      "Pending",
      "Confirmed",
      "Cancelled",
      "onTrip",
      "completed",
    ];

    if (status && !validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    if (status) {
      mandi.status = status;
    }

    if (typeof isBooked === "boolean") {
      mandi.isBooked = isBooked;
    }

    if (typeof tripStarted === "boolean") {
      mandi.tripStarted = tripStarted;
    }

    await mandi.save();

    res.status(200).json(mandi);
  } catch (err) {
    console.log("STATUS UPDATE ERROR:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};