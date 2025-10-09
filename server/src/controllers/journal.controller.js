import oracledb from "oracledb";
import { getConnection } from "../config/db.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * GET /api/journal
 */
export const getAllEntries = async (req, res) => {
  try {
    const { search, from, to } = req.query;
    const conn = await getConnection();

    let query = `
      SELECT ENTRY_ID, ENTRY_NO, ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, STATUS, CREATED_BY, CREATED_AT
      FROM ACC_JOURNAL_ENTRIES
      WHERE 1=1
    `;

    const binds = {};

    if (from) {
      query += ` AND ENTRY_DATE >= TO_DATE(:p_from, 'YYYY-MM-DD')`;
      binds.p_from = from;
    }

    if (to) {
      query += ` AND ENTRY_DATE <= TO_DATE(:p_to, 'YYYY-MM-DD')`;
      binds.p_to = to;
    }

    if (search) {
      query += ` AND (
        LOWER(ENTRY_NO) LIKE '%' || LOWER(:p_search) || '%' 
        OR LOWER(DESCRIPTION) LIKE '%' || LOWER(:p_search) || '%'
        OR LOWER(VOUCHER_TYPE) LIKE '%' || LOWER(:p_search) || '%'
      )`;
      binds.p_search = search;
    }

    query += ` ORDER BY ENTRY_DATE DESC, ENTRY_ID DESC`;

    console.log("📡 Fetching with SQL:", query, binds);

    const result = await conn.execute(query, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    await conn.close();

    const entries = result.rows.map((row) => ({
      ENTRY_ID: row.ENTRY_ID,
      ENTRY_NO: row.ENTRY_NO,
      ENTRY_DATE: row.ENTRY_DATE,
      VOUCHER_TYPE: row.VOUCHER_TYPE,
      DESCRIPTION: row.DESCRIPTION,
      STATUS: row.STATUS,
      CREATED_BY: row.CREATED_BY,
      CREATED_AT: row.CREATED_AT,
    }));

    return successResponse(res, "Journal entries fetched", { entries });
  } catch (err) {
    console.error("getAllEntries error:", err);
    return errorResponse(res, "Error fetching journal entries: " + err.message);
  }
};

/**
 * GET /api/journal/:id
 */
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await getConnection();

    const [master, lines] = await Promise.all([
      conn.execute(
        `SELECT ENTRY_ID, ENTRY_NO, ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, STATUS, CREATED_BY
           FROM ACC_JOURNAL_ENTRIES WHERE ENTRY_ID = :id`,
        { id }
      ),
      conn.execute(
        `SELECT LINE_ID, ACCOUNT_ID, NARRATION, DEBIT, CREDIT
           FROM ACC_JOURNAL_LINES WHERE ENTRY_ID = :id ORDER BY LINE_ID`,
        { id }
      ),
    ]);
    await conn.close();

    if (master.rows.length === 0)
      return errorResponse(res, "Entry not found", 404);

    const m = master.rows[0];
    const entry = {
      ENTRY_ID: m[0],
      ENTRY_NO: m[1],
      ENTRY_DATE: m[2],
      VOUCHER_TYPE: m[3],
      DESCRIPTION: m[4],
      STATUS: m[5],
      CREATED_BY: m[6],
      lines: lines.rows.map((l) => ({
        LINE_ID: l[0],
        ACCOUNT_ID: l[1],
        NARRATION: l[2],
        DEBIT: l[3],
        CREDIT: l[4],
      })),
    };

    return successResponse(res, "Entry fetched", { entry });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching entry");
  }
};

/**
 * POST /api/journal
 */
export const createEntry = async (req, res) => {
  const { ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, CREATED_BY, lines } = req.body;

  if (!ENTRY_DATE || !Array.isArray(lines) || lines.length === 0) {
    return errorResponse(res, "ENTRY_DATE and at least one line are required", 400);
  }

  try {
    const conn = await getConnection();

    const masterResult = await conn.execute(
      `INSERT INTO ACC_JOURNAL_ENTRIES (ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, CREATED_BY)
       VALUES (TO_DATE(:ENTRY_DATE,'YYYY-MM-DD'), :VOUCHER_TYPE, :DESCRIPTION, :CREATED_BY)
       RETURNING ENTRY_ID INTO :entry_id`,
      {
        ENTRY_DATE,
        VOUCHER_TYPE,
        DESCRIPTION,
        CREATED_BY,
        entry_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      },
      { autoCommit: false }
    );

    const entryId = masterResult.outBinds.entry_id[0];

    for (const l of lines) {
      await conn.execute(
        `INSERT INTO ACC_JOURNAL_LINES (ENTRY_ID, ACCOUNT_ID, NARRATION, DEBIT, CREDIT)
         VALUES (:ENTRY_ID, :ACCOUNT_ID, :NARRATION, :DEBIT, :CREDIT)`,
        {
          ENTRY_ID: entryId,
          ACCOUNT_ID: l.ACCOUNT_ID,
          NARRATION: l.NARRATION || null,
          DEBIT: l.DEBIT || 0,
          CREDIT: l.CREDIT || 0,
        }
      );
    }

    await conn.commit();
    await conn.close();

    return successResponse(res, "Journal entry created", { entryId });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error creating journal entry: " + err.message);
  }
};

