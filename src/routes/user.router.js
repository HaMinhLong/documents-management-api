import express from "express";
const router = express.Router();

import {
  validateCreateUser,
  validateUpdateUser,
} from "../validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";

router.post(
  "/user",
  validateCreateUser,
  handleValidationErrors,
  authMiddleware,
  userController.createUser
);

router.get("/user", authMiddleware, userController.getUsers);

router.get("/user/:id", authMiddleware, userController.getUserById);

router.put(
  "/user/:id",
  validateUpdateUser,
  handleValidationErrors,
  authMiddleware,
  userController.updateUser
);

router.delete("/user/:id", authMiddleware, userController.deleteUser);

export default router;
