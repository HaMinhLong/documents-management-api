import express from "express";
const router = express.Router();

import { validateCreateCategory } from "../validators/category.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/category.controller.js";

router.post(
  "/category/",
  validateCreateCategory,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/category/", authMiddleware, controller.getRecords);

router.get("/category/:id", authMiddleware, controller.getRecordById);

router.put(
  "/category/:id",
  validateCreateCategory,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/category/:id", authMiddleware, controller.deleteRecord);

export default router;
