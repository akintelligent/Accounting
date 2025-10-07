// src/controllers/accCoa.controller.js
import { getConnection } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getAllAccounts = async (req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT ACCOUNT_ID, ACCOUNT_CODE, ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, LEVEL_NO, STATUS
         FROM ACC_CHART_OF_ACCOUNTS
         ORDER BY LEVEL_NO, ACCOUNT_CODE`
    );
    await conn.close();

    // result.rows is array-of-arrays; map to objects (or adjust if using resultMetaData)
    const accounts = result.rows.map((r) => ({
      ACCOUNT_ID: r[0],
      ACCOUNT_CODE: r[1],
      ACCOUNT_NAME: r[2],
      ACCOUNT_TYPE: r[3],
      PARENT_ACCOUNT_ID: r[4],
      LEVEL_NO: r[5],
      STATUS: r[6],
    }));

    successResponse(res, "Accounts fetched", { accounts });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching accounts");
  }
};

export const getAccountTree = async (req, res) => {
  try {
    const conn = await getConnection();
    // Hierarchical query to produce tree-like ordering
    const result = await conn.execute(
      `SELECT ACCOUNT_ID, ACCOUNT_CODE, ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, LEVEL_NO, STATUS
         FROM ACC_CHART_OF_ACCOUNTS
         START WITH PARENT_ACCOUNT_ID IS NULL
         CONNECT BY PRIOR ACCOUNT_ID = PARENT_ACCOUNT_ID
         ORDER SIBLINGS BY ACCOUNT_CODE`
    );
    await conn.close();

    const accounts = result.rows.map((r) => ({
      ACCOUNT_ID: r[0],
      ACCOUNT_CODE: r[1],
      ACCOUNT_NAME: r[2],
      ACCOUNT_TYPE: r[3],
      PARENT_ACCOUNT_ID: r[4],
      LEVEL_NO: r[5],
      STATUS: r[6],
    }));

    successResponse(res, "Accounts tree fetched", { accounts });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching account tree");
  }
};

export const getAccountById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT ACCOUNT_ID, ACCOUNT_CODE, ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, LEVEL_NO, STATUS
         FROM ACC_CHART_OF_ACCOUNTS
         WHERE ACCOUNT_ID = :id`,
      { id }
    );
    await conn.close();

    if (result.rows.length === 0) return errorResponse(res, "Account not found", 404);

    const r = result.rows[0];
    successResponse(res, "Account fetched", {
      account: {
        ACCOUNT_ID: r[0],
        ACCOUNT_CODE: r[1],
        ACCOUNT_NAME: r[2],
        ACCOUNT_TYPE: r[3],
        PARENT_ACCOUNT_ID: r[4],
        LEVEL_NO: r[5],
        STATUS: r[6],
      },
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error fetching account");
  }
};

export const createAccount = async (req, res) => {
  try {
    // Accepts ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, STATUS, optional ACCOUNT_CODE
    const { ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, STATUS, ACCOUNT_CODE } = req.body;

    if (!ACCOUNT_NAME || !ACCOUNT_TYPE) {
      return errorResponse(res, "ACCOUNT_NAME and ACCOUNT_TYPE are required", 400);
    }

    const conn = await getConnection();
    await conn.execute(
      `INSERT INTO ACC_CHART_OF_ACCOUNTS (ACCOUNT_CODE, ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, STATUS)
       VALUES (:ACCOUNT_CODE, :ACCOUNT_NAME, :ACCOUNT_TYPE, :PARENT_ACCOUNT_ID, :STATUS)`,
      {
        ACCOUNT_CODE: ACCOUNT_CODE || null, // trigger will create if null
        ACCOUNT_NAME,
        ACCOUNT_TYPE,
        PARENT_ACCOUNT_ID: PARENT_ACCOUNT_ID || null,
        STATUS: STATUS || "A",
      },
      { autoCommit: true }
    );

    await conn.close();
    successResponse(res, "Account created successfully");
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error creating account");
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { ACCOUNT_NAME, ACCOUNT_TYPE, PARENT_ACCOUNT_ID, STATUS } = req.body;

    if (!ACCOUNT_NAME || !ACCOUNT_TYPE) return errorResponse(res, "ACCOUNT_NAME and ACCOUNT_TYPE are required", 400);

    const conn = await getConnection();

    // Prevent setting parent to self
    if (PARENT_ACCOUNT_ID && Number(PARENT_ACCOUNT_ID) === Number(id)) {
      return errorResponse(res, "Parent account cannot be same as account", 400);
    }

    await conn.execute(
      `UPDATE ACC_CHART_OF_ACCOUNTS
         SET ACCOUNT_NAME = :ACCOUNT_NAME,
             ACCOUNT_TYPE = :ACCOUNT_TYPE,
             PARENT_ACCOUNT_ID = :PARENT_ACCOUNT_ID,
             STATUS = :STATUS,
             UPDATED_AT = SYSTIMESTAMP
       WHERE ACCOUNT_ID = :id`,
      {
        ACCOUNT_NAME,
        ACCOUNT_TYPE,
        PARENT_ACCOUNT_ID: PARENT_ACCOUNT_ID || null,
        STATUS: STATUS || "A",
        id,
      },
      { autoCommit: true }
    );

    await conn.close();
    successResponse(res, "Account updated successfully");
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error updating account");
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    // Optionally ensure no child accounts or usages (business rule)
    const childCheck = await conn.execute(
      `SELECT COUNT(1) FROM ACC_CHART_OF_ACCOUNTS WHERE PARENT_ACCOUNT_ID = :id`,
      { id }
    );
    if (childCheck.rows[0][0] > 0) {
      await conn.close();
      return errorResponse(res, "Cannot delete account with child accounts", 400);
    }

    await conn.execute(`DELETE FROM ACC_CHART_OF_ACCOUNTS WHERE ACCOUNT_ID = :id`, { id }, { autoCommit: true });
    await conn.close();
    successResponse(res, "Account deleted");
  } catch (err) {
    console.error(err);
    errorResponse(res, "Error deleting account");
  }
};
