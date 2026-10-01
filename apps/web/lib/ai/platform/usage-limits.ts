// lib/ai/platform/usage-limits.ts — batasan pemakaian AI (docs/ai-description-rules.md "Batasan,
// biaya, dan log"): ai_usage_logs adalah SUMBER KEBENARAN TUNGGAL untuk kuota/anggaran/laporan,
// dihitung ulang tiap permintaan (bukan counter terpisah yang bisa drift). Burst (5/menit) memakai
// rate_limit_log lewat RPC check_and_increment_rate_limit (migration 0095/0146, sama seperti
// lib/api/rate-limit.ts) dengan parameter window/batas sendiri dan key berprefiks "ai-burst:" --
// TIDAK memanggil checkRateLimit() langsung karena fungsi itu mengunci window/batas ke 60 req/menit
// (dipakai withApiHandler untuk SEMUA route), beda kebutuhan dari burst AI (5/menit).
import { createAdminClient } from "@/lib/supabase/admin";
import { monthRangeWIB, todayWIB } from "@/lib/agent/time";

export type UsageLimitReason = "per_user_daily" | "global_daily" | "budget" | "burst";
export type UsageLimitCheck = { ok: true } | { ok: false; reason: UsageLimitReason };

export type FeatureLimits = { perUserDailyLimit: number; globalDailyLimit: number; monthlyBudgetUsd: number };

/** per_user_daily_limit/global_daily_limit = 0 diperlakukan "tidak dibatasi" (docs "Catatan implementasi"). */
export async function checkUsageLimits(featureCode: string, userId: string, settings: FeatureLimits): Promise<UsageLimitCheck> {
  const burst = await checkBurstLimit(userId);
  if (!burst.ok) return { ok: false, reason: "burst" };

  const admin = createAdminClient();
  const today = todayWIB();
  const todayStart = `${today}T00:00:00+07:00`;

  if (settings.perUserDailyLimit > 0) {
    const { count } = await admin.from("ai_usage_logs").select("id", { count: "exact", head: true }).eq("feature_code", featureCode).eq("user_id", userId).in("status", ["success", "error"]).gte("created_at", todayStart);
    if ((count ?? 0) >= settings.perUserDailyLimit) return { ok: false, reason: "per_user_daily" };
  }
  if (settings.globalDailyLimit > 0) {
    const { count } = await admin.from("ai_usage_logs").select("id", { count: "exact", head: true }).eq("feature_code", featureCode).in("status", ["success", "error"]).gte("created_at", todayStart);
    if ((count ?? 0) >= settings.globalDailyLimit) return { ok: false, reason: "global_daily" };
  }
  if (settings.monthlyBudgetUsd > 0) {
    const { from: monthFrom } = monthRangeWIB();
    const { data } = await admin.from("ai_usage_logs").select("est_cost_usd").eq("feature_code", featureCode).gte("created_at", `${monthFrom}T00:00:00+07:00`);
    const total = (data ?? []).reduce((sum: number, r: { est_cost_usd: number | null }) => sum + (Number(r.est_cost_usd) || 0), 0);
    if (total >= settings.monthlyBudgetUsd) return { ok: false, reason: "budget" };
  }
  return { ok: true };
}

async function checkBurstLimit(userId: string): Promise<{ ok: boolean }> {
  const { data, error } = await createAdminClient().rpc("check_and_increment_rate_limit", { p_key: `ai-burst:${userId}`, p_window_ms: 60_000, p_max_requests: 5 });
  if (error) return { ok: true }; // galat cek burst tidak boleh mematikan fitur -- ini proteksi tambahan, bukan satu-satunya lapis.
  const row = Array.isArray(data) ? data[0] : data;
  return { ok: !!row?.allowed };
}

/** Sisa jatah hari ini milik user (untuk UI "Sisa N dari M hari ini") -- null = tidak dibatasi. */
export async function remainingToday(featureCode: string, userId: string, perUserDailyLimit: number): Promise<number | null> {
  if (perUserDailyLimit <= 0) return null;
  const admin = createAdminClient();
  const today = todayWIB();
  const { count } = await admin.from("ai_usage_logs").select("id", { count: "exact", head: true }).eq("feature_code", featureCode).eq("user_id", userId).in("status", ["success", "error"]).gte("created_at", `${today}T00:00:00+07:00`);
  return Math.max(0, perUserDailyLimit - (count ?? 0));
}

export type LogUsageParams = {
  featureCode: string;
  userId: string | null;
  providerCode: string;
  modelId: string;
  entityType: "listing" | "developer_project" | null;
  entityId: string | null;
  wasFallback: boolean;
  status: "success" | "error" | "blocked";
  errorCode?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  estCostUsd?: number | null;
  latencyMs?: number | null;
  flags?: string[];
};

/** Ditulis HANYA lewat admin client (lihat comment tabel di migration 0174) -- sesi pengguna biasa tidak boleh menulis baris ini sendiri. */
export async function logAiUsage(p: LogUsageParams): Promise<void> {
  await createAdminClient()
    .from("ai_usage_logs")
    .insert({
      feature_code: p.featureCode,
      source: "platform",
      user_id: p.userId,
      provider_code: p.providerCode,
      model_id: p.modelId,
      entity_type: p.entityType,
      entity_id: p.entityId,
      was_fallback: p.wasFallback,
      status: p.status,
      error_code: p.errorCode ?? null,
      input_tokens: p.inputTokens ?? null,
      output_tokens: p.outputTokens ?? null,
      est_cost_usd: p.estCostUsd ?? null,
      latency_ms: p.latencyMs ?? null,
      flags: p.flags ?? [],
    });
}

export function estimateCostUsd(inputTokens: number | null, outputTokens: number | null, inputPricePerMtok: number | null, outputPricePerMtok: number | null): number | null {
  if (inputPricePerMtok === null || outputPricePerMtok === null || inputTokens === null || outputTokens === null) return null;
  return (inputTokens * inputPricePerMtok + outputTokens * outputPricePerMtok) / 1_000_000;
}
