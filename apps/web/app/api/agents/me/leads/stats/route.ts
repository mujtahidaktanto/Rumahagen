// app/api/agents/me/leads/stats/route.ts
// API-050 GET /agents/me/leads/stats — Agent lead statistics (STEP11-B2).
// SCOPE MINIMAL evidence-respecting: total count + breakdown per listing +
// per source — tidak ada bentuk statistik eksak yang dievidence, jadi tidak
// mengarang metrik lebih jauh (mis. tren waktu/grafik) di luar agregasi
// dasar yang jelas dari kolom yang ada.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat statistik lead milik sendiri.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_leads")
    .select("listing_id, source")
    .eq("agent_id", ctx.userId);

  if (error) {
    throw error;
  }

  const rows = data ?? [];
  const byListing: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  for (const row of rows) {
    byListing[row.listing_id] = (byListing[row.listing_id] ?? 0) + 1;
    bySource[row.source] = (bySource[row.source] ?? 0) + 1;
  }

  return {
    data: {
      total: rows.length,
      by_listing: byListing,
      by_source: bySource,
    },
  };
});
