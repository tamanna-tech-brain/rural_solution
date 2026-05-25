import Equipment from "../models/Equipment.js";

// CREATE
export const createEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.create(req.body);
    res.status(201).json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL
export const getAllEquipment = async (req, res) => {
  try {
    const equipments = await Equipment.find().populate("ownerId");
    res.json(equipments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET BY ID
export const getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate("ownerId");

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(equipment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE BY ID
export const updateEquipment = async (req, res) => {
  try {
    const updated = await Equipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("ownerId");

    if (!updated) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE BY ID
export const deleteEquipment = async (req, res) => {
  try {
    const deleted = await Equipment.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json({ message: "Equipment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};