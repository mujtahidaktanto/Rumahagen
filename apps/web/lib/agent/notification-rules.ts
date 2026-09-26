// lib/agent/notification-rules.ts — aturan tampilan Pusat Notifikasi (M08, wireframe 06-Bersama/M08-Pusat-Notifikasi), bersama semua persona. Murni tanpa I/O (diuji). Jenis dan status pengiriman mengikuti CHECK
// tabel notifications (0036): type = approval_status | event_reminder | listing_expiring | certificate_issued | lead_new | lainnya; delivery_status = pending | delivered | failed. Pengguna tidak bisa membuat
// notifikasi (dibuat pemicu database); hanya status dibaca dan disembunyikan yang bisa diubah, dan menyembunyikan tidak bisa dibatalkan lewat API.
import type { BadgeTone } from "@/components/ui/Badge";

export type NotificationArea = "agent" | "instructor" | "partner" | "admin";

export const NOTIFICATION_TYPE: Record<string, { label: string; tone: BadgeTone }> = {
  approval_status: { label: "Persetujuan", tone: "info" },
  event_reminder: { label: "Pengingat event", tone: "warning" },
  listing_expiring: { label: "Listing segera berakhir", tone: "warning" },
  certificate_issued: { label: "Sertifikat", tone: "success" },
  lead_new: { label: "Lead baru", tone: "info" },
  lainnya: { label: "Info", tone: "neutral" },
};
export const notificationType = (t: string) => NOTIFICATION_TYPE[t] ?? { label: t, tone: "neutral" as BadgeTone };

/** Tujuan tombol Kembali menurut persona (halaman utama areanya). */
export const AREA_HOME: Record<NotificationArea, string> = { agent: "/agent", instructor: "/instructor", partner: "/partner", admin: "/admin" };
export const notificationsPath = (area: NotificationArea) => `${AREA_HOME[area]}/notifikasi`;

export const NOTIFICATION_PAGE_SIZE = 20;
export type NotificationFilter = "semua" | "belum";
export type NotificationSearch = { filter: NotificationFilter; tampil: number; tersembunyi: boolean };

export function parseNotificationSearch(sp: Record<string, string | string[] | undefined>): NotificationSearch {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const n = Number(one("tampil"));
  return {
    filter: one("filter") === "belum" ? "belum" : "semua",
    tampil: Number.isInteger(n) && n >= NOTIFICATION_PAGE_SIZE && n <= 500 ? n : NOTIFICATION_PAGE_SIZE,
    tersembunyi: one("tersembunyi") === "1",
  };
}

/** Query string yang menjaga filter; hanya nilai bukan bawaan yang ditulis. */
export function notificationQuery(s: NotificationSearch, over: Partial<NotificationSearch> = {}): string {
  const m = { ...s, ...over };
  const q = new URLSearchParams();
  if (m.filter === "belum") q.set("filter", "belum");
  if (m.tampil > NOTIFICATION_PAGE_SIZE) q.set("tampil", String(m.tampil));
  if (m.tersembunyi) q.set("tersembunyi", "1");
  const str = q.toString();
  return str ? `?${str}` : "";
}
