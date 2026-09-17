// app/api/commercial/quota/[id]/route.ts
// API-193 GET /commercial/quota/{quota_id} — Owner/admin. {quota_id} =
// operational_quota_pools.id (pool adalah resource "quota" yang dibaca/
// dialokasi/dikonsumsi, konsisten dengan p_pool_id di fungsi SQL 0079).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operational_quota_pools")
    .select("*, quota_capacities(*)")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Quota pool tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
