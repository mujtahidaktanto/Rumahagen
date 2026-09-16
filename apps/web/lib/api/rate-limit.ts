// lib/api/rate-limit.ts
// Menutup D13-20 — header rate-limit standar termasuk Retry-After untuk 429.
//
// CATATAN PRODUKSI: implementasi di bawah pakai in-memory Map — cukup untuk
// scaffold/dev satu instance, TAPI TIDAK reliable di deployment serverless
// multi-instance (Vercel dsb.) karena tiap instance punya memori sendiri.
// Untuk produksi, ganti `store` dengan backend bersama (mis. Upstash Redis)
// tanpa mengubah kontrak fungsi di bawah (checkRateLimit/rateLimitHeaders).

import { ApiError } from "./errors";

const WINDOW_MS = 60_000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 60;

interface Bucket {
  count: number;
  windowStart: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitResult {
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    store.set(key, { count: 1, windowStart: now });
    return { limit: MAX_REQUESTS_PER_WINDOW, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetAt: now + WINDOW_MS };
  }

  bucket.count += 1;

  if (bucket.count > MAX_REQUESTS_PER_WINDOW) {
    const resetAt = bucket.windowStart + WINDOW_MS;
    throw new ApiError("RATE_LIMITED", "Terlalu banyak request, coba lagi nanti.", {
      retryAfterSeconds: Math.ceil((resetAt - now) / 1000),
    });
  }

  return {
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - bucket.count,
    resetAt: bucket.windowStart + WINDOW_MS,
  };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
