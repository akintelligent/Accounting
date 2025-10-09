import express from "express";
import { getTrialBalance } from "../controllers/trialBalance.controller.js";
import { generateTrialBalancePDF } from "../controllers/reports/trialBalanceReportController.js";
import { generateTrialBalanceExcel } from "../controllers/reports/trialBalanceExcelController.js";

const router = express.Router();

router.get("/", getTrialBalance);
router.get("/report", generateTrialBalancePDF);
router.get("/report/excel", generateTrialBalanceExcel); // ✅ Excel route

export default router;
