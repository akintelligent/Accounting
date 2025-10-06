import { getConnection } from "../config/db.js";

/**
 * Get dashboard statistics
 * Protected route — requires valid JWT token
 */
export const getDashboardStats = async (req, res) => {
  try {
    const conn = await getConnection();

    // Count total users
    const usersResult = await conn.execute(`SELECT COUNT(*) AS total_users FROM USERS`);
    const employeesResult = await conn.execute(`SELECT COUNT(*) AS total_employees FROM EMPLOYEES`);

    await conn.close();

    return res.json({
      success: true,
      data: {
        totalUsers: usersResult.rows[0][0],
        totalEmployees: employeesResult.rows[0][0],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};
