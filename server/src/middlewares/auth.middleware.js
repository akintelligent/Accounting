import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token for protected routes
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Access token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info
    next();
  } catch (error) {
    console.error("JWT verification failed:", error.message);
    return res.status(403).json({
      success: false,
      message: error.name === "TokenExpiredError"
        ? "Session expired, please log in again"
        : "Invalid token"
    });
  }
};
