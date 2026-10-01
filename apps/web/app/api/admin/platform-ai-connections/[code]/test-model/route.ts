// app/api/admin/platform-ai-connections/[code]/test-model/route.ts
// POST { model_id } -- uji ulang model tertentu pakai key yang SUDAH tersimpan (tanpa perlu
// menempel ulang key). Dipakai dari tabel "Pemakaian per Fitur" untuk memastikan model yang baru
// dipilih benar-benar bisa dipakai sebelum diaktifkan. Superadmin-only.
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { testPlatformModelSchema } from "@/lib/validation/platform-ai";
import { loadPlatformProvider } from "@/lib/admin/platform-ai-connect";
import { AdapterCallError, type AdapterError } from "@/lib/ai/platform/types";
import { decryptApiKey } from "@/lib/crypto/byok";
import { createClient } from "@/lib/supabase/server";

type TestModelResult = { ok: true; latency_ms: number } | { ok: false; error: AdapterError };

export const POST = withApiHandler<TestModelResult>({}, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);
  const body = await validateJsonBody(ctx.request, testPlatformModelSchema);
  const provider = await loadPlatformProvider(supabase, ctx.params.code ?? "");

  const { data: conn, error: connErr } = await supabase
    .from("platform_ai_connections")
    .select("encrypted_api_key, status")
    .eq("provider_id", provider.id)
    .maybeSingle<{ encrypted_api_key: string | null; status: string }>();
  if (connErr) throw connErr;
  if (!conn || !conn.encrypted_api_key || conn.status !== "active") {
    throw new ApiError("CONFLICT", "Provider ini belum terhubung. Hubungkan dulu sebelum menguji model.");
  }

  const { data: model, error: modelErr } = await supabase.from("ai_models").select("model_id").eq("id", body.model_id).eq("provider_id", provider.id).maybeSingle<{ model_id: string }>();
  if (modelErr) throw modelErr;
  if (!model) throw new ApiError("VALIDATION_ERROR", "Model tidak ditemukan untuk provider ini.");

  const apiKey = decryptApiKey(conn.encrypted_api_key);
  try {
    const start = Date.now();
    await provider.adapter.generate(provider.baseUrl, apiKey, model.model_id, { system: "Anda adalah asisten uji koneksi RumahAgen.", user: "Balas hanya: OK", maxOutputTokens: 16, temperature: 0 });
    return { data: { ok: true, latency_ms: Date.now() - start } };
  } catch (e) {
    const err = e instanceof AdapterCallError ? e.toAdapterError() : { kind: "unknown" as const, message: "Terjadi kesalahan tak terduga saat menghubungi provider." };
    return { data: { ok: false, error: err } };
  }
});
