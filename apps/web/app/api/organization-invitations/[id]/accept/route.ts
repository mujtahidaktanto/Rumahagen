// app/api/organization-invitations/[id]/accept/route.ts
// API-163 PUT /organization-invitations/{id}/accept — STEP11-B6. Trigger
// enforce_organization_invitation_no_self_accept (0050) mencegah pihak yang
// MEMULAI (initiated_by_type) menyetujui permohonannya sendiri, terlepas
// dari RLS yang mengizinkan UPDATE sampai ke titik ini.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    if (error.message?.includes("tidak boleh menyetujui")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Undangan/permohonan tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
