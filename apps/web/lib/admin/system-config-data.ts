// lib/admin/system-config-data.ts — data Konfigurasi Sistem (M09, wireframe 02-Admin/M09-Konfigurasi-Sistem): tab System Config (system_configs key-value generik, migration 0011) dan tab SEO
// Config (seo_config baris tunggal, migration 0097). Kuota Listing dibaca dari daftar System Config yang sama (7 kunci listing_quota.*, lib/admin/system-config-rules.ts), bukan tabel terpisah.
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type SystemConfigRow = { key: string; value: string | null; updatedAt: string };

export async function getSystemConfigs(): Promise<Part<SystemConfigRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("system_configs").select("config_key, config_value, updated_at").order("config_key").returns<{ config_key: string; config_value: string | null; updated_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((r) => ({ key: r.config_key, value: r.config_value, updatedAt: r.updated_at })) };
}

export type SeoConfig = {
  siteTitleSuffix: string | null;
  defaultMetaDescription: string | null;
  defaultOgImageUrl: string | null;
  robotsGlobalNoindex: boolean;
  sitemapEnabled: boolean;
  lastReindexRequestedAt: string | null;
  lastReindexRequestedBy: string | null;
};

export async function getSeoConfig(): Promise<Part<SeoConfig | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("seo_config")
    .select("site_title_suffix, default_meta_description, default_og_image_url, robots_global_noindex, sitemap_enabled, last_reindex_requested_at, last_reindex_requested_by")
    .limit(1)
    .maybeSingle<{ site_title_suffix: string | null; default_meta_description: string | null; default_og_image_url: string | null; robots_global_noindex: boolean; sitemap_enabled: boolean; last_reindex_requested_at: string | null; last_reindex_requested_by: string | null }>();
  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  return {
    ok: true,
    data: {
      siteTitleSuffix: data.site_title_suffix,
      defaultMetaDescription: data.default_meta_description,
      defaultOgImageUrl: data.default_og_image_url,
      robotsGlobalNoindex: data.robots_global_noindex,
      sitemapEnabled: data.sitemap_enabled,
      lastReindexRequestedAt: data.last_reindex_requested_at,
      lastReindexRequestedBy: data.last_reindex_requested_by,
    },
  };
}
