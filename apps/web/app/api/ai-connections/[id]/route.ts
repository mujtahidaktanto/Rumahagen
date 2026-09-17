// app/api/ai-connections/[id]/route.ts
// GET detail, PUT (rotate key dan/atau ubah status active/disconnected/
// invalid oleh pemilik sendiri), DELETE (evidenced STEP11-B10 §4, TAPI
// diimplementasikan sebagai SOFT-DISCONNECT, bukan SQL DELETE nyata — lihat
// catatan di bawah). `encrypted_api_key` tidak pernah diikutkan di response.
//
// KEPUTUSAN DELETE: migration 0016 SENGAJA tidak membuat RLS policy DELETE
// untuk agent_ai_connections ("Siklus hidup koneksi hanya boleh berubah
// lewat status... bukan lewat penghapusan baris; ini menjaga jejak audit").
// STEP11-B10 mengevidence route DELETE /ai-connections/{id} di kontrak HTTP,
// tapi keputusan desain DB (yang beralasan eksplisit soal audit trail) lebih
// diutamakan daripada mengubah RLS untuk mengizinkan hard-delete — jadi
// verb/path HTTP-nya dipertahankan, TAPI implementasinya adalah UPDATE
// status='disconnected' (transisi yang sudah diizinkan RLS
// agent_ai_connections_self_update untuk pemilik sendiri), bukan .delete().

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { updateAiConnectionSchema } from "@/lib/validation/ai-providers";
import { encryptApiKey } from "@/lib/crypto/byok";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

const SAFE_COLUMNS = "id, user_id, provider_id, status, disabled_by_admin, last_validated_at, connected_at, created_at, updated_at";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_ai_connections")
    .select(SAFE_COLUMNS)
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Koneksi AI tidak ditemukan.");
  }

  return { data };
});

export const PUT = withApiHandler({}, async (ctx) => {
  const body = await validateJsonBody(ctx.request, updateAiConnectionSchema);
  const supabase = await createClient();

  const update: Record<string, unknown> = {};
  if (body.api_key) update.encrypted_api_key = encryptApiKey(body.api_key);
  if (body.status) update.status = body.status;
  if (body.disabled_by_admin === false) update.disabled_by_admin = false;

  const { data, error } = await supabase
    .from("agent_ai_connections")
    .update(update)
    .eq("id", ctx.params.id)
    .select(SAFE_COLUMNS)
    .maybeSingle();

  if (error) {
    // Trigger trg_agent_ai_connection_transition (0016) menolak reaktivasi
    // mandiri untuk koneksi yang sedang di-FORCE_DISABLE admin — pemilik
    // harus minta admin membalikkan disabled_by_admin dulu, bukan pemilik
    // sendiri lewat PUT status biasa.
    if (typeof error.message === "string" && error.message.includes("disabled_by_admin=true hanya valid")) {
      throw new ApiError("CONFLICT", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Koneksi AI tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});

export const DELETE = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("agent_ai_connections")
    .update({ status: "disconnected" })
    .eq("id", ctx.params.id)
    .select(SAFE_COLUMNS)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Koneksi AI tidak ditemukan atau Anda tidak punya akses.");
  }

  return { data };
});
