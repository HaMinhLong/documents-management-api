import express from "express";
const router = express.Router();
import controller from "../controllers/vnpay.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import getUserTokenMiddleware from "../middlewares/getUserToken.middleware.js";

router.post(
  "/vnpay/create-payment",
  authMiddleware,
  getUserTokenMiddleware,
  controller.createPayment
);

router.get("/vnpay/return", controller.handlePaymentResponse);

router.get("/check-create-transaction", controller.checkCreateTransaction);

export default router;
