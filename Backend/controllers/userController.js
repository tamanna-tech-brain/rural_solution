import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed To Fetch Users",
    });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
        debugId: req.params.id
      });
    }

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed To Fetch User",
    });
  }
};

export const updateUser = async (req, res) => {
  try {

    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    const updateData = {
      name: req.body.name,
      email: req.body.email,
      village: req.body.village,
      region: req.body.region,
    };

    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedUser =
      await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).select("-password");

    res.json(updatedUser);

  } catch (error) {
    res.status(500).json({
      message: "Failed To Update User",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }
    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed To Delete User",
    });
  }
};