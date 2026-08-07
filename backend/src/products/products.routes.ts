import { Router } from "express";
import * as service from "./products.service";
import { asyncHandler } from "../middlewares/error";

const router = Router();

// The catalogue is public — no auth middleware here on purpose.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json({ products: await service.listProducts() });
  })
);

router.get(
  "/:slug",
  asyncHandler(async (req, res) => {
    res.json({ product: await service.getProductBySlug(req.params.slug) });
  })
);

export default router;
