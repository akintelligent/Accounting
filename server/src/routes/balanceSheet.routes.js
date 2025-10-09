import express from "express";
import { getBalanceSheet } from "../controllers/balanceSheet.controller.js";
import { generateBalanceSheetPDF, generateBalanceSheetExcel } from "../controllers/reports/balanceSheetReportController.js";

const router = express.Router();

router.get("/", getBalanceSheet);
router.get("/report/pdf", generateBalanceSheetPDF);
router.get("/report/excel", generateBalanceSheetExcel);

export default router;
