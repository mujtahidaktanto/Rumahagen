// app/api/admin/analytics/dashboard/route.ts
// GET /admin/analytics/dashboard?from=YYYY-MM-DD&to=YYYY-MM-DD&compare=true|false
// Sisi baca Dashboard Analytics Admin (docs/analytics/METRIC_DEFINITIONS_v1.md
// v1.1). Otorisasi ada di DB (R-02): RPC admin_analytics_flow/funnel (0124)
// menolak selain Superadmin/Admin/Manager dengan 42501, yang dipetakan
// handler menjadi 403; metrics_daily_snapshot (0123) dibatasi RLS yang sama.
// Route tidak mengulang cek peran dan tidak memakai service role.
//
// Preset rentang (7/14/30 hari, bulan ini) diselesaikan klien menjadi
// from/to; tanggal = tanggal kalender WIB.

import { withApiHandler } from "@/lib/api/handler";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { analyticsRangeQuerySchema, compareOf } from "@/lib/validation/analytics";
import { loadDashboard } from "@/lib/analytics/dashboard";

export const GET = withApiHandler({}, async (ctx) => {
  const query = validateSearchParams(new URL(ctx.request.url).searchParams, analyticsRangeQuerySchema);
  const supabase = await createClient();
  const data = await loadDashboard(supabase, { from: query.from, to: query.to, compare: compareOf(query) });
  return { data };
});
