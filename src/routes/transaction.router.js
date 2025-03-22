import express from "express";
const router = express.Router();

import {
  validateCreateTransaction,
  validateUpdateTransaction,
} from "../validators/transaction.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/transaction.controller.js";

router.post(
  "/transaction/",
  validateCreateTransaction,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/transaction/", authMiddleware, controller.getRecords);

router.get("/transaction/:id", authMiddleware, controller.getRecordById);

router.put(
  "/transaction/:id",
  validateUpdateTransaction,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/transaction/:id", authMiddleware, controller.deleteRecord);

export default router;
