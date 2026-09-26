// lib/agent/listing-rules.ts — aturan tampilan/aksi Detail Listing Agent, murni tanpa I/O (diuji). Sumber aturan: wireframe 01-Agent/M03-Listing-Detail dan trigger lifecycle di database
// (server tetap penentu akhir): draft -> published memakai kuota; hanya published yang bisa di-refresh/ditandai terjual/tersewa; refresh maksimal 1x per listing per hari WIB dan
// dibatasi kuota harian agen.
import { todayWIB } from "./time";
import type { RefreshQuota } from "./listing-detail-data";

export const LEAD_STATUS: Record<string, { label: string; tone: "info" | "warning" | "success" | "neutral" }> = {
  new: { label: "Baru", tone: "info" },
  contacted: { label: "Dihubungi", tone: "warning" },
  converted: { label: "Konversi", tone: "success" },
  lost: { label: "Batal", tone: "neutral" },
};
export const LEAD_SOURCE_LABEL: Record<string, string> = { whatsapp_cta: "WhatsApp — dari halaman listing" };
export const leadSourceLabel = (s: string) => LEAD_SOURCE_LABEL[s] ?? s;

export type RefreshState = "siap" | "sudah_hari_ini" | "kuota_habis" | "tanpa_jatah" | "tidak_tersedia" | "tidak_diketahui";

export function refreshState(l: { status: string; lastRefreshedAt: string | null }, quota: RefreshQuota | null | "gagal", now: Date = new Date()): RefreshState {
  if (l.status !== "published") return "tidak_tersedia";
  if (l.lastRefreshedAt && todayWIB(new Date(l.lastRefreshedAt)) === todayWIB(now)) return "sudah_hari_ini";
  if (quota === "gagal") return "tidak_diketahui"; // kuota gagal dibaca: tombol tetap boleh dicoba, server memutuskan
  if (quota === null) return "tanpa_jatah"; // jatah harian efektif 0 (bawaan diubah jadi 0 dan tanpa tambahan)
  // Jatah harian habis tetap bisa refresh selama saldo add-on masih ada (dipakai urutan: gratis, bonus, add-on).
  return quota.usedToday >= quota.allowance && (quota.stockRemaining ?? 0) <= 0 ? "kuota_habis" : "siap";
}

export type DetailActions = { edit: boolean; publish: boolean; markSold: boolean; markRented: boolean; duplicate: boolean; remove: boolean; resubmit: boolean };

/** Aksi yang ditawarkan menurut status (tombol lain tidak ditampilkan). Terjual hanya untuk transaksi jual, tersewa hanya untuk sewa. */
export function detailActions(l: { status: string; transactionType: "sale" | "rent" }): DetailActions {
  const published = l.status === "published";
  return {
    edit: !["suspended"].includes(l.status),
    publish: l.status === "draft",
    resubmit: l.status === "rejected",
    markSold: published && l.transactionType === "sale",
    markRented: published && l.transactionType === "rent",
    duplicate: true,
    remove: ["draft", "rejected", "expired", "sold", "rented"].includes(l.status),
  };
}

/** Pesan galat penerbitan: kuota habis (409 listing_quota_exhausted) diberi kalimat yang bisa ditindaklanjuti. */
export function publishErrorMessage(err: { code?: string; message?: string; details?: unknown } | null | undefined): string {
  const reason = (err?.details as { reason?: string } | undefined)?.reason;
  if (reason === "listing_quota_exhausted") return "Kuota penerbitan habis. Listing tetap tersimpan sebagai draf; terbitkan lagi setelah kuota tersedia (reset tanggal 1 atau beli slot).";
  return err?.message || "Gagal menerbitkan listing. Coba lagi beberapa saat lagi.";
}
