// app/api/ai-connections/[id]/test/route.ts
// POST /ai-connections/{id}/test (evidenced, STEP11-B10 §4 M13).
//
// SCOPE: endpoint ini memvalidasi & mencatat `last_validated_at` bahwa
// koneksi ADA, dimiliki pemanggil, dan berstatus 'active' — TIDAK benar-benar
// memanggil API provider AI eksternal (OpenAI/dst.) untuk verifikasi
// kredensial nyata. Memanggil provider sungguhan butuh adapter per-provider
// (payload/response provider-specific, di luar skema DB manapun — STEP11-B10
// §3 eksplisit: "Provider-specific payloads remain adapter/provider-internal"),
// kunci API asli (yang di-decrypt di sini HANYA untuk dipakai lokal, tidak
// pernah dikirim balik ke client), dan potensi biaya/efek samping nyata ke
// akun pihak ketiga milik Agent — tidak diasumsikan/dikarang di batch ini.

import { withApiHandler } from "@/lib/api/handler";
import { decryptApiKey } from "@/lib/crypto/byok";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({}, async (ctx) => {
  const supabase = await createClient();
  const { data: connection, error: findErr } = await supabase
    .from("agent_ai_connections")
    .select("id, encrypted_api_key, status")
    .eq("id", ctx.params.id)
    .maybeSingle();

  if (findErr) {
    throw findErr;
  }
  if (!connection) {
    throw new ApiError("NOT_FOUND", "Koneksi AI tidak ditemukan atau Anda tidak punya akses.");
  }
  if (connection.status !== "active") {
    throw new ApiError("CONFLICT", `Koneksi berstatus '${connection.status}', hanya koneksi 'active' yang bisa diuji.`);
  }

  // Pastikan encrypted_api_key benar-benar bisa didekripsi (mis. mendeteksi
  // BYOK_ENCRYPTION_KEY yang salah/berubah) — ini validasi INTEGRITAS
  // penyimpanan, bukan validasi kredensial ke provider eksternal.
  try {
    decryptApiKey(connection.encrypted_api_key);
  } catch {
    throw new ApiError("CONFLICT", "encrypted_api_key tidak bisa didekripsi (kemungkinan BYOK_ENCRYPTION_KEY berubah) — Agent perlu rotate koneksi.");
  }

  const { data, error } = await supabase
    .from("agent_ai_connections")
    .update({ last_validated_at: new Date().toISOString() })
    .eq("id", ctx.params.id)
    .select("id, user_id, provider_id, status, disabled_by_admin, last_validated_at, connected_at, created_at, updated_at")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return { data };
});
