import express from "express";
const router = express.Router();

import {
  validateCreateOrder,
  validateUpdateOrder,
} from "../validators/order.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import orderController from "../controllers/order.controller.js";

router.post(
  "/order/",
  validateCreateOrder,
  handleValidationErrors,
  authMiddleware,
  orderController.createOrder
);

router.get("/order/", authMiddleware, orderController.getOrders);

router.get("/order/:id", authMiddleware, orderController.getOrderById);

router.put(
  "/order/:id",
  validateUpdateOrder,
  handleValidationErrors,
  authMiddleware,
  orderController.updateOrder
);

router.delete("/order/:id", authMiddleware, orderController.deleteOrder);

export default router;
