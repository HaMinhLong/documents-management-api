import express from "express";
const router = express.Router();
import vnpayController from "../controllers/vnpay.controller.js";

router.post("/vnpay/create-payment", vnpayController.createPayment);

router.post("/vnpay/return", vnpayController.handlePaymentResponse);

export default router;
