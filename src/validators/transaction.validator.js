import { body } from "express-validator";

export const validateCreateTransaction = [
  body("amount").notEmpty().withMessage("Amount là bắt buộc"),
  body("type").notEmpty().withMessage("Type là bắt buộc"),
  body("user_id").notEmpty().withMessage("User Id là bắt buộc"),
];

export const validateUpdateTransaction = [
  body("amount").notEmpty().withMessage("Amount là bắt buộc"),
  body("type").notEmpty().withMessage("Type là bắt buộc"),
  body("user_id").notEmpty().withMessage("User Id là bắt buộc"),
];
