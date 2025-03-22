import { body } from "express-validator";

export const validateCreateReferralHistory = [
  body("commission_amount")
    .notEmpty()
    .withMessage("Commission Amount là bắt buộc"),
  body("order_id").notEmpty().withMessage("Order Id là bắt buộc"),
  body("referred_id").notEmpty().withMessage("User Id là bắt buộc"),
];

export const validateUpdateReferralHistory = [
  body("commission_amount")
    .notEmpty()
    .withMessage("Commission Amount là bắt buộc"),
  body("order_id").notEmpty().withMessage("Order Id là bắt buộc"),
  body("referred_id").notEmpty().withMessage("User Id là bắt buộc"),
];
