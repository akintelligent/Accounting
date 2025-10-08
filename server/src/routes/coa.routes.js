// src/routes/accCoa.routes.js
import express from "express";
import {
  getAllAccounts,
  getAccountTree,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/coa.controller.js";

const router = express.Router();

router.get("/", getAllAccounts);
router.get("/tree", getAccountTree);
router.get("/:id", getAccountById);
router.post("/add", createAccount);
router.put("/:id", updateAccount);
router.delete("/:id", deleteAccount);

export default router;
