import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoute from "./routes/user.routes";
import productRoute from "./routes/product.routes";
import orderRoute from "./routes/order.routes";
import paymentRoute from "./routes/payment.routes";
import leadRoute from "./routes/lead.routes";

const app = express();

app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:3000").split(",").map((o) => o.trim()),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(
  express.json({
    // Razorpay signs the exact bytes it sent, so webhook verification needs the
    // untouched body. Stash it while parsing instead of a separate raw route.
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: string }).rawBody = buf.toString("utf8");
    },
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/leads", leadRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
