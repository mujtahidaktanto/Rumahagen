// lib/ai/platform/generate-context.ts — persiapan BERSAMA untuk /ai/generate-description dan
// /ai/generate-meta-seo: otorisasi (pemilik listing/project), resolusi nama wilayah/fasilitas/
// pemilik (ID -> nama di server, TIDAK PERNAH dipercaya dari klien), dan pengaturan fitur aktif.
import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiError } from "@/lib/api/errors";
import { createAdminClient } from "@/lib/supabase/admin";
import type { GenerateDescriptionInput } from "@/lib/validation/ai-generate";

export type FeatureSettingsRow = {
  featureCode: string;
  isEnabled: boolean;
  primaryModelId: string | null;
  fallbackModelId: string | null;
  temperature: number;
  maxOutputTokens: number;
  footerTemplate: string | null;
  promptVersion: string;
  perUserDailyLimit: number;
  globalDailyLimit: number;
  monthlyBudgetUsd: number;
};

/** Pastikan pemanggil berhak membuat/mengubah listing atau project ini -- kode izin SAMA PERSIS yang dipakai RLS listings/developer_projects (0018/0034), dicek eksplisit di sini karena rute ini TIDAK menulis ke tabel itu (RLS tidak otomatis menegakkan apa pun). */
export async function authorizeEntity(supabase: SupabaseClient, userId: string, entityType: "listing" | "developer_project", entityId: string | null | undefined): Promise<void> {
  if (entityType === "listing") {
    let ownerId = userId;
    let action = "m03.listing.create";
    if (entityId) {
      const { data } = await supabase.from("listings").select("agent_id").eq("id", entityId).maybeSingle<{ agent_id: string }>();
      if (!data) throw new ApiError("NOT_FOUND", "Listing tidak ditemukan.");
      ownerId = data.agent_id;
      action = "m03.listing.update";
    }
    const { data: allowed, error } = await supabase.rpc("has_permission", { p_action_code: action, p_owner_id: ownerId });
    if (error) throw error;
    if (!allowed) throw new ApiError("FORBIDDEN", "Anda tidak berhak membuat draf deskripsi untuk listing ini.");
    return;
  }

  let ownerId = userId;
  if (entityId) {
    const { data } = await supabase.from("developer_projects").select("developer_id, developer_partners(user_id)").eq("id", entityId).maybeSingle<{ developer_id: string; developer_partners: { user_id: string | null } | { user_id: string | null }[] | null }>();
    if (!data) throw new ApiError("NOT_FOUND", "Project tidak ditemukan.");
    const dp = Array.isArray(data.developer_partners) ? data.developer_partners[0] : data.developer_partners;
    ownerId = dp?.user_id ?? userId;
  }
  const { data: allowed, error } = await supabase.rpc("has_permission", { p_action_code: "m06.developer_project.manage", p_owner_id: ownerId });
  if (error) throw error;
  if (!allowed) throw new ApiError("FORBIDDEN", "Anda tidak berhak membuat draf deskripsi untuk project ini.");
}

export type ResolvedNames = { provinceName: string | null; cityName: string | null; districtName: string | null; amenityNames: string[]; ownerName: string | null; developerId: string | null };

export async function resolveNames(userId: string, entityType: "listing" | "developer_project", fields: GenerateDescriptionInput["fields"]): Promise<ResolvedNames> {
  const admin = createAdminClient();
  const [province, city, district] = await Promise.all([
    fields.province_id ? admin.from("ref_provinces").select("name").eq("id", fields.province_id).maybeSingle<{ name: string }>() : Promise.resolve({ data: null }),
    fields.city_id ? admin.from("ref_cities").select("name").eq("id", fields.city_id).maybeSingle<{ name: string }>() : Promise.resolve({ data: null }),
    fields.district_id ? admin.from("ref_districts").select("name").eq("id", fields.district_id).maybeSingle<{ name: string }>() : Promise.resolve({ data: null }),
  ]);

  let amenityNames: string[] = [];
  if (entityType === "listing" && fields.amenity_ids && fields.amenity_ids.length > 0) {
    const { data } = await admin.from("amenities").select("name").in("id", fields.amenity_ids).returns<{ name: string }[]>();
    amenityNames = (data ?? []).map((a) => a.name);
  }

  let ownerName: string | null = null;
  let developerId: string | null = null;
  if (entityType === "listing") {
    const { data } = await admin.from("agent_profiles").select("full_name").eq("user_id", userId).maybeSingle<{ full_name: string }>();
    ownerName = data?.full_name ?? null;
  } else {
    const { data } = await admin.from("developer_partners").select("id, company_name").eq("user_id", userId).maybeSingle<{ id: string; company_name: string }>();
    ownerName = data?.company_name ?? null;
    developerId = data?.id ?? null;
  }

  return { provinceName: province.data?.name ?? null, cityName: city.data?.name ?? null, districtName: district.data?.name ?? null, amenityNames, ownerName, developerId };
}

