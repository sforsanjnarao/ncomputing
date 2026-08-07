import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { attachUser } from "./middlewares/auth";
import { errorHandler, notFoundHandler } from "./middlewares/error";
import authRoutes from "./auth/auth.routes";
import productRoutes from "./products/products.routes";
import orderRoutes from "./orders/orders.routes";
import leadRoutes from "./leads/leads.routes";
import paymentRoutes from "./payments/payments.routes";

export function createApp() {
  const app = express();

  // Credentials must be allowed for the httpOnly auth cookie to travel.
  app.use(
    cors({
      origin: env.FRONTEND_URL.split(",").map((url) => url.trim()),
      credentials: true,
    })
  );

  app.use(
    express.json({
      // Razorpay signs the exact bytes it sent, so webhook verification needs
      // the untouched body. Stash it while parsing instead of mounting a
      // separate raw-body route.
      verify: (req, _res, buf) => {
        (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
      },
    })
  );
  app.use(cookieParser());
  app.use(attachUser);

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/payments", paymentRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
