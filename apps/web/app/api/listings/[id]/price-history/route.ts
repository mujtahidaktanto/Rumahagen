// app/api/listings/[id]/price-history/route.ts
// API-033 GET /listings/{id}/price-history — price-history route
// (STEP11-B2). Read-only — listing_price_history diisi OTOMATIS lewat
// trigger log_listing_price_change() (0047), tidak ada jalur INSERT untuk
// siapa pun. RLS listing_price_history_select (pemilik listing/staf saja,
// bukan publik) yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { parsePagination, buildPaginationMeta } from "@/lib/api/pagination";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const url = new URL(ctx.request.url);
  const { limit, offset } = parsePagination(url.searchParams);

  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("listing_price_history")
    .select("*", { count: "exact" })
    .eq("listing_id", ctx.params.id)
    .order("changed_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw error;
  }

  return { data, pagination: buildPaginationMeta(limit, offset, count ?? 0) };
});
