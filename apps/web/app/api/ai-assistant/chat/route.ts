// app/api/ai-assistant/chat/route.ts
// POST /ai-assistant/chat (STEP11-B10 §4/§11 M13, evidenced/PRESERVE route).
// Ini invocation AI SUNGGUHAN pertama di repo ini -- dibedakan sengaja dari
// /ai-connections/{id}/test (yang HANYA validasi dekripsi kredensial, lihat
// komentarnya sendiri "TIDAK benar-benar memanggil API provider AI
// eksternal"). Di sinilah kredensial BYOK yang di-decrypt benar-benar
// dipakai memanggil provider (lib/ai/adapters.ts) -- biaya panggilan
// dibebankan ke akun provider MILIK AGENT SENDIRI (BYOK), bukan akun
// RumahAgen, konsisten dengan M14 TIDAK memiliki commercial truth atas
// AI invocation (STEP11-B10 §11/§14: "Commercial provider billing/quota →
// M14/external provider, bukan M13").
//
// OTORISASI: Core §11 mensyaratkan "AI invocation requires applicable
// feature permission + own valid/active connection" -- TIDAK ada permission
// code khusus "ai_invocation"/"chat" di seluruh katalog sumber (dicek
// query langsung ke public.permissions, kosong). "Applicable feature
// permission" dibaca sebagai tanggung jawab FITUR BISNIS spesifik yang
// nanti memanggil endpoint generik ini (mis. "AI bantu tulis deskripsi
// listing" akan py permission-nya sendiri di titik panggilnya) -- BUKAN
// sesuatu yang diciptakan di sini (D13-15: tidak ada permission dikarang).
// Endpoint generik ini sendiri menegakkan bagian KEDUA syarat itu: "own
// valid/active connection" -- lewat RLS agent_ai_connections_select
// (has_permission('m13.own_byok_connection.view', user_id), 0016) yang
// SUDAH otomatis membatasi hanya Superadmin+Developer Partner (satu-satunya
// role yang punya permission ini di seed 0009) yang bisa memiliki/melihat
// baris koneksi sama sekali -- lalu ditambah pengecekan status='active'
// eksplisit di bawah (Core Gate PRE-00-O §7-8: "AI DITOLAK selagi
// UNVERIFIED").

import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { aiChatSchema } from "@/lib/validation/ai-providers";
import { decryptApiKey } from "@/lib/crypto/byok";
import { resolveAdapter, AiProviderCallError } from "@/lib/ai/adapters";
import { ApiError } from "@/lib/api/errors";
import { createClient } from "@/lib/supabase/server";

export const POST = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  if (!ctx.userId) {
    throw new ApiError("UNAUTHENTICATED", "Login diperlukan untuk memakai AI assistant.");
  }

  const body = await validateJsonBody(ctx.request, aiChatSchema);
  const supabase = await createClient();

  const { data: connection, error: findErr } = await supabase
    .from("agent_ai_connections")
    .select("id, status, encrypted_api_key, ai_providers(code, status)")
    .eq("id", body.connection_id)
    .maybeSingle();

  if (findErr) {
    throw findErr;
  }
  if (!connection) {
    throw new ApiError("NOT_FOUND", "Koneksi AI tidak ditemukan atau Anda tidak punya akses.");
  }
  if (connection.status !== "active") {
    throw new ApiError(
      "CONFLICT",
      `Koneksi berstatus '${connection.status}' -- hanya koneksi 'active' (sudah lolos /ai-connections/{id}/test) yang boleh dipakai invocation.`,
    );
  }

  const provider = Array.isArray(connection.ai_providers) ? connection.ai_providers[0] : connection.ai_providers;
  if (!provider || provider.status !== "active") {
    throw new ApiError("CONFLICT", "Provider untuk koneksi ini sudah tidak aktif (retired/disabled).");
  }

  const adapter = resolveAdapter(provider.code);
  if (!adapter) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Provider '${provider.code}' belum didukung teknis untuk AI invocation (adapter belum tersedia).`,
    );
  }

  let apiKey: string;
  try {
    apiKey = decryptApiKey(connection.encrypted_api_key);
  } catch {
    throw new ApiError("CONFLICT", "Kredensial tersimpan tidak bisa didekripsi -- Agent perlu rotate koneksi.");
  }

  try {
    const result = await adapter({
      apiKey,
      model: body.model,
      maxTokens: body.max_tokens,
      messages: body.messages,
    });

    return {
      data: {
        connection_id: body.connection_id,
        provider_code: provider.code,
        model: result.model,
        reply: { role: "assistant", content: result.content },
      },
    };
  } catch (err) {
    if (err instanceof AiProviderCallError) {
      throw new ApiError("CONFLICT", `Provider ${err.providerCode} menolak permintaan: ${err.message}`);
    }
    throw err;
  }
});
