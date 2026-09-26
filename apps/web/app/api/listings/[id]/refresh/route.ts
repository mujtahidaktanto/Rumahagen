// app/api/listings/[id]/refresh/route.ts
// API-237 POST /listings/{id}/refresh — satu-satunya endpoint yang membungkus
// fungsi refresh_listing() dari supabase/migrations/0020_m03_m14_refresh_allowance_invocation.sql
// (D13-01: kontrak invocation M03->M14 sudah fisik di level fungsi SQL sejak
// Tahap 4; route ini yang menutupnya di level HTTP/STEP-11).
//
// requireIdempotencyKey: true (D13-21) — Refresh mengonsumsi kuota harian
// Agent (quota_usage, 0019), jadi retry tanpa idempotency key bisa
// menghabiskan kuota lebih dari sekali untuk aksi yang sama secara tidak sengaja.
//
// PENTING: dipanggil lewat client server-side BIASA (createClient(), sesi user
// login), BUKAN admin/service-role client — refresh_listing() adalah SECURITY
// DEFINER yang tetap mengandalkan auth.uid() dari sesi asli pemanggil untuk
// pengecekan has_permission() di dalamnya (pola sama seperti peringatan di
// lib/supabase/admin.ts dan komentar admin_force_provider_connection di 0016).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

interface RefreshListingRow {
  success: boolean;
  reason: string;
  remaining_today: number | null;
  refreshed_at: string | null;
}

const FAILURE_STATUS: Record<string, "NOT_FOUND" | "CONFLICT"> = {
  listing_not_found: "NOT_FOUND",
  listing_not_published: "CONFLICT",
  listing_already_refreshed_today: "CONFLICT",
  agent_daily_quota_exhausted: "CONFLICT",
  agent_refresh_allowance_none: "CONFLICT", // jatah harian efektif 0 (migration 0159)
};

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melakukan refresh listing.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("refresh_listing", { p_listing_id: ctx.params.id })
    .single<RefreshListingRow>();

  if (error) {
    // refresh_listing() RAISE EXCEPTION kalau pemanggil tidak punya permission
    // m03.listing.refresh sama sekali (beda dari kegagalan bisnis normal di
    // bawah, yang dikembalikan sebagai success=false, bukan exception).
    if (typeof error.message === "string" && error.message.includes("m03.listing.refresh")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("INTERNAL_ERROR", "refresh_listing() tidak mengembalikan hasil.");
  }

  if (!data.success) {
    const code = FAILURE_STATUS[data.reason] ?? "CONFLICT";
    throw new ApiError(code, data.reason);
  }

  return {
    data: {
      success: true,
      remaining_today: data.remaining_today,
      refreshed_at: data.refreshed_at,
    },
  };
});
