import express from "express";
const router = express.Router();

import {
  validateCreateOrder,
  validateUpdateOrder,
} from "../validators/order.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import orderController from "../controllers/order.controller.js";

router.post(
  "/order/",
  validateCreateOrder,
  handleValidationErrors,
  orderController.createOrder
);

router.get("/order/", orderController.getOrders);

router.get("/order/:id", orderController.getOrderById);

router.put(
  "/order/:id",
  validateUpdateOrder,
  handleValidationErrors,
  orderController.updateOrder
);

router.delete("/order/:id", orderController.deleteOrder);

export default router;