export async function loadFeatureSettings(featureCode: "listing_description" | "project_description" | "meta_seo"): Promise<FeatureSettingsRow | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("platform_ai_feature_settings")
    .select("feature_code, is_enabled, primary_model_id, fallback_model_id, temperature, max_output_tokens, footer_template, prompt_version, per_user_daily_limit, global_daily_limit, monthly_budget_usd")
    .eq("feature_code", featureCode)
    .maybeSingle<{
      feature_code: string;
      is_enabled: boolean;
      primary_model_id: string | null;
      fallback_model_id: string | null;
      temperature: number;
      max_output_tokens: number;
      footer_template: string | null;
      prompt_version: string;
      per_user_daily_limit: number;
      global_daily_limit: number;
      monthly_budget_usd: number;
    }>();
  if (!data) return null;
  return {
    featureCode: data.feature_code,
    isEnabled: data.is_enabled,
    primaryModelId: data.primary_model_id,
    fallbackModelId: data.fallback_model_id,
    temperature: Number(data.temperature),
    maxOutputTokens: data.max_output_tokens,
    footerTemplate: data.footer_template,
    promptVersion: data.prompt_version,
    perUserDailyLimit: data.per_user_daily_limit,
    globalDailyLimit: data.global_daily_limit,
    monthlyBudgetUsd: Number(data.monthly_budget_usd),
  };
}

export type ResolvedModel = { modelId: string; modelDbId: string; providerCode: string; apiStyle: string; baseUrl: string; encryptedApiKey: string; inputPricePerMtok: number | null; outputPricePerMtok: number | null };

/** Model + koneksi provider siap panggil (key sudah terenkripsi, didekripsi oleh pemanggil saat benar-benar memanggil provider). null = model tidak ada atau providernya tidak terhubung aktif. */
export async function resolveModelConnection(modelDbId: string | null): Promise<ResolvedModel | null> {
  if (!modelDbId) return null;
  const admin = createAdminClient();
  const { data: model } = await admin.from("ai_models").select("id, model_id, provider_id, status, input_price_per_mtok_usd, output_price_per_mtok_usd").eq("id", modelDbId).maybeSingle<{ id: string; model_id: string; provider_id: string; status: string; input_price_per_mtok_usd: number | null; output_price_per_mtok_usd: number | null }>();
  if (!model || model.status !== "active") return null;
  const { data: provider } = await admin.from("ai_providers").select("code, api_style, base_url").eq("id", model.provider_id).maybeSingle<{ code: string; api_style: string; base_url: string | null }>();
  if (!provider || !provider.base_url) return null;
  const { data: conn } = await admin.from("platform_ai_connections").select("encrypted_api_key, status").eq("provider_id", model.provider_id).maybeSingle<{ encrypted_api_key: string | null; status: string }>();
  if (!conn || conn.status !== "active" || !conn.encrypted_api_key) return null;
  return {
    modelId: model.model_id,
    modelDbId: model.id,
    providerCode: provider.code,
    apiStyle: provider.api_style,
    baseUrl: provider.base_url,
    encryptedApiKey: conn.encrypted_api_key,
    inputPricePerMtok: model.input_price_per_mtok_usd !== null ? Number(model.input_price_per_mtok_usd) : null,
    outputPricePerMtok: model.output_price_per_mtok_usd !== null ? Number(model.output_price_per_mtok_usd) : null,
  };
}
