import express, { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from "../controllers/user.controller";
import { protectMiddleware } from "../middleware/protected";
import { authLimiter } from "../rateLimit";

const router: Router = express.Router();

router.post("/register", authLimiter, registerController);
router.post("/login", authLimiter, loginController);
router.post("/logout", logoutController);
router.get("/me", protectMiddleware, meController);

export default router;
