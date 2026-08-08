import Redis from "ioredis";

// Managed Redis (Upstash, Railway, Render) hands out one rediss:// URL with
// auth + TLS baked in; REDIS_HOST/REDIS_PORT stays as the local/docker-compose
// fallback where there's no auth or TLS to speak of.
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null, // required by BullMQ
    });
