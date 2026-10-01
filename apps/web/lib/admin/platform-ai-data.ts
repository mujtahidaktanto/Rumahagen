// lib/admin/platform-ai-data.ts — data tab "Koneksi AI RumahAgen" (migration 0174, M13), SUPERADMIN-ONLY.
// Dibaca langsung dari Supabase dengan RLS pemanggil (ai_models_superadmin_all, platform_ai_connections_superadmin_all,
// platform_ai_feature_settings_superadmin_select) — non-superadmin mendapat baris kosong dari RLS, BUKAN galat; halaman
// yang memanggil fungsi ini WAJIB mengecek isSuperadmin dulu sebelum render (pola sama seperti tab Koneksi Agent di
// ai-provider-admin-data.ts) supaya tidak menampilkan "kosong" yang membingungkan untuk Admin/Manager biasa.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";
import type { AiBillingType } from "@/lib/agent/ai-rules";

export type PlatformModelTier = "hemat" | "seimbang" | "kualitas";
export type PlatformConnectionStatus = "unverified" | "active" | "invalid" | "disabled";

export type PlatformModelRow = {
  id: string;
  modelId: string;
  displayName: string;
  tier: PlatformModelTier;
  isDefault: boolean;
  isPreview: boolean;
  isFreeTier: boolean;
  status: "active" | "inactive";
};

export type PlatformConnectionInfo = {
  status: PlatformConnectionStatus;
  keyLast4: string | null;
  lastValidatedAt: string | null;
  lastError: string | null;
};

export type PlatformProviderRow = {
  id: string;
  code: string;
  displayName: string;
  billingType: AiBillingType;
  setupInstructionsUrl: string;
  usageTermsNote: string | null;
  apiStyle: string;
  keyPrefixHint: string | null;
  connection: PlatformConnectionInfo | null;
  models: PlatformModelRow[];
};

export type PlatformFeatureSettingRow = {
  featureCode: string;
  displayName: string;
  isEnabled: boolean;
  primaryModelId: string | null;
  fallbackModelId: string | null;
  temperature: number;
  maxOutputTokens: number;
  perUserDailyLimit: number;
  globalDailyLimit: number;
  monthlyBudgetUsd: number;
};

type ProviderRaw = {
  id: string;
  code: string;
  display_name: string;
  billing_type: AiBillingType;
  setup_instructions_url: string;
  usage_terms_note: string | null;
  api_style: string;
  key_prefix_hint: string | null;
  sort_order: number;
};
type ConnectionRaw = { provider_id: string; status: PlatformConnectionStatus; key_last4: string | null; last_validated_at: string | null; last_error: string | null };
type ModelRaw = { id: string; provider_id: string; model_id: string; display_name: string; tier: PlatformModelTier; is_default: boolean; is_preview: boolean; is_free_tier: boolean; status: "active" | "inactive"; sort_order: number };
type FeatureRaw = {
  feature_code: string;
  display_name: string;
  is_enabled: boolean;
  primary_model_id: string | null;
  fallback_model_id: string | null;
  temperature: number;
  max_output_tokens: number;
  per_user_daily_limit: number;
  global_daily_limit: number;
  monthly_budget_usd: number;
};

export async function getPlatformAiProviders(): Promise<Part<PlatformProviderRow[]>> {
  const supabase = await createClient();
  const [provRes, connRes, modelRes] = await Promise.all([
    supabase
      .from("ai_providers")
      .select("id, code, display_name, billing_type, setup_instructions_url, usage_terms_note, api_style, key_prefix_hint, sort_order")
      .eq("available_for_platform", true)
      .order("sort_order")
      .returns<ProviderRaw[]>(),
    supabase.from("platform_ai_connections").select("provider_id, status, key_last4, last_validated_at, last_error").returns<ConnectionRaw[]>(),
    supabase.from("ai_models").select("id, provider_id, model_id, display_name, tier, is_default, is_preview, is_free_tier, status, sort_order").order("sort_order").returns<ModelRaw[]>(),
  ]);
  if (provRes.error) return { ok: false };
  // RLS membuka ai_providers tanpa syarat superadmin (select_active_or_admin, 0015) tapi platform_ai_connections/ai_models
  // superadmin-only -- non-superadmin yang lolos sampai sini (seharusnya tidak, halaman sudah menjaga) akan melihat
  // connections/models kosong, bukan galat; biarkan provRes jadi acuan ok/tidaknya supaya daftar provider tetap tampil.
  const connByProvider = new Map((connRes.data ?? []).map((c) => [c.provider_id, c]));
  const modelsByProvider = new Map<string, PlatformModelRow[]>();
  for (const m of modelRes.data ?? []) {
    const row: PlatformModelRow = { id: m.id, modelId: m.model_id, displayName: m.display_name, tier: m.tier, isDefault: m.is_default, isPreview: m.is_preview, isFreeTier: m.is_free_tier, status: m.status };
    const list = modelsByProvider.get(m.provider_id) ?? [];
    list.push(row);
    modelsByProvider.set(m.provider_id, list);
  }

  return {
    ok: true,
    data: (provRes.data ?? []).map((p) => {
      const c = connByProvider.get(p.id);
      return {
        id: p.id,
        code: p.code,
        displayName: p.display_name,
        billingType: p.billing_type,
        setupInstructionsUrl: p.setup_instructions_url,
        usageTermsNote: p.usage_terms_note,
        apiStyle: p.api_style,
        keyPrefixHint: p.key_prefix_hint,
        connection: c ? { status: c.status, keyLast4: c.key_last4, lastValidatedAt: c.last_validated_at, lastError: c.last_error } : null,
        models: modelsByProvider.get(p.id) ?? [],
      };
    }),
  };
}

export async function getPlatformAiFeatureSettings(): Promise<Part<PlatformFeatureSettingRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platform_ai_feature_settings")
    .select("feature_code, display_name, is_enabled, primary_model_id, fallback_model_id, temperature, max_output_tokens, per_user_daily_limit, global_daily_limit, monthly_budget_usd")
    .order("feature_code")
    .returns<FeatureRaw[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((f) => ({
      featureCode: f.feature_code,
      displayName: f.display_name,
      isEnabled: f.is_enabled,
      primaryModelId: f.primary_model_id,
      fallbackModelId: f.fallback_model_id,
      temperature: Number(f.temperature),
      maxOutputTokens: f.max_output_tokens,
      perUserDailyLimit: f.per_user_daily_limit,
      globalDailyLimit: f.global_daily_limit,
      monthlyBudgetUsd: Number(f.monthly_budget_usd),
    })),
  };
}
