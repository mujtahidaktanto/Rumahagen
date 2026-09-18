// app/api/organization-invitations/[id]/reject/route.ts
// API-164 PUT /organization-invitations/{id}/reject — STEP11-B6. Trigger
// tidak membatasi 'rejected' (hanya 'accepted') — kedua pihak boleh menolak.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .update({ status: "rejected", responded_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Undangan/permohonan tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
