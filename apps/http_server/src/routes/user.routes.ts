import express, { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  registerController,
} from "../controllers/user.controller";
import { protectMiddleware } from "../middleware/protected";

const router: Router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", protectMiddleware, meController);

export default router;
