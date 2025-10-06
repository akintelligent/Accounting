import { getConnection } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT U.USER_ID, U.USERNAME, U.PASSWORD_HASH, U.IS_ACTIVE, 
              E.EMP_ID, E.EMP_NAME, E.DESIGNATION,
              R.ROLE_ID, R.ROLE_NAME
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
    const passwordMatch = await bcrypt.compare(password, user[2]);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user[3] !== "Y") {
      return res.status(403).json({ success: false, message: "User is inactive" });
    }

    const token = jwt.sign(
      { userId: user[0], username: user[1], role: user[8] },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await conn.close();

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          userId: user[0],
          username: user[1],
          empId: user[4],
          empName: user[5],
          designation: user[6],
          roleId: user[7],
          roleName: user[8],
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// controllers/authController.js

export const logout = async (req, res) => {
  try {
    // For JWT, logout is client-side (delete token). But we can also blacklist it if needed.
    return res.json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

