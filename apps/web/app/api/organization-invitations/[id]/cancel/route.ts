// app/api/organization-invitations/[id]/cancel/route.ts
// PUT /organization-invitations/{id}/cancel — leader membatalkan undangan yang ia kirim, atau Agent menarik permohonan bergabungnya sendiri (migration 0161 menegakkan siapa boleh apa dan hanya dari 'pending').

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { createClient } from "@/lib/supabase/server";

export const PUT = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organization_invitations")
    .update({ status: "cancelled", responded_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();
  if (error) throwIntegrityError(error);
  if (!data) throw new ApiError("NOT_FOUND", "Undangan/permohonan tidak ditemukan atau Anda tidak punya akses.");
  return { data };
});
