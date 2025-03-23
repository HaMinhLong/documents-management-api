import { body } from "express-validator";

export const validateCreateSubject = [
  body("name").notEmpty().withMessage("Name là bắt buộc"),
];
