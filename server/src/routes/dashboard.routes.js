import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", authMiddleware, getDashboardStats);

export default router;
