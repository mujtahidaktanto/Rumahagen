// app/api/calculator/dbr/shared/[token]/route.ts
// GET /calculator/dbr/shared/{token} — akses RECIPIENT (prospek) atas
// simulasi DBR yang dibagikan, membungkus get_shared_dbr_simulation() dari
// supabase/migrations/0089_m07_bank_master_dbr_share_revoke.sql. Gate
// PRE-00-I §27: "share does not create a new platform role" — recipient
// TIDAK wajib login, jadi route ini TIDAK memeriksa ctx.userId sama sekali
// (beda dari seluruh route M07 lain yang mewajibkan auth).
//
// Otorisasi murni lewat kepemilikan token (dicek DI DALAM fungsi SQL:
// share_token cocok DAN shared_at IS NOT NULL DAN revoked_at IS NULL),
// BUKAN lewat RLS row-visibility biasa — RLS tidak bisa menegakkan "hanya
// yang tahu token" untuk caller yang bahkan tidak py sesi (lihat komentar
// lengkap di migration 0089). get_shared_dbr_simulation() adalah SECURITY
// DEFINER dan sudah di-GRANT EXECUTE ke `anon` (dikonfirmasi lewat query
// has_function_privilege langsung ke Supabase live).

import { withApiHandler } from "@/lib/api/handler";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const GET = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("get_shared_dbr_simulation", { p_share_token: ctx.params.token })
    .single();

  if (error) {
    throw new ApiError("NOT_FOUND", "Referensi share tidak valid, sudah dicabut, atau tidak ditemukan.");
  }
  if (!data) {
    throw new ApiError("NOT_FOUND", "Referensi share tidak valid, sudah dicabut, atau tidak ditemukan.");
  }

  return { data };
});
