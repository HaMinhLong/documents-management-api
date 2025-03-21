import { body } from "express-validator";

export const validateCreateUser = [
  body("username")
    .notEmpty()
    .withMessage("Username là bắt buộc")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username phải có độ dài từ 3 đến 20 ký tự"),
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ"),
  body("password_hash")
    .notEmpty()
    .withMessage("Mật khẩu là bắt buộc")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
];

export const validateUpdateUser = [
  body("username")
    .notEmpty()
    .withMessage("Username là bắt buộc")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username phải có độ dài từ 3 đến 20 ký tự"),
  body("email")
    .notEmpty()
    .withMessage("Email là bắt buộc")
    .isEmail()
    .withMessage("Email không hợp lệ"),
];
