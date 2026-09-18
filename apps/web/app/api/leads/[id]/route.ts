// app/api/leads/[id]/route.ts
// API-048 GET /leads/{id} — Lead detail route (STEP11-B2). RLS
// listing_leads_select (pemilik listing/staf) yang menggerbangi.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listing_leads")
    .select("*")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Lead tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
