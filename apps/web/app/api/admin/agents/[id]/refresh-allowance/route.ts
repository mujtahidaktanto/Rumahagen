// app/api/admin/agents/[id]/refresh-allowance/route.ts
// GET /admin/agents/{id}/refresh-allowance — jatah Refresh harian seorang Agent beserta daftar bonus/tambahan (aktif dan riwayat). Hanya Superadmin (penjaga di fungsi admin_refresh_allowance, migration 0159).
// Angka bawaan semua Agent diubah lewat PUT /admin/config/system/refresh_allowance.default_daily.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_refresh_allowance", { p_agent_id: ctx.params.id });
  if (error) {
    if (error.code === "42501") throw new ApiError("FORBIDDEN", "Hanya Superadmin yang bisa melihat jatah refresh Agent.");
    throw error;
  }
  return { data };
});
