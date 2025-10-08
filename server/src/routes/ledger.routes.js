import express from "express";
import { getLedger, generateLedgerReport, generateLedgerVoucher } from "../controllers/ledger.controller.js";

const router = express.Router();

router.get("/", getLedger);
router.get("/report", generateLedgerReport);
router.get("/voucher/:id", generateLedgerVoucher); // ✅ Voucher route

export default router;
