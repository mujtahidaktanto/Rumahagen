// lib/agent/listing-quota.ts — logika tampilan kuota penerbitan listing (M03 x M14, migration 0140/0141), murni tanpa I/O agar bisa diuji. Angka dari RPC listing_quota_summary (lihat
// ListingQuotaSummary); urutan pemakaian Gratis -> Pro -> Slot beli. Teks mengikuti wireframe 01-Agent/M03-Listing-Saya.
import type { ListingQuotaSummary } from "@/lib/validation/listing-quota";
import { formatDate } from "@/lib/format";

export type QuotaLevel = "tersedia" | "hampir_habis" | "penuh";
export const LOW_QUOTA_THRESHOLD = 3;

export function quotaLevel(totalRemaining: number): QuotaLevel {
  if (totalRemaining <= 0) return "penuh";
  return totalRemaining <= LOW_QUOTA_THRESHOLD ? "hampir_habis" : "tersedia";
}

export function bucketPercent(used: number, limit: number): number {
  return limit > 0 ? Math.min(100, Math.max(0, Math.round((used / limit) * 100))) : 0;
}

/** Warna bilah: habis = danger, tinggal <= 3 = warning, selain itu biru. */
export function bucketTone(used: number, limit: number): "danger" | "warning" | "blue" {
  if (limit > 0 && used >= limit) return "danger";
  return limit - used <= LOW_QUOTA_THRESHOLD ? "warning" : "blue";
}

/** "1 Okt 2026 00:00 WIB" (zona Asia/Jakarta). Kosong/tidak valid -> "". */
export function formatResetWIB(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(d);
  const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Asia/Jakarta" }).format(d).replace(".", ":");
  return `${date} ${time} WIB`;
}

export function quotaTotalLine(q: ListingQuotaSummary): string {
  return `${q.total_remaining} jatah tersisa`;
}

export function quotaValidityLine(q: ListingQuotaSummary): string {
  return `Tiap listing terbit memakai 1 jatah: tayang ${q.validity_days} hari + ${q.grace_days} hari masa tenggang, lalu kembali ke draf.`;
}

export type SlotWindow = { validUntil: string | null; graceUntil: string | null };

/**
 * Catatan kuota per listing di daftar: published -> sisa masa tayang atau masa tenggang; draft -> "memakai 1 jatah saat terbit" atau "kuota habis". Status lain tanpa catatan.
 * Hari dihitung pembulatan ke atas dari selisih waktu.
 */
export function listingQuotaNote(l: { status: string }, slot: SlotWindow | null, quotaFull: boolean, now: Date = new Date()): { text: string; tone: "normal" | "warn" | "danger" } | null {
  if (l.status === "draft") {
    return quotaFull ? { text: "Kuota habis — belum bisa diterbitkan", tone: "danger" } : { text: "Belum terbit — memakai 1 jatah saat terbit", tone: "normal" };
  }
  if (l.status !== "published" || !slot?.validUntil) return null;
  const until = new Date(slot.validUntil).getTime();
  if (now.getTime() <= until) {
    const days = Math.ceil((until - now.getTime()) / 86_400_000);
    return { text: `Tayang sampai ${formatDate(slot.validUntil)} · ${days} hari lagi`, tone: "normal" };
  }
  if (slot.graceUntil && now.getTime() <= new Date(slot.graceUntil).getTime()) {
    return { text: `Masa tenggang sampai ${formatDate(slot.graceUntil)} — tetap tampil, lalu kembali ke draf`, tone: "warn" };
  }
  return null;
}
