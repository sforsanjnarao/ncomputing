import { Router } from "express";
import * as controller from "./auth.controller";
import { asyncHandler } from "../middlewares/error";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.post("/register", asyncHandler(controller.registerHandler));
router.post("/login", asyncHandler(controller.loginHandler));
router.post("/logout", asyncHandler(controller.logoutHandler));
router.get("/me", requireAuth, asyncHandler(controller.meHandler));

export default router;
