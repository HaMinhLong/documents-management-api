import { body } from "express-validator";

export const validateCreateUniversity = [
  body("name").notEmpty().withMessage("Name là bắt buộc"),
];
