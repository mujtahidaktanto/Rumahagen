// app/api/awards/[id]/appeals/[appealId]/decide/route.ts
// API-232 POST /awards/{award_id}/appeals/{appeal_id}/decide ("Authorized
// authority"). Otorisasi lewat RLS award_appeals_decide (0098) --
// m15.award.revoke/manage TANPA owner_id, sehingga Agent (scope 'own' untuk
// kedua permission itu) TIDAK LOLOS RLS ini sama sekali -- pemilik award
// tidak bisa memutuskan appeal-nya sendiri (mencegah self-approval).
//
// Route ini SENGAJA TIDAK memanggil /awards/{id}/restore secara otomatis
// saat decision='approved' -- keduanya endpoint terpisah dengan kontrak
// masing-masing (API-232 vs API-233), authority yang sama tetap harus
// memanggil /restore secara eksplisit untuk benar-benar mengembalikan
// status award. Ini menghormati "PRESERVE EXACT CURRENT CONTRACT" untuk
// KEDUA endpoint apa adanya, bukan menambah efek samping tersirat yang
// tidak dievidensi Core.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { decideAwardAppealSchema } from "@/lib/validation/awards";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const body = await validateJsonBody(ctx.request, decideAwardAppealSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("award_appeals")
    .update({
      status: body.decision,
      decision_note: body.decision_note ?? null,
      decided_by: ctx.userId,
    })
    .eq("id", ctx.params.appealId)
    .eq("award_id", ctx.params.id)
    .select()
    .maybeSingle();

  if (error) {
    // Trigger enforce_award_appeal_decision_final (0098) menolak lewat
    // RAISE EXCEPTION polos kalau appeal sudah final (bukan 'pending' lagi).
    if (error.message?.includes("award_appeals:")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Appeal tidak ditemukan, salah award, atau Anda tidak punya akses.");
  }

  await supabase.rpc("log_audit_event", {
    p_action: "m15.award_appeal.decide",
    p_entity_type: "award_appeals",
    p_entity_id: data.id,
    p_new_value: { status: data.status, decision_note: data.decision_note },
  });

  return { data };
});
