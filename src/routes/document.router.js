import express from "express";
const router = express.Router();
import upload from "../utils//multerConfig.util.js";

// import {
//   validateCreateReferralHistory,
//   validateUpdateReferralHistory,
// } from "../validators/referralHistory.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import getUserTokenMiddleware from "../middlewares/getUserToken.middleware.js";

import controller from "../controllers/document.controller.js";

router.get(
  "/document/preview/:id",
  authMiddleware,
  controller.getDocumentPreview
);

router.post(
  "/document/",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "instruct", maxCount: 1 },
    { name: "fileImages", maxCount: 10 },
  ]),
  handleValidationErrors,
  authMiddleware,
  getUserTokenMiddleware,
  controller.createRecord
);

router.get(
  "/documents/related",
  authMiddleware,
  controller.getRelatedDocuments
);

router.get("/document/", authMiddleware, controller.getRecords);

router.get("/document/:id", authMiddleware, controller.getRecordById);

router.put(
  "/document/:id",
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "instruct", maxCount: 1 },
    { name: "fileImages", maxCount: 10 },
  ]),
  handleValidationErrors,
  authMiddleware,
  getUserTokenMiddleware,
  controller.updateRecord
);

router.delete("/document/:id", authMiddleware, controller.deleteRecord);

export default router;
