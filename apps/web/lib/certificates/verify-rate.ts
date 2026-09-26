// lib/certificates/verify-rate.ts — pembatas percobaan untuk halaman publik /verifikasi (wireframe M04: "Terlalu banyak percobaan"). API GET /certificates/verify/{kode} sudah dibatasi
// oleh withApiHandler; halaman memanggil RPC langsung sehingga memakai pembatas yang sama (rate_limit_log, 60 permintaan/menit) dengan kunci terpisah "verify:{ip}" agar tidak
// memakan jatah API. Kegagalan pembatas sendiri (bukan RATE_LIMITED) tidak menghalangi verifikasi (informasi publik).
import { headers } from "next/headers";
import { ApiError } from "@/lib/api/errors";
import { checkRateLimit } from "@/lib/api/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function isVerifyRateLimited(): Promise<boolean> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "anonymous";
    await checkRateLimit(await createClient(), `verify:${ip}`);
    return false;
  } catch (err) {
    return err instanceof ApiError && err.code === "RATE_LIMITED";
  }
}
