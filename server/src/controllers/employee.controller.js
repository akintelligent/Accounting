import { getConnection } from "../config/db.js";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const BASE_URL = process.env.BASE_URL;
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const EMP_PATH = process.env.EMPLOYEE_IMAGE_PATH;

const getImagePath = (photoUrl) => {
  if (!photoUrl) return null;
  const relativePath = photoUrl.replace(`${BASE_URL}/`, "");
  return path.join(process.cwd(), relativePath);
};

export const getEmployees = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT EMP_ID, EMP_CODE, EMP_NAME, EMAIL, PHONE, DESIGNATION, STATUS, PHOTO_URL
       FROM EMPLOYEES ORDER BY EMP_ID DESC`
    );
    await conn.close();
    res.json({ success: true, message: "Employees fetched", data: { employees: result.rows } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT EMP_ID, EMP_CODE, EMP_NAME, EMAIL, PHONE, DESIGNATION, STATUS, PHOTO_URL
       FROM EMPLOYEES WHERE EMP_ID = :emp_id`,
      { emp_id }
    );
    await conn.close();

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee fetched", data: { employee: result.rows[0] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching employee" });
  }
};


export const createEmployee = async (req, res) => {
  try {
    const { EMP_NAME, EMAIL, PHONE, DESIGNATION, STATUS } = req.body;
    const photo = req.file ? `${BASE_URL}/${UPLOAD_DIR}/${EMP_PATH}/${req.file.filename}` : null;

    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO EMPLOYEES (EMP_NAME, EMAIL, PHONE, DESIGNATION, STATUS, PHOTO_URL)
       VALUES (:emp_name, :email, :phone, :designation, :status, :photo)`,
      { emp_name: EMP_NAME, email: EMAIL, phone: PHONE, designation: DESIGNATION, status: STATUS, photo },
      { autoCommit: true }
    );
    await conn.close();

    res.json({ success: true, message: "Employee created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { emp_id } = req.params;
    const { EMP_NAME, EMAIL, PHONE, DESIGNATION, STATUS } = req.body;

    const conn = await getConnection();

    const prevResult = await conn.execute(
      `SELECT PHOTO_URL FROM EMPLOYEES WHERE EMP_ID = :emp_id`,
      { emp_id }
    );
    const prevPhotoUrl = prevResult.rows[0]?.PHOTO_URL || null;

    const photo = req.file ? `${BASE_URL}/${UPLOAD_DIR}/${EMP_PATH}/${req.file.filename}` : null;

    const updateQuery = `
      UPDATE EMPLOYEES 
      SET EMP_NAME = :emp_name,
          EMAIL = :email,
          PHONE = :phone,
          DESIGNATION = :designation,
          STATUS = :status,
          PHOTO_URL = CASE WHEN :photo IS NOT NULL THEN :photo ELSE PHOTO_URL END
      WHERE EMP_ID = :emp_id
    `;
    const params = {
      emp_name: EMP_NAME,
      email: EMAIL,
      phone: PHONE,
      designation: DESIGNATION,
      status: STATUS,
      emp_id,
      photo,
    };

    await conn.execute(updateQuery, params, { autoCommit: true });
    await conn.close();

    if (photo && prevPhotoUrl) {
      const oldPath = getImagePath(prevPhotoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ success: true, message: "Employee updated successfully" });
  } catch (err) {
    console.error("Update Employee Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { emp_id } = req.params;

    const conn = await getConnection();

    const prevResult = await conn.execute(
      `SELECT PHOTO_URL FROM EMPLOYEES WHERE EMP_ID = :emp_id`,
      { emp_id }
    );
    const prevPhotoUrl = prevResult.rows[0]?.PHOTO_URL;

    await conn.execute(`DELETE FROM EMPLOYEES WHERE EMP_ID = :emp_id`, { emp_id }, { autoCommit: true });
    await conn.close();

    if (prevPhotoUrl) {
      const oldPath = getImagePath(prevPhotoUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
