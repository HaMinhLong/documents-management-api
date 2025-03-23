import { body } from "express-validator";

export const validateCreateOrderItem = [
  body("order_id").notEmpty().withMessage("Order Id là bắt buộc"),
  body("document_id").notEmpty().withMessage("Document Id là bắt buộc"),
  body("price").notEmpty().withMessage("Price là bắt buộc"),
];
