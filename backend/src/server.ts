import { createApp } from "./app";
import { env, emailConfigured, razorpayConfigured } from "./config/env";

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`);
  console.log(`  CORS origin : ${env.FRONTEND_URL}`);
  console.log(`  Razorpay    : ${razorpayConfigured ? "configured" : "NOT configured"}`);
  console.log(`  Resend      : ${emailConfigured ? "configured" : "NOT configured"}`);
});
