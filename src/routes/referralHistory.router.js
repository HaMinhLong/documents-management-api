import express from "express";
const router = express.Router();

import {
  validateCreateReferralHistory,
  validateUpdateReferralHistory,
} from "../validators/referralHistory.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/referralHistory.controller.js";

router.post(
  "/referral-history/",
  validateCreateReferralHistory,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/referral-history/", authMiddleware, controller.getRecords);

router.get("/referral-history/:id", authMiddleware, controller.getRecordById);

router.put(
  "/referral-history/:id",
  validateUpdateReferralHistory,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/referral-history/:id", authMiddleware, controller.deleteRecord);

export default router;
