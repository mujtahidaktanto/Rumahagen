// lib/admin/platform-ai-connect.ts — logika server-only Koneksi AI Platform (migration 0174):
// resolve provider+adapter dari kode, auto-assign model ke pengaturan fitur saat key pertama
// disimpan, dan "demote" pengaturan fitur saat provider diputus. Dipanggil HANYA dari route
// app/api/admin/platform-ai-connections/* -- bukan dari komponen klien.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import { resolvePlatformAdapter, type ProviderAdapter } from "@/lib/ai/platform/resolve";

export type PlatformProvider = { id: string; code: string; baseUrl: string; adapter: ProviderAdapter };

export async function loadPlatformProvider(supabase: SupabaseClient, code: string): Promise<PlatformProvider> {
  const { data, error } = await supabase
    .from("ai_providers")
    .select("id, code, api_style, base_url, status, available_for_platform")
    .eq("code", code)
    .maybeSingle<{ id: string; code: string; api_style: string; base_url: string | null; status: string; available_for_platform: boolean }>();
  if (error) throw error;
  if (!data || !data.available_for_platform || data.status !== "active" || !data.base_url) {
    throw new ApiError("NOT_FOUND", "Provider AI platform tidak ditemukan atau tidak aktif.");
  }
  const adapter = resolvePlatformAdapter(data.api_style);
  if (!adapter) throw new ApiError("VALIDATION_ERROR", "Provider ini tidak punya gaya API yang dikenali untuk Koneksi AI Platform.");
  return { id: data.id, code: data.code, baseUrl: data.base_url, adapter };
}

type FeatureRow = { feature_code: string; primary_model_id: string | null; fallback_model_id: string | null };

async function providerIdOfModel(supabase: SupabaseClient, modelId: string): Promise<string | null> {
  const { data } = await supabase.from("ai_models").select("provider_id").eq("id", modelId).maybeSingle<{ provider_id: string }>();
  return data?.provider_id ?? null;
}

async function connectionStatusOfProvider(supabase: SupabaseClient, providerId: string): Promise<string | null> {
  const { data } = await supabase.from("platform_ai_connections").select("status").eq("provider_id", providerId).maybeSingle<{ status: string }>();
  return data?.status ?? null;
}

/**
 * Dipanggil setelah save-key berhasil. "Supaya superadmin cukup memasukkan key": untuk tiap fitur
 * yang primary_model_id-nya kosong ATAU menunjuk provider yang koneksinya tidak aktif lagi, isi
 * dengan model yang baru disimpan dan aktifkan. Kalau primary sudah aktif dari provider LAIN dan
 * fallback masih kosong, isi fallback dengan model default provider baru ini.
 */
export async function autoAssignFeatureModel(supabase: SupabaseClient, providerId: string, chosenModelId: string, actorId: string | null): Promise<void> {
  const { data: features } = await supabase.from("platform_ai_feature_settings").select("feature_code, primary_model_id, fallback_model_id").returns<FeatureRow[]>();
  if (!features) return;
  const now = new Date().toISOString();

  for (const f of features) {
    let primaryNeedsReplace = !f.primary_model_id;
    if (!primaryNeedsReplace && f.primary_model_id) {
      const primaryProviderId = await providerIdOfModel(supabase, f.primary_model_id);
      const status = primaryProviderId ? await connectionStatusOfProvider(supabase, primaryProviderId) : null;
      if (!primaryProviderId || status !== "active") primaryNeedsReplace = true;
    }

    if (primaryNeedsReplace) {
      await supabase.from("platform_ai_feature_settings").update({ primary_model_id: chosenModelId, is_enabled: true, updated_by: actorId, updated_at: now }).eq("feature_code", f.feature_code);
      continue;
    }

    if (!f.fallback_model_id && f.primary_model_id) {
      const primaryProviderId = await providerIdOfModel(supabase, f.primary_model_id);
      if (primaryProviderId && primaryProviderId !== providerId) {
        const { data: def } = await supabase.from("ai_models").select("id").eq("provider_id", providerId).eq("is_default", true).maybeSingle<{ id: string }>();
        if (def) await supabase.from("platform_ai_feature_settings").update({ fallback_model_id: def.id, updated_by: actorId, updated_at: now }).eq("feature_code", f.feature_code);
      }
    }
  }
}

/**
 * Dipanggil setelah disconnect. Fitur yang memakai provider ini sebagai utama: cadangan naik jadi
 * utama (bila ada) atau fitur dinonaktifkan (bila tidak ada cadangan). Fitur yang memakai provider
 * ini hanya sebagai cadangan: cadangan dikosongkan saja, utama tidak disentuh.
 */
export async function demoteFeatureModel(supabase: SupabaseClient, providerId: string, actorId: string | null): Promise<void> {
  const { data: features } = await supabase.from("platform_ai_feature_settings").select("feature_code, primary_model_id, fallback_model_id").returns<FeatureRow[]>();
  if (!features) return;
  const now = new Date().toISOString();

  for (const f of features) {
    const primaryProviderId = f.primary_model_id ? await providerIdOfModel(supabase, f.primary_model_id) : null;
    if (primaryProviderId === providerId) {
      if (f.fallback_model_id) {
        await supabase.from("platform_ai_feature_settings").update({ primary_model_id: f.fallback_model_id, fallback_model_id: null, updated_by: actorId, updated_at: now }).eq("feature_code", f.feature_code);
      } else {
        await supabase.from("platform_ai_feature_settings").update({ is_enabled: false, updated_by: actorId, updated_at: now }).eq("feature_code", f.feature_code);
      }
      continue;
    }
    const fallbackProviderId = f.fallback_model_id ? await providerIdOfModel(supabase, f.fallback_model_id) : null;
    if (fallbackProviderId === providerId) {
      await supabase.from("platform_ai_feature_settings").update({ fallback_model_id: null, updated_by: actorId, updated_at: now }).eq("feature_code", f.feature_code);
    }
  }
}
