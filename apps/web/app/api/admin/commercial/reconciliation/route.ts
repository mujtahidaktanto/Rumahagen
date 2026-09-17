// app/api/admin/commercial/reconciliation/route.ts
// API-197 GET /admin/commercial/reconciliation — Authorized reconciliation
// operator (list). RLS reconciliation_cases_manage (0076, staff-only FOR
// ALL) yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);
  const status = url.searchParams.get("status");

  const supabase = await createClient();
  let query = supabase
    .from("reconciliation_cases")
    .select("*", { count: "exact" })
    .order("opened_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, count, error } = await query;

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
