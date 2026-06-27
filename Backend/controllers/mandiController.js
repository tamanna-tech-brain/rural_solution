import MandiPool from "../models/MandiPool.js";
import Notification from "../models/Notification.js";

// CREATE
export const createMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.create({
      ...req.body,
      ownerId: req.user.id, // ✅ Fixed: use req.user.id (not req.user._id)
    });

    res.status(201).json({ success: true, data: mandi });
  } catch (err) {
    console.error("CREATE MANDI ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET ALL
export const getMandi = async (req, res) => {
  try {
    const data = await MandiPool.find()
      .populate({ path: "ownerId", select: "name email phone village" })
      .populate({ path: "farmersJoined.farmerId", select: "name village" })
      .sort({ createdAt: -1 });

    return res.status(200).json(data);
  } catch (err) {
    console.error("GET MANDI ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
export const getMandiById = async (req, res) => {
  try {
    const data = await MandiPool.findById(req.params.id)
      .populate({ path: "ownerId", select: "name email" })
      .populate({ path: "farmersJoined.farmerId", select: "name village" });

    if (!data) return res.status(404).json({ success: false, message: "Mandi pool not found." });

    res.json(data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE (ONLY OWNER)
export const updateMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);
    if (!mandi) return res.status(404).json({ success: false, message: "Mandi pool not found." });

    // ✅ Fixed: use req.user.id
    if (mandi.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the owner can update this mandi." });
    }

    Object.assign(mandi, req.body);

    if (mandi.farmersJoined.length >= 2) {
      mandi.tripStarted = true;
    }

    await mandi.save();
    res.json({ success: true, data: mandi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE (ONLY OWNER)
export const deleteMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);
    if (!mandi) return res.status(404).json({ success: false, message: "Mandi pool not found." });

    // ✅ Fixed: use req.user.id
    if (mandi.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Only the owner can delete this mandi." });
    }

    await mandi.deleteOne();
    res.json({ success: true, message: "Mandi pool deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// JOIN MANDI POOL (as farmer)
export const joinMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);
    if (!mandi) return res.status(404).json({ success: false, message: "Mandi pool not found." });

    if (mandi.status === "Cancelled" || mandi.status === "completed") {
      return res.status(400).json({ success: false, message: "Cannot join a cancelled or completed mandi." });
    }

    const { cropType, cropWeight, shareCost } = req.body;
    const farmerId = req.user.id;

    // Prevent duplicate joins
    const alreadyJoined = mandi.farmersJoined.some(
      (f) => f.farmerId?.toString() === farmerId
    );
    if (alreadyJoined) {
      return res.status(400).json({ success: false, message: "You have already joined this mandi pool." });
    }

    mandi.farmersJoined.push({ farmerId, cropType, cropWeight: Number(cropWeight), shareCost: Number(shareCost) });
    mandi.totalWeight = mandi.farmersJoined.reduce((sum, f) => sum + (Number(f.cropWeight) || 0), 0);

    await mandi.save();

    // Notify owner
    try {
      await Notification.create({
        userId: mandi.ownerId,
        message: `A farmer has joined your mandi pool on ${new Date(mandi.mandiDate).toLocaleDateString()}.`,
        type: "mandi",
        relatedId: mandi._id,
        relatedModel: "MandiPool",
      });
    } catch (notifErr) {
      console.error("Notification error:", notifErr.message);
    }

    res.json({ success: true, data: mandi });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DRIVER LOCATION + START/END TRIP
export const updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng, endTrip } = req.body;
    const mandi = await MandiPool.findById(req.params.id);

    if (!mandi) return res.status(404).json({ success: false, message: "Mandi not found." });

    if (endTrip) {
      mandi.tripStarted = false;
      mandi.status = "completed";
      mandi.driverLocation = {
        ...mandi.driverLocation,
        endedAt: new Date().toLocaleTimeString(),
      };
    } else {
      mandi.driverLocation = {
        lat,
        lng,
        startedAt: mandi.driverLocation?.startedAt || new Date().toLocaleTimeString(),
        updatedAt: new Date(),
      };
      mandi.tripStarted = true;
      mandi.status = "onTrip";
    }

    await mandi.save();
    res.json({ success: true, data: mandi });
  } catch (err) {
    console.error("LOCATION UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE STATUS
export const updateMandiStatus = async (req, res) => {
  try {
    const mandi = await MandiPool.findById(req.params.id);
    if (!mandi) return res.status(404).json({ success: false, message: "Mandi not found." });

    const { status, isBooked, tripStarted } = req.body;

    const validStatus = ["Pending", "Confirmed", "Cancelled", "onTrip", "completed"];
    if (status && !validStatus.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Valid values: ${validStatus.join(", ")}` });
    }

    if (status) mandi.status = status;
    if (typeof isBooked === "boolean") mandi.isBooked = isBooked;
    if (typeof tripStarted === "boolean") mandi.tripStarted = tripStarted;

    await mandi.save();
    res.status(200).json({ success: true, data: mandi });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};