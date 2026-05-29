import HelpPost from "../models/HelpPost.js";

// CREATE HELP TICKET
export const createHelpPost = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const post = await HelpPost.create({
      user: req.user.id,
      title,
      description,
      category,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET USER TICKETS
export const getUserHelpPosts = async (req, res) => {
  try {
    const posts = await HelpPost.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN - GET ALL TICKETS
export const getAllHelpPosts = async (req, res) => {
  try {
    const posts = await HelpPost.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ADMIN - REPLY TICKET
export const replyHelpPost = async (req, res) => {
  try {
    const { message } = req.body;

    const post = await HelpPost.findById(req.params.id);

    post.replies.push({
      message,
      byAdmin: true,
    });

    post.status = "in_progress";

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// RESOLVE
export const resolveHelpPost = async (req, res) => {
  try {
    const post = await HelpPost.findById(req.params.id);
    post.status = "resolved";
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteHelpPost = async (req, res) => {
  try {
    await HelpPost.findByIdAndDelete(req.params.id);
    res.json({ message: "Help ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};