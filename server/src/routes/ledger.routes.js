import express from "express";
import { getLedger, generateLedgerVoucher } from "../controllers/ledger.controller.js";
// import { authMiddleware } from "../middlewares/auth.middleware.js"; // ✅ import middleware

const router = express.Router();

router.get("/", getLedger);

// ✅ Protect voucher route and attach login user info
router.get("/voucher/:id", generateLedgerVoucher);

export default router;
