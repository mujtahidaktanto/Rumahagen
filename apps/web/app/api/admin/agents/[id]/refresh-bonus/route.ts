// app/api/admin/agents/[id]/refresh-bonus/route.ts
// POST /admin/agents/{id}/refresh-bonus { extra_daily, valid_until?, reason? } — Superadmin memberi TAMBAHAN jatah refresh harian ke satu Agent (mis. hadiah ulang tahun +10 sampai akhir tanggal tertentu WIB;
// tanpa valid_until = berlaku terus sampai dicabut). Ditambahkan di atas jatah bawaan. Penjaga dan audit ada di grant_refresh_bonus (migration 0159).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateJsonBody } from "@/lib/api/validate";
import { refreshBonusSchema } from "@/lib/validation/refresh-allowance";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const body = await validateJsonBody(ctx.request, refreshBonusSchema);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("grant_refresh_bonus", {
    p_agent_id: ctx.params.id,
    p_extra_daily: body.extra_daily,
    p_valid_until: body.valid_until ?? null,
    p_reason: body.reason ?? null,
  });
  if (error) {
    if (error.code === "42501") throw new ApiError("FORBIDDEN", "Hanya Superadmin yang bisa memberi tambahan jatah refresh.");
    if (error.code === "23503") throw new ApiError("NOT_FOUND", "Pengguna tidak ditemukan.");
    if (error.code === "23514") throw new ApiError("VALIDATION_ERROR", error.message.replace(/^grant_refresh_bonus: /, ""));
    throw error;
  }
  return { data, status: 201 };
});
