import Equipment from "../models/Equipment.js";

// CREATE
export const createEquipment = async (req, res) => {
  try {

    const equipment = await Equipment.create({
      ownerId: req.user.id,
      name: req.body.name,
      type: req.body.type,
      rentalRatePerDay: req.body.rentalRatePerDay,
      location: req.body.location,
      condition: req.body.condition,

      equipmentImage: req.file
        ? req.file.path
        : "",
    });

    res.status(201).json(equipment);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// GET ALL (with pagination, sorting, filtering)
export const getAllEquipment = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt", type, location } = req.query;
    const query = {};
    if (type) query.type = new RegExp(type, "i");
    if (location) query.location = new RegExp(location, "i");

    const data = await Equipment.find(query)
      .populate("ownerId", "name phone village trustScore")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Equipment.countDocuments(query);

    res.json({
      data,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalItems: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID is required" });
    }

    const data = await Equipment.findById(id);

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
export const updateEquipment = async (req, res) => {
  try {

    const equipment =
      await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
      });
    }

    // ONLY OWNER CAN UPDATE

    if (
      equipment.ownerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only owner can update equipment",
      });
    }

    equipment.name =
      req.body.name || equipment.name;

    equipment.type =
      req.body.type || equipment.type;

    equipment.rentalRatePerDay =
      req.body.rentalRatePerDay ||
      equipment.rentalRatePerDay;

    equipment.location =
      req.body.location ||
      equipment.location;

    equipment.condition =
      req.body.condition ||
      equipment.condition;

    if (req.file) {
      equipment.equipmentImage =
        req.file.path;
    }

    await equipment.save();

    res.json(equipment);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

// DELETE
export const deleteEquipment = async (req, res) => {
  try {

    const equipment =
      await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
      });
    }

    // ONLY OWNER CAN DELETE

    if (
      equipment.ownerId.toString() !==
      req.user.id
    ) {
      return res.status(403).json({
        message:
          "Only owner can delete equipment",
      });
    }

    await Equipment.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Equipment deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};