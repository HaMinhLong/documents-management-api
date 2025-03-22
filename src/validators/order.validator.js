import { body } from "express-validator";

export const validateCreateOrder = [
  body("user_id").notEmpty().withMessage("User Id là bắt buộc"),
  body("total_amount").notEmpty().withMessage("Total Amount là bắt buộc"),
];

export const validateUpdateOrder = [
  body("user_id").notEmpty().withMessage("User Id là bắt buộc"),
  body("total_amount").notEmpty().withMessage("Total Amount là bắt buộc"),
];
