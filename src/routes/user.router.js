import express from "express";
const router = express.Router();

import {
  validateCreateUser,
  validateUpdateUser,
} from "../validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import userController from "../controllers/user.controller.js";

router.post(
  "/user",
  validateCreateUser,
  handleValidationErrors,
  userController.createUser
);

router.get("/user", userController.getUsers);

router.get("/user/:id", userController.getUserById);

router.put(
  "/user/:id",
  validateUpdateUser,
  handleValidationErrors,
  userController.updateUser
);

router.delete("/user/:id", userController.deleteUser);

export default router;
