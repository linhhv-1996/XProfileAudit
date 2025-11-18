// Nơi tạo file: src/lib/server/cache.ts
import { Redis } from '@upstash/redis';
import { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } from '$env/static/private';

// Khởi tạo 1 lần
const redis = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

// 10 phút = 600 giây
const CACHE_TTL_SECONDS = 10 * 60;

/**
 * Lấy TOÀN BỘ KẾT QUẢ từ cache (nếu còn hạn 10p)
 * @param handle Key
 * @returns {any | null} Data nếu HIT, null nếu MISS
 */
export async function getCache(handle: string): Promise<any | null> {
  try {
    const cachedData = await redis.get<any>(handle); 

    if (!cachedData) {
      console.log(`[REDIS CACHE MISS] Không có cache 10p: ${handle}`);
      return null;
    }

    console.log(`[REDIS CACHE HIT] Trả cache 10p cho: ${handle}`);
    return cachedData;
  
  } catch (err) {
    console.error(`[REDIS ERROR] Lỗi khi lấy cache: ${err}`);
    return null;
  }
}

/**
 * Lưu TOÀN BỘ KẾT QUẢ vào cache (set hết hạn 10p)
 * (Hàm này đã ĐÚNG từ đầu)
 * @param handle Key
 * @param data Cục data (finalResult)
 */
export async function setCache(handle: string, data: any): Promise<void> {
  try {
    await redis.set(handle, JSON.stringify(data), {
      ex: CACHE_TTL_SECONDS
    });
    console.log(`[REDIS CACHE SET] Đã lưu cache 10p cho: ${handle}`);
  } catch (err) {
    console.error(`[REDIS ERROR] Lỗi khi set cache: ${err}`);
  }
}
