// app/api/agents/[id]/awards/route.ts
// API-226 GET /agents/{agent_id}/awards — public/scoped: award aktif
// terlihat publik (pencapaian, wajar ditampilkan di profil agent),
// m15.award.manage lihat semua termasuk revoked. RLS award_instances_select
// yang sama dipakai — cukup filter user_id di query, RLS yang menggerbangi
// visibility per baris (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("award_instances")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.params.id)
    .order("issued_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
