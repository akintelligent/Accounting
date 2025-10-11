import jwt from "jsonwebtoken";

/**
 * Middleware to verify JWT token for protected routes
 */
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("🔐 Auth Header:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ success: false, message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    console.log("🎟️ Token Received:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ User Decoded:", decoded);

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

