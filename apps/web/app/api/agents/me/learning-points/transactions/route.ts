// app/api/agents/me/learning-points/transactions/route.ts
// API-070 GET /agents/me/learning-points/transactions — ledger/history LP
// milik pemanggil sendiri. Otorisasi lewat RLS
// learning_point_transactions_select (0023).

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat riwayat LP.");
  }

  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("learning_point_transactions")
    .select("*", { count: "exact" })
    .eq("user_id", ctx.userId)
    .order("occurred_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
