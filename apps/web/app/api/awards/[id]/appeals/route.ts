// app/api/awards/[id]/appeals/route.ts
// API-230 POST /awards/{award_id}/appeals ("Award owner") + API-231 GET
// /awards/{award_id}/appeals ("Owner/authority"). Tabel award_appeals
// ADD-NEW (migration 0098) -- Core mengunci endpoint ini tapi tidak pernah
// mendefinisikan tabel fisiknya (dicek: tidak ada di 14 tabel M15 manapun).
//
// Kelayakan (appellant memang pemilik award, award memang berstatus
// 'revoked') ditegakkan trigger DB (enforce_award_appeal_eligibility,
// 0098), bukan diduplikasi di sini (R-02) -- error dari trigger itu
// (RAISE EXCEPTION biasa, bukan 42501/23514) akan jatuh ke fallback
// INTERNAL_ERROR di lib/api/handler.ts kalau tidak ditangani; ditangkap
// eksplisit di bawah supaya client dapat 409 yang jelas.

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { createAwardAppealSchema } from "@/lib/validation/awards";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("award_appeals")
    .select("*")
    .eq("award_id", ctx.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return { data };
});

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengajukan appeal.");
  }

  const body = await validateJsonBody(ctx.request, createAwardAppealSchema);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("award_appeals")
    .insert({
      award_id: ctx.params.id,
      appellant_id: ctx.userId,
      reason: body.reason,
    })
    .select()
    .single();

  if (error) {
    // Trigger enforce_award_appeal_eligibility (0098) menolak lewat RAISE
    // EXCEPTION polos (bukan kode Postgres khusus) untuk: award tidak
    // ditemukan, appellant bukan pemilik, atau award belum/tidak lagi
    // 'revoked'. Unique index award_appeals_one_pending_per_award (23505)
    // menolak appeal kedua selagi satu masih pending.
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Sudah ada appeal yang masih menunggu keputusan untuk award ini.");
    }
    if (error.message?.includes("award_appeals:")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }

  return { data, status: 201 };
});
