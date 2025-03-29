import express from "express";
const router = express.Router();
import upload from "../utils//multerConfig.util.js";

import {
  validateCreateUser,
  validateUpdateUser,
} from "../validators/user.validator.js";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";
import getUserTokenMiddleware from "../middlewares/getUserToken.middleware.js";

router.post(
  "/user",
  validateCreateUser,
  handleValidationErrors,
  authMiddleware,
  userController.createUser
);

router.patch(
  "/user/avatar",
  upload.fields([{ name: "file", maxCount: 1 }]),
  authMiddleware,
  getUserTokenMiddleware,
  userController.updateAvatar
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
