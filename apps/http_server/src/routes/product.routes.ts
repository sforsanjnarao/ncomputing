import express, { Router } from "express";
import {
  adminListProducts,
  createProduct,
  getProductBySlug,
  getProducts,
} from "../controllers/product.controller";
import { protectMiddleware, requireAdmin } from "../middleware/protected";

const router: Router = express.Router();

router.get("/", getProducts);

router.get("/admin", protectMiddleware, requireAdmin, adminListProducts);
router.post("/", protectMiddleware, requireAdmin, createProduct);
router.get("/:slug", getProductBySlug);

export default router;
