import express from "express";
import { register, login, registerProvider } from "../controllers/authController.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/register-provider", registerProvider);

export default router;
