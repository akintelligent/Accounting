// controllers/auth.controller.js
import { getConnection } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  let conn;

  try {
    conn = await getConnection();

    // Get user + employee + role
    const result = await conn.execute(
      `SELECT 
          U.USER_ID, 
          U.USERNAME, 
          U.PASSWORD_HASH, 
          U.IS_ACTIVE, 
          E.EMP_ID, 
          E.EMP_NAME, 
          E.DESIGNATION, 
          E.PHOTO_URL,
          R.ROLE_ID, 
          R.ROLE_NAME
       FROM USERS U
       JOIN EMPLOYEES E ON U.EMP_ID = E.EMP_ID
       JOIN USER_ROLES R ON U.ROLE_ID = R.ROLE_ID
       WHERE U.USERNAME = :username`,
      { username }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user[2]);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check if user is active
    if (user[3] !== "Y") {
      return res.status(403).json({ success: false, message: "User is inactive" });
    }

    // ✅ Create JWT token with full user payload including PHOTO_URL
    const tokenPayload = {
      userId: user[0],
      username: user[1],
      empId: user[4],
      empName: user[5],
      designation: user[6],
      photo_url: user[7],   // add PHOTO_URL here
      roleId: user[8],
      roleName: user[9],
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: tokenPayload, // frontend can now access user.photo_url
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  } finally {
    if (conn) await conn.close();
  }
};

// controllers/auth.controller.js
export const logout = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

