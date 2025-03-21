import express from "express";
const router = express.Router();

import {
  validateCreateUser,
  validateUpdateUser,
} from "../validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import userController from "../controllers/user.controller.js";

router.post(
  "/users",
  validateCreateUser,
  handleValidationErrors,
  userController.createUser
);

router.get("/users", userController.getUsers);

router.get("/users/:id", userController.getUserById);

router.put(
  "/users/:id",
  validateUpdateUser,
  handleValidationErrors,
  userController.updateUser
);

router.delete("/users/:id", userController.deleteUser);

export default router;
