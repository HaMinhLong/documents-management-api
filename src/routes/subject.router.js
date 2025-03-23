import express from "express";
const router = express.Router();

import { validateCreateSubject } from "../validators/subject.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/subject.controller.js";

router.post(
  "/subject/",
  validateCreateSubject,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/subject/", authMiddleware, controller.getRecords);

router.get("/subject/:id", authMiddleware, controller.getRecordById);

router.put(
  "/subject/:id",
  validateCreateSubject,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/subject/:id", authMiddleware, controller.deleteRecord);

export default router;
