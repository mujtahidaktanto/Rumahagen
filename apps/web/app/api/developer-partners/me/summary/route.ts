// app/api/developer-partners/me/summary/route.ts
// GET /developer-partners/me/summary — angka dashboard Developer Partner dalam satu panggilan (migration 0147, partner_dashboard_summary): proyek per status,
// klaim per status (dan yang menunggu), marketing kit, media, dan event yang diajukan. Staf boleh menambah ?partner_id=.

import { withApiHandler } from "@/lib/api/handler";
import { validateSearchParams } from "@/lib/api/validate";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const querySchema = z.object({ partner_id: z.string().uuid().optional() });

export const GET = withApiHandler({}, async (ctx) => {
  const filters = validateSearchParams(new URL(ctx.request.url).searchParams, querySchema);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("partner_dashboard_summary", { p_partner_id: filters.partner_id ?? null });
  if (error) {
    throw error;
  }
  return { data };
});
