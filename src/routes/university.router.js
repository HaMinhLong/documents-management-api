import express from "express";
const router = express.Router();

import { validateCreateUniversity } from "../validators/university.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/university.controller.js";

router.post(
  "/university/",
  validateCreateUniversity,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/university/", authMiddleware, controller.getRecords);

router.get("/university/:id", authMiddleware, controller.getRecordById);

router.put(
  "/university/:id",
  validateCreateUniversity,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/university/:id", authMiddleware, controller.deleteRecord);

export default router;
