import express from "express";

import authController from "../Controllers/Auth.controller.js";

const router = express.Router();

router.get("/", authController.get);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/temp-token", authController.getTempToken);
router.get("/verify/:verifyID", authController.verify);

export default router;
