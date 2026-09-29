// lib/admin/content-notif-rules.ts — aturan murni Konten & Notifikasi (M09, wireframe 02-Admin/M09-Konten-Notifikasi): label status banner (CHECK public_announcement_promotion.status, migration
// 0014/0028) dan validasi Kirim Notifikasi Manual. Jenis notifikasi (approval_status dst.) memakai NOTIFICATION_TYPE dari lib/agent/notification-rules.ts — satu sumber label untuk keduanya.
import type { BadgeTone } from "@/components/ui/Badge";

export const BANNER_STATUS: Record<string, { label: string; tone: BadgeTone }> = {
  draft: { label: "Draf", tone: "neutral" },
  scheduled: { label: "Terjadwal", tone: "info" },
  active: { label: "Aktif", tone: "success" },
  expired: { label: "Kedaluwarsa", tone: "neutral" },
  archived: { label: "Diarsipkan", tone: "neutral" },
};
export const bannerStatus = (s: string) => BANNER_STATUS[s] ?? { label: s, tone: "neutral" as BadgeTone };

export type SendNotificationForm = { userId: string; type: string; title: string; message: string };
export type SendNotificationErrors = Partial<Record<"userId" | "type", string>>;

export function validateSendNotification(f: SendNotificationForm): SendNotificationErrors {
  const errors: SendNotificationErrors = {};
  if (!f.userId) errors.userId = "Pilih akun tujuan.";
  if (!f.type) errors.type = "Pilih tipe notifikasi.";
  return errors;
}
