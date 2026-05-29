const adminMiddleware = (req, res, next) => {
  try {
    // assuming authMiddleware already sets req.user
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // check role
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admin only" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Admin middleware error" });
  }
};

export default adminMiddleware;