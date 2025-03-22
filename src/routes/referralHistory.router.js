import express from "express";
const router = express.Router();

import {
  validateCreateReferralHistory,
  validateUpdateReferralHistory,
} from "../validators/referralHistory.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import controller from "../controllers/referralHistory.controller.js";

router.post(
  "/referral-history/",
  validateCreateReferralHistory,
  handleValidationErrors,
  controller.createRecord
);

router.get("/referral-history/", controller.getRecords);

router.get("/referral-history/:id", controller.getRecordById);

router.put(
  "/referral-history/:id",
  validateUpdateReferralHistory,
  handleValidationErrors,
  controller.updateRecord
);

router.delete("/referral-history/:id", controller.deleteRecord);

export default router;
