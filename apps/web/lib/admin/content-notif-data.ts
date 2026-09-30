// lib/admin/content-notif-data.ts — data Konten & Notifikasi (M09): tab Banner & Promosi (public_announcement_promotion, migration 0014/0028), Template Notifikasi (notification_templates, 0013,
// 6 tipe terkunci CHECK), dan Konten Publik (static_public_content, migration 0037 — route /api/admin/static-content dibuat 2026-09-30, sebelumnya tidak ada sama sekali). Riwayat "Kirim Manual"
// tetap TIDAK di sini (tidak ada tabel riwayat notifikasi manual terpisah dari notifications pribadi penerima).
import { createClient } from "@/lib/supabase/server";
import type { Part } from "@/lib/agent/dashboard-data";

export type BannerRow = {
  id: string;
  title: string;
  content: string | null;
  imageReference: string | null;
  ctaReference: string | null;
  campaignReference: string | null;
  priority: number;
  scheduleAt: string | null;
  expiresAt: string | null;
  status: string;
};

const BANNER_SELECT = "id, title, content, image_reference, cta_reference, campaign_reference, priority, schedule_at, expires_at, status";

export async function getBanners(): Promise<Part<BannerRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("public_announcement_promotion")
    .select(BANNER_SELECT)
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; title: string; content: string | null; image_reference: string | null; cta_reference: string | null; campaign_reference: string | null; priority: number; schedule_at: string | null; expires_at: string | null; status: string }[]>();
  if (error) return { ok: false };
  return {
    ok: true,
    data: (data ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      content: b.content,
      imageReference: b.image_reference,
      ctaReference: b.cta_reference,
      campaignReference: b.campaign_reference,
      priority: b.priority,
      scheduleAt: b.schedule_at,
      expiresAt: b.expires_at,
      status: b.status,
    })),
  };
}

export type NotificationTemplateRow = { type: string; titleTemplate: string; messageTemplate: string; isActive: boolean };

export async function getNotificationTemplates(): Promise<Part<NotificationTemplateRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notification_templates")
    .select("type, title_template, message_template, is_active")
    .order("type")
    .returns<{ type: string; title_template: string; message_template: string; is_active: boolean }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((t) => ({ type: t.type, titleTemplate: t.title_template, messageTemplate: t.message_template, isActive: t.is_active })) };
}

export type StaticContentRow = { id: string; title: string; slug: string; status: string; updatedAt: string };

const STATIC_CONTENT_LIST_SELECT = "id, title, slug, status, updated_at";

export async function getStaticContentList(): Promise<Part<StaticContentRow[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("static_public_content")
    .select(STATIC_CONTENT_LIST_SELECT)
    .order("updated_at", { ascending: false })
    .limit(200)
    .returns<{ id: string; title: string; slug: string; status: string; updated_at: string }[]>();
  if (error) return { ok: false };
  return { ok: true, data: (data ?? []).map((r) => ({ id: r.id, title: r.title, slug: r.slug, status: r.status, updatedAt: r.updated_at })) };
}

export type StaticContentDetail = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  indexability: string;
  sitemapParticipation: boolean;
  status: string;
  publishedAt: string | null;
};

export async function getStaticContentById(id: string): Promise<Part<StaticContentDetail | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("static_public_content")
    .select("id, title, slug, content, meta_title, meta_description, canonical_url, indexability, sitemap_participation, status, published_at")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      title: string;
      slug: string;
      content: string | null;
      meta_title: string | null;
      meta_description: string | null;
      canonical_url: string | null;
      indexability: string;
      sitemap_participation: boolean;
      status: string;
      published_at: string | null;
    }>();
  if (error) return { ok: false };
  if (!data) return { ok: true, data: null };
  return {
    ok: true,
    data: {
      id: data.id,
      title: data.title,
      slug: data.slug,
      content: data.content,
      metaTitle: data.meta_title,
      metaDescription: data.meta_description,
      canonicalUrl: data.canonical_url,
      indexability: data.indexability,
      sitemapParticipation: data.sitemap_participation,
      status: data.status,
      publishedAt: data.published_at,
    },
  };
}
