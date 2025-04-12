import express from "express";
const router = express.Router();

import authController from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import getUserTokenMiddleware from "../middlewares/getUserToken.middleware.js";

router.post("/auth/login", authController.loginUser);

router.post("/auth/register", authController.register);

router.post("/auth/forgot-password", authController.forgotPassword);

router.post("/auth/reset-password", authController.resetPassword);

router.post("/auth/google", authController.googleLogin);

router.post("/auth/facebook", authController.facebookLogin);

router.get(
  "/auth/me",
  authMiddleware,
  getUserTokenMiddleware,
  authController.getMe
);

export default router;
