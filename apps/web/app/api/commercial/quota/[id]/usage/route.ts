// app/api/commercial/quota/[id]/usage/route.ts
// API-196 GET /commercial/quota/{quota_id}/usage — Owner/admin. RLS
// quota_usage_select (0019, join operational_quota_pools) yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("quota_usage")
    .select("*", { count: "exact" })
    .eq("operational_quota_pool_id", ctx.params.id)
    .order("usage_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
