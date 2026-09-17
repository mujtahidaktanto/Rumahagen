// app/api/admin/ai-connections/[id]/force/route.ts
// ADD-NEW — STEP11-B10 B10-C03 mencatat "FORCE_REVOKE/FORCE_DISCONNECT/
// FORCE_DISABLE admin intervention routes are not evidenced", TAPI fungsi
// SQL-nya (admin_force_provider_connection()) sudah fisik & lengkap sejak
// migration 0016 (menutup D13-10) — endpoint ini yang membungkusnya di
// lapisan HTTP, konsisten dengan pola listings/refresh (D13-01) yang juga
// membungkus fungsi SQL yang sudah ada duluan.
//
// Dipanggil lewat client server-side BIASA (createClient(), sesi user login)
// — BUKAN admin/service-role client, sesuai peringatan eksplisit di komentar
// fungsi 0016: SECURITY DEFINER-nya tetap butuh auth.uid() dari sesi asli
// pemanggil untuk pengecekan has_permission() di dalamnya.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { forceConnectionActionSchema } from "@/lib/validation/ai-providers";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk force-intervention koneksi AI.");
  }

  const body = await validateJsonBody(ctx.request, forceConnectionActionSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("admin_force_provider_connection", {
      p_connection_id: ctx.params.id,
      p_action: body.action,
      p_reason: body.reason ?? null,
    })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("m13.administrative_force_revoke_disable.execute")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    if (typeof error.message === "string" && error.message.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", error.message);
    }
    throw error;
  }

  // admin_force_provider_connection() RETURNS public.agent_ai_connections
  // (seluruh kolom, termasuk encrypted_api_key) — strip sebelum dikirim ke
  // client, konsisten dengan seluruh route M13 lain yang tidak pernah
  // mengekspos field itu.
  const { encrypted_api_key: _encrypted_api_key, ...safeData } = data as Record<string, unknown>;

  return { data: safeData };
});
