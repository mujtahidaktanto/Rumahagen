// app/api/admin/platform-ai-feature-settings/[code]/route.ts
// PUT -- ubah pengaturan satu fitur (model utama/cadangan, batas, anggaran, aktif/nonaktif).
// Aturan konsistensi (docs/platform-ai-spec.md): model utama & cadangan tidak boleh sama, keduanya
// harus model aktif, dan fitur tidak bisa diaktifkan tanpa provider model utama yang terhubung.
// Superadmin-only (RLS platform_ai_feature_settings_superadmin_update menegakkan ulang di DB).
import { withApiHandler } from "@/lib/api/handler";
import { validateJsonBody } from "@/lib/api/validate";
import { requireSuperadmin } from "@/lib/api/require-superadmin";
import { ApiError } from "@/lib/api/errors";
import { updatePlatformFeatureSettingsSchema } from "@/lib/validation/platform-ai";
import { createClient } from "@/lib/supabase/server";

async function modelIsActive(supabase: Awaited<ReturnType<typeof createClient>>, modelId: string): Promise<{ active: boolean; providerId: string | null }> {
  const { data } = await supabase.from("ai_models").select("status, provider_id").eq("id", modelId).maybeSingle<{ status: string; provider_id: string }>();
  return { active: data?.status === "active", providerId: data?.provider_id ?? null };
}

export const PUT = withApiHandler({ requireIdempotencyKey: true }, async (ctx) => {
  const supabase = await createClient();
  await requireSuperadmin(supabase);
  const body = await validateJsonBody(ctx.request, updatePlatformFeatureSettingsSchema);

  if (body.primary_model_id && body.fallback_model_id && body.primary_model_id === body.fallback_model_id) {
    throw new ApiError("VALIDATION_ERROR", "Model cadangan tidak boleh sama dengan model utama.");
  }
  if (body.primary_model_id) {
    const m = await modelIsActive(supabase, body.primary_model_id);
    if (!m.active) throw new ApiError("VALIDATION_ERROR", "Model utama harus model yang berstatus aktif.");
  }
  if (body.fallback_model_id) {
    const m = await modelIsActive(supabase, body.fallback_model_id);
    if (!m.active) throw new ApiError("VALIDATION_ERROR", "Model cadangan harus model yang berstatus aktif.");
  }

  const { data: current, error: currentErr } = await supabase.from("platform_ai_feature_settings").select("primary_model_id").eq("feature_code", ctx.params.code).maybeSingle<{ primary_model_id: string | null }>();
  if (currentErr) throw currentErr;
  if (!current) throw new ApiError("NOT_FOUND", "Fitur tidak ditemukan.");

  if (body.is_enabled === true) {
    const primaryModelId = body.primary_model_id ?? current.primary_model_id;
    if (!primaryModelId) throw new ApiError("VALIDATION_ERROR", "Tidak bisa diaktifkan tanpa model utama.");
    const { providerId } = await modelIsActive(supabase, primaryModelId);
    const { data: conn } = providerId ? await supabase.from("platform_ai_connections").select("status").eq("provider_id", providerId).maybeSingle<{ status: string }>() : { data: null };
    if (!conn || conn.status !== "active") throw new ApiError("VALIDATION_ERROR", "Tidak bisa diaktifkan: provider model utama belum terhubung.");
  }

  const patch: Record<string, unknown> = { updated_by: ctx.userId, updated_at: new Date().toISOString() };
  if (body.is_enabled !== undefined) patch.is_enabled = body.is_enabled;
  if (body.primary_model_id !== undefined) patch.primary_model_id = body.primary_model_id;
  if (body.fallback_model_id !== undefined) patch.fallback_model_id = body.fallback_model_id;
  if (body.temperature !== undefined) patch.temperature = body.temperature;
  if (body.max_output_tokens !== undefined) patch.max_output_tokens = body.max_output_tokens;
  if (body.per_user_daily_limit !== undefined) patch.per_user_daily_limit = body.per_user_daily_limit;
  if (body.global_daily_limit !== undefined) patch.global_daily_limit = body.global_daily_limit;
  if (body.monthly_budget_usd !== undefined) patch.monthly_budget_usd = body.monthly_budget_usd;

  const { data, error } = await supabase.from("platform_ai_feature_settings").update(patch).eq("feature_code", ctx.params.code).select().maybeSingle();
  if (error) throw error;
  if (!data) throw new ApiError("NOT_FOUND", "Fitur tidak ditemukan.");

  return { data };
});
