import { redis } from "./redis";

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds: number) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function deleteCache(...keys: string[]) {
  if (keys.length) await redis.del(...keys);
}
