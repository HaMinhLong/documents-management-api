import express from "express";
const router = express.Router();

import {
  validateCreateTransaction,
  validateUpdateTransaction,
} from "../validators/transaction.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import controller from "../controllers/transaction.controller.js";

router.post(
  "/transaction/",
  validateCreateTransaction,
  handleValidationErrors,
  controller.createRecord
);

router.get("/transaction/", controller.getRecords);

router.get("/transaction/:id", controller.getRecordById);

router.put(
  "/transaction/:id",
  validateUpdateTransaction,
  handleValidationErrors,
  controller.updateRecord
);

router.delete("/transaction/:id", controller.deleteRecord);

export default router;
