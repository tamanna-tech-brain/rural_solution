import MandiPool from "../models/MandiPool.js";

// CREATE
export const createMandi = async (req, res) => {
  try {
    const mandi = await MandiPool.create(req.body);
    res.status(201).json(mandi);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
export const getMandi = async (req, res) => {
  try {
    const data = await MandiPool.find().populate("farmersJoined.farmerId");
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
export const getMandiById = async (req, res) => {
  try {
    const data = await MandiPool.findById(req.params.id).populate(
      "farmersJoined.farmerId"
    );

    if (!data) return res.status(404).json({ message: "Not found" });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateMandi = async (req, res) => {
  try {
    const data = await MandiPool.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
export const deleteMandi = async (req, res) => {
  try {
    await MandiPool.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};