// app/api/admin/agent-reviews/pending/route.ts
// API-018 GET /admin/agent-reviews/pending — Moderation/exception queue
// (STEP11-B1). Review normalnya auto-approved (status='approved' langsung
// saat submit) — endpoint ini murni jalur EXCEPTION (kalau suatu saat ada
// baris berstatus 'pending' akibat proses lain, mis. migrasi data lama),
// BUKAN gate persetujuan normal. RLS agent_reviews_select membiarkan staf
// (m02.review.view scope all) melihat semua, filter status di sini.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("agent_reviews")
    .select("*", { count: "exact" })
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
