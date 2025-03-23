import express from "express";
const router = express.Router();
import multer from "multer";

const upload = multer({ dest: "uploads/" });

import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/fileImage.controller.js";

router.post(
  "/file-image/",
  upload.fields([{ name: "file", maxCount: 1 }]),
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/file-image/", authMiddleware, controller.getRecords);

router.get("/file-image/:id", authMiddleware, controller.getRecordById);

router.put(
  "/file-image/:id",
  upload.fields([{ name: "file", maxCount: 1 }]),
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/file-image/:id", authMiddleware, controller.deleteRecord);

export default router;
