import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Normalize: always expose req.user.id (string) regardless of JWT payload shape
    req.user = {
      ...decoded,
      id: decoded.id || decoded._id?.toString(),
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Access denied.",
    });
  }
};

export default authMiddleware;