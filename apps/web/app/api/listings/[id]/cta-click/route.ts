// app/api/listings/[id]/cta-click/route.ts
// API-045 POST /listings/{id}/cta-click — CTA analytics/lead event
// (STEP11-B2). CTA click alone does not create a buyer relationship or
// commercial transaction — murni event log lewat listing_leads (RLS INSERT
// terbuka untuk siapa pun termasuk anonim).

import { withApiHandler } from "@/lib/api/handler";
import { createListingLead } from "@/lib/listings/create-lead";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const data = await createListingLead(supabase, ctx.params.id!, "whatsapp_cta", ctx.request);
  return { data, status: 201 };
});
