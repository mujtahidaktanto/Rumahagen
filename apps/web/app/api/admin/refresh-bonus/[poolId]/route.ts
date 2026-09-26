// app/api/admin/refresh-bonus/{poolId}/route.ts
// DELETE /admin/refresh-bonus/{poolId} — Superadmin mencabut satu bonus jatah refresh (berlaku selesai saat itu juga; pemakaian yang sudah tercatat hari ini tetap dihitung). Migration 0159.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const DELETE = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("revoke_refresh_bonus", { p_pool_id: ctx.params.poolId });
  if (error) {
    if (error.code === "42501") throw new ApiError("FORBIDDEN", "Hanya Superadmin yang bisa mencabut bonus jatah refresh.");
    if (error.code === "P0002") throw new ApiError("NOT_FOUND", "Bonus tidak ditemukan atau sudah dicabut.");
    throw error;
  }
  return { data };
});
