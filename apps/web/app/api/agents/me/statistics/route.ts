// app/api/agents/me/statistics/route.ts
// GET /agents/me/statistics?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=true|false[&organization_id=UUID]
// Sisi baca "Statistik Saya" (analitik agen). Tanpa organization_id = data
// agen sendiri + perbandingan anonim; dengan organization_id = statistik
// organisasi, khusus pemimpin aktif organisasi itu.
//
// Otorisasi ada di DB (R-02, migration 0125): RPC agent_statistics_* menolak
// dengan 42501 (dipetakan handler menjadi 403) bila pemanggil tidak punya
// m08.dashboard_projection.read atau bukan pemimpin aktif organisasi yang
// diminta. Route tidak mengulang cek itu dan tidak memakai service role.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { agentStatsQuerySchema, compareOf } from "@/lib/validation/analytics";
import { loadAgentStats } from "@/lib/analytics/agent-stats";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk melihat statistik.");
  }
  const query = validateSearchParams(new URL(ctx.request.url).searchParams, agentStatsQuerySchema);
  const supabase = await createClient();
  const data = await loadAgentStats(supabase, {
    from: query.from,
    to: query.to,
    compare: compareOf(query),
    organizationId: query.organization_id,
  });
  return { data };
});
