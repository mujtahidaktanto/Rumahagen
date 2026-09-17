// app/api/awards/[id]/lifecycle/route.ts
// API-228 PATCH /awards/{award_id}/lifecycle — revoke. Otorisasi lewat RLS
// award_instances_update (0026) — m15.award.revoke/manage. Transisi
// 'expired' TIDAK diimplementasikan di sini — tidak ada mekanisme
// auto-expire (cron/job) di manapun pada repo ini, jadi tidak ada pemicu
// nyata untuk status itu; hanya revoke (aksi manual staf/authority) yang
// punya jalur RLS+kegunaan nyata. Restore punya endpoint terpisah
// (awards/{id}/restore, API-233) sesuai kontrak STEP11-B8.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { revokeAwardSchema } from "@/lib/validation/awards";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const PATCH = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  await validateJsonBody(ctx.request, revokeAwardSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("award_instances")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Award tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
