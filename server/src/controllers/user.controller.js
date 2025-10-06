import { getConnection } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";
import bcrypt from "bcryptjs";

export const getAllUsers = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT U.USER_ID, U.USERNAME, U.IS_ACTIVE,
              E.EMP_ID, E.EMP_NAME,
              R.ROLE_ID, R.ROLE_NAME
         FROM USERS U
         JOIN EMPLOYEES E ON U.EMP_ID = E.EMP_ID
         JOIN USER_ROLES R ON U.ROLE_ID = R.ROLE_ID
         ORDER BY U.USER_ID`
    );

    successResponse(res, "Users fetched successfully", { users: result.rows });
    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching users");
  }
};

export const getEmployees = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT EMP_ID, EMP_NAME FROM EMPLOYEES WHERE STATUS = 'A' ORDER BY EMP_NAME`
    );

    successResponse(res, "Employees fetched successfully", {
      employees: result.rows.map(row => ({
        EMP_ID: row[0],
        EMP_NAME: row[1],
      }))
    });

    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching employees");
  }
};

export const getRoles = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT ROLE_ID, ROLE_NAME FROM USER_ROLES ORDER BY ROLE_NAME`
    );

    successResponse(res, "Roles fetched successfully", {
      roles: result.rows.map(row => ({
        ROLE_ID: row[0],
        ROLE_NAME: row[1],
      }))
    });

    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching roles");
  }
};


export const createUser = async (req, res) => {
  const { emp_id, username, password, role_id } = req.body;

  if (!emp_id || !username || !password || !role_id) {
    return errorResponse(res, "All fields are required", 400);
  }

  try {
    const conn = await getConnection();

    // Check if username exists
    const existing = await conn.execute(
      `SELECT USER_ID FROM USERS WHERE USERNAME = :username`,
      { username }
    );
    if (existing.rows.length > 0) {
      return errorResponse(res, "Username already exists", 400);
    }

    const password_hash = await bcrypt.hash(password, 10);

    await conn.execute(
      `INSERT INTO USERS (EMP_ID, USERNAME, PASSWORD_HASH, ROLE_ID)
       VALUES (:emp_id, :username, :password_hash, :role_id)`,
      { emp_id, username, password_hash, role_id },
      { autoCommit: true }
    );

    successResponse(res, "User created successfully");
    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error creating user");
  }
};

export const updateUser = async (req, res) => {
  const { user_id } = req.params;
  const { emp_id, username, password, role_id, is_active } = req.body;

  if (!emp_id || !username || !role_id || !is_active) {
    return errorResponse(res, "All fields except password are required", 400);
  }

  try {
    const conn = await getConnection();

    let query = `UPDATE USERS SET EMP_ID = :emp_id, USERNAME = :username, ROLE_ID = :role_id, IS_ACTIVE = :is_active`;
    const params = { emp_id, username, role_id, is_active, user_id };

    if (password && password.trim() !== "") {
      const password_hash = await bcrypt.hash(password, 10);
      query += `, PASSWORD_HASH = :password_hash`;
      params.password_hash = password_hash;
    }

    query += ` WHERE USER_ID = :user_id`;

    await conn.execute(query, params, { autoCommit: true });

    successResponse(res, "User updated successfully");
    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error updating user");
  }
};

export const deleteUser = async (req, res) => {
  const { user_id } = req.params;

  try {
    const conn = await getConnection();
    await conn.execute(
      `DELETE FROM USERS WHERE USER_ID = :user_id`,
      { user_id },
      { autoCommit: true }
    );

    successResponse(res, "User deleted successfully");
    await conn.close();
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error deleting user");
  }
};
