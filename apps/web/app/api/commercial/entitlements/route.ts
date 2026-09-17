// app/api/commercial/entitlements/route.ts
// API-186 GET /commercial/entitlements — Authenticated/scoped. RLS
// commercial_entitlements_select (0019, m14.refresh_allowance_entitlement.
// configure scope own/all) yang menggerbangi — Agent lihat milik sendiri,
// staf lihat semua otomatis lewat query polos.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("commercial_entitlements")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
