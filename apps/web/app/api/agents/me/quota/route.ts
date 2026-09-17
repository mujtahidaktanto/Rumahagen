// app/api/agents/me/quota/route.ts
// API-191 GET /agents/me/quota — Agent, milik sendiri. Menyertakan
// quota_capacities terkait (embed lewat FK operational_quota_pools.
// quota_capacity_id) supaya klien lihat capacity_type/granted_quantity
// tanpa request kedua.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat quota milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operational_quota_pools")
    .select("*, quota_capacities(*)")
    .eq("user_id", ctx.userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});
