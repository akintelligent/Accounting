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

router.get("/", getAllEntries);
router.get("/:id", getEntryById);
router.post("/", createEntry);
router.put("/:id", updateEntry);
router.post("/:id/post", postEntry);    // post endpoint
router.delete("/:id", deleteEntry);
router.get("/ledger", getLedgerList);


export default router;
