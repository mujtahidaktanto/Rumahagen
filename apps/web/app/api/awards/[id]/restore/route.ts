// app/api/awards/[id]/restore/route.ts
// API-233 POST /awards/{award_id}/restore — authorized authority
// mengembalikan award yang sebelumnya di-revoke. Otorisasi lewat RLS
// award_instances_update (0026) — m15.award.revoke/manage (permission yang
// sama dipakai revoke juga dipakai restore, tidak ada permission
// m15.award.restore terpisah di master matrix).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("award_instances")
    .update({ status: "restored", restored_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .eq("status", "revoked")
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError(
      "NOT_FOUND",
      "Award tidak ditemukan, Anda tidak punya akses, atau award belum berstatus revoked.",
    );
  }

  return { data };
});
