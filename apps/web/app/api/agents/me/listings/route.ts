// app/api/agents/me/listings/route.ts
// API-035 GET /agents/me/listings — daftar listing milik pemanggil sendiri,
// termasuk status non-published (draft, pending_review, dst.) yang tidak
// muncul di GET /listings publik. Otorisasi: RLS listings_select_..._or_owner
// (0018) sudah mengizinkan agent_id = auth.uid() melihat baris miliknya
// sendiri apa pun statusnya — filter .eq("agent_id", ...) di sini murni scoping
// query, bukan lapisan akses tambahan (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat listing milik sendiri.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("agent_id", ctx.userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return {
    data,
    pagination: buildPaginationMeta(limit, offset, count ?? 0),
  };
});
