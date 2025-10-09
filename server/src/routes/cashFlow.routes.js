import express from "express";
import { getCashFlow } from "../controllers/cashFlow.controller.js";

const router = express.Router();

router.get("/", getCashFlow);

export default router;
