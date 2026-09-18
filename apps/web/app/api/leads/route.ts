// app/api/leads/route.ts
// API-044 POST /leads — Public/buyer lead creation contract (STEP11-B2).
// Bentuk top-level dari operasi yang sama dengan API-045 cta-click
// (listing_id di body, bukan path) — lihat lib/listings/create-lead.ts.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createLeadSchema } from "@/lib/validation/listing-media";
import { createListingLead } from "@/lib/listings/create-lead";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, createLeadSchema);
  const supabase = await createClient();
  const data = await createListingLead(supabase, body.listing_id, body.source, ctx.request);
  return { data, status: 201 };
});
