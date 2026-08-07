import express, { Router } from "express";
import {
  adminListProducts,
  createProduct,
  getProductBySlug,
  getProducts,
} from "../controllers/product.controller";
import { protectMiddleware, requireAdmin } from "../middleware/protected";

const router: Router = express.Router();

// The catalogue is public — no auth middleware here on purpose.
router.get("/", getProducts);
// Declared before "/:slug" so the literal "admin" path is never swallowed by
// the dynamic segment.
router.get("/admin", protectMiddleware, requireAdmin, adminListProducts);
router.post("/", protectMiddleware, requireAdmin, createProduct);
router.get("/:slug", getProductBySlug);

export default router;
