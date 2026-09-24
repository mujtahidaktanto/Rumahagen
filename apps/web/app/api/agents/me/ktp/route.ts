// app/api/agents/me/ktp/route.ts
// GET /agents/me/ktp — status verifikasi KTP milik sendiri (nomor disamarkan, foto lewat signed URL 10 menit).
// PUT /agents/me/ktp { ktp_number, photo_path } — kirim nomor KTP (NIK 16 digit) + path foto hasil POST /agents/me/ktp/upload-url. Bila lolos pemeriksaan bentuk
// NIK dan foto ada di storage, akun LANGSUNG berstatus verified (tanpa tinjauan staf; keputusan produk 2026-09-25) dan lencana tampil di profil publik.
// Nomor dan foto KTP privat: tidak pernah ada di view profil publik. Kirim ulang menimpa data lama. Staf dapat mencabut verifikasi
// (POST /admin/agents/{id}/ktp/reset). NIK sudah dipakai akun lain -> 409.

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { throwIntegrityError } from "@/lib/api/integrity-error";
import { validateJsonBody } from "@/lib/api/validate";
import { submitKtpSchema } from "@/lib/validation/agent-ktp";
import { ktpObjectExists, ktpSignedUrl, maskNik, removeKtpObject } from "@/lib/storage/agent-ktp";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");
  }
  const supabase = await createClient();
  const { data: profile, error: profileError } = await supabase.from("agent_profiles").select("ktp_requirement_state").eq("user_id", ctx.userId).maybeSingle();
  if (profileError) {
    throw profileError;
  }
  const { data: kyc, error } = await supabase.from("agent_kyc").select("ktp_number, ktp_photo_path, submitted_at, updated_at").eq("user_id", ctx.userId).maybeSingle();
  if (error) {
    throw error;
  }
  return {
    data: {
      status: profile?.ktp_requirement_state ?? "deferred",
      is_verified: profile?.ktp_requirement_state === "verified",
      ktp_number_masked: kyc ? maskNik(kyc.ktp_number) : null,
      photo_url: kyc ? await ktpSignedUrl(kyc.ktp_photo_path) : null,
      submitted_at: kyc?.submitted_at ?? null,
      updated_at: kyc?.updated_at ?? null,
    },
  };
});

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk mengirim KTP.");
  }
  const body = await validateJsonBody(ctx.request, submitKtpSchema);
  if (!body.photo_path.startsWith(`${ctx.userId}/`)) {
    throw new ApiError("VALIDATION_ERROR", "Foto KTP harus diunggah ke folder akun Anda.");
  }
  if (!(await ktpObjectExists(body.photo_path))) {
    throw new ApiError("VALIDATION_ERROR", "Foto KTP belum diunggah; selesaikan unggah lebih dulu.");
  }
  const supabase = await createClient();
  const { data: before } = await supabase.from("agent_kyc").select("ktp_photo_path").eq("user_id", ctx.userId).maybeSingle();

  const { data, error } = await supabase.rpc("submit_my_ktp", { p_ktp_number: body.ktp_number, p_photo_path: body.photo_path });
  if (error) {
    if (error.code === "23505") {
      throw new ApiError("CONFLICT", "Nomor KTP ini sudah terdaftar pada akun lain.");
    }
    throwIntegrityError(error);
  }
  // Foto lama yang tergantikan dihapus dari storage.
  if (before?.ktp_photo_path && before.ktp_photo_path !== body.photo_path) {
    await removeKtpObject(before.ktp_photo_path);
  }
  return { data };
});
