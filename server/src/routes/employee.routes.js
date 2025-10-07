import express from "express";
import { upload } from "../middlewares/upload.middleware.js";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employee.controller.js";

const router = express.Router();

router.get("/", getEmployees);
router.get("/:emp_id", getEmployeeById);
router.post("/add", upload.single("PHOTO_URL"), createEmployee);
router.put("/:emp_id", upload.single("PHOTO_URL"), updateEmployee);
router.delete("/:emp_id", deleteEmployee);

export default router;
