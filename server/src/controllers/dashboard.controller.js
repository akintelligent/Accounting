import { getConnection } from "../config/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    const conn = await getConnection();

    const usersResult = await conn.execute(`SELECT COUNT(*) AS TOTAL_USERS FROM USERS`);
    const employeesResult = await conn.execute(`SELECT COUNT(*) AS TOTAL_EMPLOYEES FROM EMPLOYEES`);

    await conn.close();

    console.log("Users:", usersResult.rows);
    console.log("Employees:", employeesResult.rows);

    return res.json({
      success: true,
      data: {
        totalUsers: usersResult.rows[0][0], // যদি array আসে
        totalEmployees: employeesResult.rows[0][0],
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ success: false, message: "Error fetching dashboard data" });
  }
};
