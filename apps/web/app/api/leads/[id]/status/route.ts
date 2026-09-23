// app/api/leads/[id]/status/route.ts
// API-049 PUT /leads/{id}/status — kolom `status` ADD-NEW (migration
// 0114, listing_leads sebelumnya murni log kejadian klik CTA tanpa status
// sama sekali). RLS listing_leads_update (0114) meniru PERSIS logika
// listing_leads_select (has_permission('m03.listing.update', l.agent_id))
// — siapa pun yang bisa lihat detail lead (pemilik listing + Superadmin),
// bisa ubah statusnya, konsisten satu sumber otorisasi (R-02).

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateLeadStatusSchema } from "@/lib/validation/listing-media";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateLeadStatusSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_leads")
    .update({ status: body.status })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new ApiError("NOT_FOUND", "Lead tidak ditemukan atau Anda tidak punya akses untuk mengubah statusnya.");
  }

  return { data };
});
