import express from "express";
import { getIncomeStatement } from "../controllers/incomeStatement.controller.js";
import {
  generateIncomeStatementPDF,
  generateIncomeStatementExcel
} from "../controllers/reports/incomeStatementReportController.js";

const router = express.Router();

router.get("/", getIncomeStatement);
router.get("/report/pdf", generateIncomeStatementPDF);
router.get("/report/excel", generateIncomeStatementExcel);

export default router;
