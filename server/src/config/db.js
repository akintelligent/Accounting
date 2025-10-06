import oracledb from "oracledb";
import dotenv from "dotenv";

dotenv.config();

let pool;

export const initOracleDB = async () => {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: Number(process.env.DB_POOL_MIN),
      poolMax: Number(process.env.DB_POOL_MAX),
      poolIncrement: Number(process.env.DB_POOL_INCREMENT),
    });

    console.log("✅ Oracle DB Connected Successfully");
  } catch (err) {
    console.error("❌ Oracle DB Connection Error:", err);
    process.exit(1);
  }
};

export const getConnection = async () => {
  if (!pool) await initOracleDB();
  return pool.getConnection();
};
