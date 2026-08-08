import express, { Router } from "express";
import { trackEvent } from "../controllers/visitor.controller";

const router: Router = express.Router();


router.post("/", trackEvent);

export default router;
