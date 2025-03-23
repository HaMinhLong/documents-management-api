import { body } from "express-validator";

export const validateCreateCategory = [
  body("name").notEmpty().withMessage("Name là bắt buộc"),
];
