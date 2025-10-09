import express from "express";
import {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  postEntry,
  deleteEntry,
  getLedgerList,
} from "../controllers/journal.controller.js";

const router = express.Router();

// Put specific/static routes first
router.get("/ledger", getLedgerList);
router.post("/:id/post", postEntry);

// Then id route
router.get("/:id", getEntryById);

// Then base and other CRUD (base route last to avoid conflict)
router.get("/", getAllEntries);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.delete("/:id", deleteEntry);

export default router;
