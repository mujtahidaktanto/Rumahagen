// app/api/admin/platform-ai-connections/[code]/save-key/route.ts
// POST { api_key, model_id } -- validasi key, uji generate singkat dengan model terpilih, simpan
// terenkripsi (AES-256-GCM, lib/crypto/byok.ts -- BUKAN Vault, lihat migration 0174), auto-assign
// ke pengaturan fitur yang masih kosong, catat audit_logs. Superadmin-only.
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { savePlatformKeySchema } from "@/lib/validation/platform-ai";
import { autoAssignFeatureModel, loadPlatformProvider } from "@/lib/admin/platform-ai-connect";
import { AdapterCallError, type AdapterError } from "@/lib/ai/platform/types";
import { encryptApiKey } from "@/lib/crypto/byok";
import { logAuditEvent } from "@/lib/api/audit";
import { createClient } from "@/lib/supabase/server";

type SaveKeyResult = { ok: true; connection: { status: string; key_last4: string | null; latency_ms: number } } | { ok: false; error: AdapterError };

export const POST = withApiHandler<SaveKeyResult>({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);
  if (!ctx.userId) throw new ApiError("UNAUTHENTICATED", "Login diperlukan.");

  const body = await validateJsonBody(ctx.request, savePlatformKeySchema);
  const provider = await loadPlatformProvider(supabase, ctx.params.code ?? "");

  const { data: model, error: modelErr } = await supabase.from("ai_models").select("id, model_id").eq("id", body.model_id).eq("provider_id", provider.id).maybeSingle<{ id: string; model_id: string }>();
  if (modelErr) throw modelErr;
  if (!model) throw new ApiError("VALIDATION_ERROR", "Model yang dipilih tidak ditemukan untuk provider ini.");

  let latencyMs: number;
  try {
    await provider.adapter.validateKey(provider.baseUrl, body.api_key);
    const start = Date.now();
    await provider.adapter.generate(provider.baseUrl, body.api_key, model.model_id, { system: "Anda adalah asisten uji koneksi RumahAgen.", user: "Balas hanya: OK", maxOutputTokens: 16, temperature: 0 });
    latencyMs = Date.now() - start;
  } catch (e) {
    const err = e instanceof AdapterCallError ? e.toAdapterError() : { kind: "unknown" as const, message: "Terjadi kesalahan tak terduga saat menghubungi provider." };
    return { data: { ok: false, error: err } };
  }

  const encrypted = encryptApiKey(body.api_key);
  const keyLast4 = body.api_key.slice(-4);
  const now = new Date().toISOString();

  const { data: conn, error: upsertErr } = await supabase
    .from("platform_ai_connections")
    .upsert(
      { provider_id: provider.id, encrypted_api_key: encrypted, key_last4: keyLast4, status: "active", last_validated_at: now, last_error: null, connected_by: ctx.userId, updated_by: ctx.userId, updated_at: now },
      { onConflict: "provider_id" },
    )
    .select("id, status, key_last4")
    .single();
  if (upsertErr) throw upsertErr;

  await autoAssignFeatureModel(supabase, provider.id, model.id, ctx.userId);

  await logAuditEvent(ctx.userId, {
    p_action: "platform_ai.connect",
    p_entity_type: "platform_ai_connection",
    p_entity_id: conn.id,
    p_new_value: { provider_code: provider.code, key_last4: keyLast4, model_id: model.model_id },
  });

  return { data: { ok: true, connection: { status: conn.status, key_last4: conn.key_last4, latency_ms: latencyMs } } };
});
