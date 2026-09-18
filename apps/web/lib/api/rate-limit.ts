// lib/api/rate-limit.ts
// Menutup D13-20 — header rate-limit standar termasuk Retry-After untuk 429.
//
// DIPERBARUI 0095: sebelumnya pakai in-memory Map — komentar lama di sini
// sendiri mengakui itu tidak reliable di deployment serverless
// multi-instance dan menyarankan "ganti store dengan backend bersama (mis.
// Upstash Redis)" untuk produksi. Itu bertentangan dengan ADR-018 (Core
// Technical Decisions, LOCKED): "Rate limiting/application cache = Supabase
// Postgres rate_limit_log" — dan baris tepat di atasnya eksplisit melarang
// "cache vendor baru". Diganti memanggil RPC `check_and_increment_rate_limit`
// (migration 0095) — satu sumber kebenaran di Postgres, reliable lintas
// instance, tanpa vendor baru.

import { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "./errors";

const WINDOW_MS = 60_000; // 1 menit
const MAX_REQUESTS_PER_WINDOW = 60;

export interface RateLimitResult {
  limit: number;
  remaining: number;
  resetAt: number; // epoch ms
}

export async function checkRateLimit(supabase: SupabaseClient, key: string): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_and_increment_rate_limit", {
    p_key: key,
    p_window_ms: WINDOW_MS,
    p_max_requests: MAX_REQUESTS_PER_WINDOW,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  const windowStartMs = new Date(row.window_start).getTime();
  const resetAt = windowStartMs + WINDOW_MS;
  const remaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - row.request_count);

  if (!row.allowed) {
    throw new ApiError("RATE_LIMITED", "Terlalu banyak request, coba lagi nanti.", {
      retryAfterSeconds: Math.ceil((resetAt - Date.now()) / 1000),
    });
  }

  return { limit: MAX_REQUESTS_PER_WINDOW, remaining, resetAt };
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}