/**
 * POST /api/journal/:id/post
 */
export const postEntry = async (req, res) => {
  const { id } = req.params;
  let conn;

  try {
    conn = await getConnection();

    await conn.execute(`ALTER SESSION SET ISOLATION_LEVEL = SERIALIZABLE`);

    await conn.execute(`SAVEPOINT before_post_entry`);

    // 1️⃣ Fetch Journal Entry
    const e = await conn.execute(
      `SELECT ENTRY_ID, ENTRY_NO, ENTRY_DATE, DESCRIPTION, STATUS, VOUCHER_TYPE
       FROM ACC_JOURNAL_ENTRIES WHERE ENTRY_ID = :id FOR UPDATE`,
      { id }
    );

    if (e.rows.length === 0) {
      await conn.rollback();
      await conn.close();
      return errorResponse(res, "Entry not found", 404);
    }

    const entry = e.rows[0];
    if (entry[4] === "P") {
      await conn.rollback();
      await conn.close();
      return errorResponse(res, "Already posted", 400);
    }

    // 2️⃣ Fetch Journal Lines
    const linesRes = await conn.execute(
      `SELECT LINE_ID, ACCOUNT_ID, NARRATION, DEBIT, CREDIT
       FROM ACC_JOURNAL_LINES WHERE ENTRY_ID = :id ORDER BY LINE_ID`,
      { id }
    );

    if (linesRes.rows.length === 0) {
      await conn.rollback();
      await conn.close();
      return errorResponse(res, "No journal lines found", 400);
    }

    // 3️⃣ Validate Totals
    let totalDebit = 0, totalCredit = 0;
    for (const l of linesRes.rows) {
      totalDebit += Number(l[3] || 0);
      totalCredit += Number(l[4] || 0);
    }

    if (Math.abs(totalDebit - totalCredit) > 0.001) {
      await conn.rollback();
      await conn.close();
      return errorResponse(res, "Total debit and credit must be equal", 400);
    }

    // 4️⃣ Insert Ledger Entries
    for (const l of linesRes.rows) {
      const line = {
        LINE_ID: l[0],
        ACCOUNT_ID: l[1],
        NARRATION: l[2],
        DEBIT: Number(l[3] || 0),
        CREDIT: Number(l[4] || 0),
      };

      const lastBalRes = await conn.execute(
        `SELECT NVL(MAX(BALANCE), 0)
         FROM ACC_LEDGERS
         WHERE ACCOUNT_ID = :acct`,
        { acct: line.ACCOUNT_ID }
      );

      const lastBal = lastBalRes.rows.length ? Number(lastBalRes.rows[0][0] || 0) : 0;
      const newBal = lastBal + line.DEBIT - line.CREDIT;

      await conn.execute(
        `INSERT INTO ACC_LEDGERS (
          ENTRY_ID, ACCOUNT_ID, ENTRY_NO, ENTRY_DATE, VOUCHER_TYPE,
          PARTICULARS, DEBIT, CREDIT, BALANCE
        ) VALUES (
          :ENTRY_ID, :ACCOUNT_ID, :ENTRY_NO, :ENTRY_DATE, :VOUCHER_TYPE,
          :PARTICULARS, :DEBIT, :CREDIT, :BALANCE
        )`,
        {
          ENTRY_ID: id,
          ACCOUNT_ID: line.ACCOUNT_ID,
          ENTRY_NO: entry[1],
          ENTRY_DATE: entry[2],
          VOUCHER_TYPE: entry[5],
          PARTICULARS: line.NARRATION || entry[3],
          DEBIT: line.DEBIT,
          CREDIT: line.CREDIT,
          BALANCE: newBal,
        }
      );
    }

    // 5️⃣ Mark Entry as Posted
    await conn.execute(
      `UPDATE ACC_JOURNAL_ENTRIES
       SET STATUS = 'P', UPDATED_AT = SYSTIMESTAMP
       WHERE ENTRY_ID = :id`,
      { id }
    );

    await conn.commit();
    await conn.close();

    return successResponse(res, "Entry posted successfully");
  } catch (err) {
    if (conn) {
      await conn.execute(`ROLLBACK TO SAVEPOINT before_post_entry`);
      await conn.close();
    }
    console.error(err);
    return errorResponse(res, "Error posting entry: " + err.message);
  }
};



