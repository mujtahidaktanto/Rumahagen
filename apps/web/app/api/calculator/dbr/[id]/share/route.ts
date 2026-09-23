// app/api/calculator/dbr/[id]/share/route.ts
// POST /calculator/dbr/{id}/share (STEP11-B10 M07 list, "Share/Revoke
// physical/API representation remains downstream" — Gate PRE-00-I §28 tidak
// mengunci path/verb spesifik, hanya semantik). Membungkus share_dbr_simulation()
// dari supabase/migrations/0089_m07_bank_master_dbr_share_revoke.sql — fungsi
// SECURITY DEFINER itu sudah ada dan sudah diuji lewat RPC langsung sejak 0089,
// TAPI belum pernah dibungkus route HTTP sampai batch ini.
//
// requireIdempotencyKey: true — share_dbr_simulation() menghasilkan
// share_token BARU setiap kali dipanggil (mengganti token lama kalau sudah
// pernah share sebelumnya), jadi retry tanpa idempotency key bisa
// membatalkan link yang sudah terlanjur dikirim ke prospek.
//
// Dipanggil lewat client server-side BIASA (createClient(), sesi user login),
// BUKAN admin/service-role — fungsi ini SECURITY DEFINER tapi tetap
// mengandalkan auth.uid() dari sesi pemanggil untuk pengecekan "hanya Creator"
// di dalamnya (pola sama seperti refresh_listing()).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk membagikan simulasi DBR.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("share_dbr_simulation", { p_id: ctx.params.id })
    .single();

  if (error) {
    if (typeof error.message === "string" && error.message.includes("tidak ditemukan")) {
      throw new ApiError("NOT_FOUND", "Simulasi DBR tidak ditemukan.");
    }
    if (typeof error.message === "string" && error.message.includes("hanya Creator")) {
      throw new ApiError("FORBIDDEN", error.message);
    }
    throw error;
  }
  if (!data) {
    throw new ApiError("INTERNAL_ERROR", "share_dbr_simulation() tidak mengembalikan hasil.");
  }

  return { data };
});
