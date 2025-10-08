import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const baseUploadDir = process.env.UPLOAD_DIR || "uploads";
const employeePath = process.env.EMPLOYEE_IMAGE_PATH || "employees/images";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), baseUploadDir, employeePath); // absolute path
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const empCode = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${empCode}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error("Only .jpg, .jpeg, .png files allowed"));
  },
});
