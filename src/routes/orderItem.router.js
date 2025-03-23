import express from "express";
const router = express.Router();

import { validateCreateOrderItem } from "../validators/orderItem.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import controller from "../controllers/orderItem.controller.js";

router.post(
  "/order-item/",
  validateCreateOrderItem,
  handleValidationErrors,
  authMiddleware,
  controller.createRecord
);

router.get("/order-item/", authMiddleware, controller.getRecords);

router.get("/order-item/:id", authMiddleware, controller.getRecordById);

router.put(
  "/order-item/:id",
  validateCreateOrderItem,
  handleValidationErrors,
  authMiddleware,
  controller.updateRecord
);

router.delete("/order-item/:id", authMiddleware, controller.deleteRecord);

export default router;
