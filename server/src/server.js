import dotenv from "dotenv";
import app from "./app.js";
import { initOracleDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

(async () => {
  await initOracleDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