/**
 * PUT /api/journal/:id
 */
export const updateEntry = async (req, res) => {
  const { id } = req.params;
  const { ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, CREATED_BY, lines } = req.body;

  if (!ENTRY_DATE || !Array.isArray(lines) || lines.length === 0) {
    return errorResponse(res, "ENTRY_DATE and at least one line are required", 400);
  }

  try {
    const conn = await getConnection();

    const entryRes = await conn.execute(
      `SELECT STATUS FROM ACC_JOURNAL_ENTRIES WHERE ENTRY_ID = :id`,
      { id }
    );

    if (entryRes.rows.length === 0) {
      await conn.close();
      return errorResponse(res, "Entry not found", 404);
    }

    if (entryRes.rows[0][0] === "P") {
      await conn.close();
      return errorResponse(res, "Posted entries cannot be updated", 400);
    }

    await conn.execute(
      `UPDATE ACC_JOURNAL_ENTRIES
       SET ENTRY_DATE = TO_DATE(:ENTRY_DATE,'YYYY-MM-DD'),
           VOUCHER_TYPE = :VOUCHER_TYPE,
           DESCRIPTION = :DESCRIPTION,
           CREATED_BY = :CREATED_BY,
           UPDATED_AT = SYSTIMESTAMP
       WHERE ENTRY_ID = :id`,
      { ENTRY_DATE, VOUCHER_TYPE, DESCRIPTION, CREATED_BY, id },
      { autoCommit: false }
    );

    await conn.execute(
      `DELETE FROM ACC_JOURNAL_LINES WHERE ENTRY_ID = :id`,
      { id }
    );

    for (const l of lines) {
      await conn.execute(
        `INSERT INTO ACC_JOURNAL_LINES (ENTRY_ID, ACCOUNT_ID, NARRATION, DEBIT, CREDIT)
         VALUES (:ENTRY_ID, :ACCOUNT_ID, :NARRATION, :DEBIT, :CREDIT)`,
        {
          ENTRY_ID: id,
          ACCOUNT_ID: l.ACCOUNT_ID,
          NARRATION: l.NARRATION || null,
          DEBIT: l.DEBIT || 0,
          CREDIT: l.CREDIT || 0,
        }
      );
    }

    await conn.commit();
    await conn.close();

    return successResponse(res, "Journal entry updated successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error updating journal entry: " + err.message);
  }
};

/**
 * DELETE /api/journal/:id
 */
export const deleteEntry = async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await getConnection();

    const entryRes = await conn.execute(
      `SELECT STATUS FROM ACC_JOURNAL_ENTRIES WHERE ENTRY_ID = :id`,
      { id }
    );

    if (entryRes.rows.length === 0) {
      await conn.close();
      return errorResponse(res, "Entry not found", 404);
    }

    if (entryRes.rows[0][0] === "P") {
      await conn.close();
      return errorResponse(res, "Posted entries cannot be deleted", 400);
    }

    await conn.execute(
      `DELETE FROM ACC_JOURNAL_LINES WHERE ENTRY_ID = :id`,
      { id }
    );

    await conn.execute(
      `DELETE FROM ACC_JOURNAL_ENTRIES WHERE ENTRY_ID = :id`,
      { id }
    );

    await conn.commit();
    await conn.close();

    return successResponse(res, "Journal entry deleted successfully");
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error deleting journal entry: " + err.message);
  }
};

export const getLedgerList = async (req, res) => {
  try {
    const conn = await getConnection();

    const result = await conn.execute(
      `SELECT LEDGER_ID, ENTRY_DATE, ENTRY_NO, ACCOUNT_NAME, PARTICULARS, DEBIT, CREDIT, BALANCE
       FROM V_LEDGER
       ORDER BY ENTRY_DATE DESC, LEDGER_ID DESC`
    );

    await conn.close();

    const ledgers = result.rows.map((r) => ({
      LEDGER_ID: r[0],
      ENTRY_DATE: r[1],
      ENTRY_NO: r[2],
      ACCOUNT_NAME: r[3],
      PARTICULARS: r[4],
      DEBIT: r[5],
      CREDIT: r[6],
      BALANCE: r[7],
    }));

    return successResponse(res, "Ledger list fetched", { ledgers });
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Error fetching ledger list: " + err.message);
  }
};
