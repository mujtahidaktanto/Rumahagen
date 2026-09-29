// lib/admin/content-notif-data.ts — data Konten & Notifikasi (M09): tab Banner & Promosi (public_announcement_promotion, migration 0014/0028) dan Template Notifikasi (notification_templates, 0013,
// 6 tipe terkunci CHECK). Tab Konten Publik dan riwayat "Kirim Manual" TIDAK di sini — lihat catatan gap di audit/FRONTEND_GAPS.md (Konten Publik tidak punya route API sama sekali).
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
