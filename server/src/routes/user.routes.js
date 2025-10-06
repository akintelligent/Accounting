import express from "express";
import {
  getAllUsers,
  getEmployees,
  getRoles,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/employees", getEmployees); // EMP_ID select list
router.get("/roles", getRoles);         // ROLE_ID select list
router.post("/add", createUser);
router.put("/:user_id", updateUser);
router.delete("/:user_id", deleteUser);

export default router;
