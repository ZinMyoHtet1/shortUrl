import express from "express";

import authController from "../Controllers/Auth.controller.js";

const router = express.Router();

router.get("/", authController.get);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/verify/:verifyID", authController.verifyEmail);
router.post("/forget-password", authController.forgetPassword);
router.post("/verify-otp", authController.verifyOTP);
router.get("/oauth", authController.googleLogin);

export default router;
