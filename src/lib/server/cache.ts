import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private';

const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

const DEFAULT_TTL = 10 * 60;

export async function getCache(handle: string): Promise<any | null> {
  try {
    const cachedData = await redis.get<any>(handle);
    if (!cachedData) return null;
    return cachedData;
  } catch (err) {
    console.error(`[REDIS ERROR] GET: ${err}`);
    return null;
  }
}

/**
 * setCache đã được nâng cấp để nhận ttl tùy chỉnh
 * @param handle Key
 * @param data Value
 * @param ttl Thời gian sống (giây). Mặc định 600s (10p)
 */
export async function setCache(handle: string, data: any, ttl: number = DEFAULT_TTL): Promise<void> {
  try {
    await redis.set(handle, JSON.stringify(data), {
      ex: ttl
    });
  } catch (err) {
    console.error(`[REDIS ERROR] SET: ${err}`);
  }
}
